/* eslint-disable no-console */

/**
 * This script fetches the FSE templates and template parts from the WordPress instance
 * and stores them in the src/lib/fse/fse-templates-and-parts.json file
 * in order to be used by the Next.js app for templating the pages.
 */

import fs from "node:fs";
import path from "node:path";

import { getWpGraphqlUrl } from "@/utils/node-utils";
import formatBlocksJSON from "../src/lib/format-blocks-json";

const WORDPRESS_GRAPHQL_URL = getWpGraphqlUrl();

type GraphQlNode = {
  slug: string;
  area?: string;
  blocksJSON?: string;
};

type GraphQlResponse = {
  templates?: { nodes?: GraphQlNode[] };
  templateParts?: { nodes?: GraphQlNode[] };
};

async function fetchGraphQL(
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphQlResponse> {
  const res = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const text = await res.text();
  let json: { data?: GraphQlResponse; errors?: Array<{ message: string }> };
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(
      `Failed to parse WPGraphQL response: ${text.slice(0, 500)}`,
    );
  }

  if (json.errors?.length) {
    const msg = json.errors.map((e) => e.message).join("\n");
    throw new Error(`WPGraphQL returned errors:\n${msg}`);
  }

  return json.data ?? {};
}

async function fetchAllTemplateParts() {
  const query = `
    query TemplateParts {
      templateParts(first: 99) {
        nodes {
          area
          slug
          blocksJSON
        }
      }
    }
  `;

  const data = await fetchGraphQL(query);
  return data?.templateParts?.nodes ?? [];
}

async function fetchAllTemplates() {
  const query = `
    query Templates {
      templates(first: 99) {
        nodes {
          slug
          blocksJSON
        }
      }
    }
  `;

  const data = await fetchGraphQL(query);
  return data?.templates?.nodes ?? [];
}

async function main() {
  if (process.env.FSE_SKIP_FETCH === "1") {
    console.log("[fse] Skipped (FSE_SKIP_FETCH=1)");
    return;
  }

  console.log(`[fse] Fetching templateParts from: ${WORDPRESS_GRAPHQL_URL}`);

  const [templateParts, templates] = await Promise.all([
    fetchAllTemplateParts(),
    fetchAllTemplates(),
  ]);

  const templatesCombined = await Promise.all(
    templates.map(async (template) => {
      const blocks = await formatBlocksJSON(template.blocksJSON ?? "");

      const formattedBlocks = await Promise.all(
        blocks.map(async (block: any) => {
          // For each block of type 'core/template-part', replace with the actual block from templateParts.
          if (block?.name === "core/template-part") {
            const templatePart = templateParts.find(
              (part) => part.slug === block?.attributes?.slug,
            );
            const formattedTemplatePart = await formatBlocksJSON(
              templatePart?.blocksJSON ?? "",
            );
            return {
              ...block,
              attributes: {
                ...(block?.attributes ?? {}),
                ...(templatePart?.area ? { area: templatePart.area } : {}),
              },
              innerBlocks: formattedTemplatePart,
            };
          }
          return block;
        }),
      );

      return {
        slug: template.slug,
        blocks: formattedBlocks,
      };
    }),
  );

  const out = {
    generatedAt: new Date().toISOString(),
    templates: templatesCombined,
  };

  const outDir = path.join(__dirname, "../src/lib/fse");
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, "fse-templates-and-parts.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");

  console.log(`[fse] Wrote ${outPath}`);
  console.log(
    `[fse] templates=${templatesCombined.length}, templateParts=${templateParts.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
