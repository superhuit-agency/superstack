/**
 * This script fetches the FSE templates and template parts from the WordPress instance
 * and stores them in the src/lib/fse/fse-templates-and-parts.json file
 * in order to be used by the Next.js app for templating the pages.
 */

import fs from "fs";
import path from "path";

import fetchApi from "@/lib/fetch-api";
import formatBlocksJSON from "@/lib/format-blocks-json";
import { resolvePromises } from "@/utils/resolve-promises";
import { getWpDomain, getWpGraphqlUrl } from "@/utils/node-utils";

type GraphQlNode = {
  slug: string;
  area?: string;
  blocksJSON?: string;
};

const WORDPRESS_URL = getWpDomain();
const WORDPRESS_GRAPHQL_URL = getWpGraphqlUrl();

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

  const data = await fetchApi(query, { endpoint: WORDPRESS_GRAPHQL_URL });
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

  const data = await fetchApi(query, { endpoint: WORDPRESS_GRAPHQL_URL });  
  return data?.templates?.nodes ?? [];
}

async function main() {
  if (process.env.FSE_SKIP_FETCH === "1") {
    console.log("[fse] Skipped (FSE_SKIP_FETCH=1)");
    return;
  }

  console.log(`[fse] Fetching templateParts from ${WORDPRESS_URL}`);

  const [templateParts, templates] = await resolvePromises([
    fetchAllTemplateParts(),
    fetchAllTemplates(),
  ]);

  const templatesCombined = await resolvePromises(
    templates?.filter((t: GraphQlNode | null) => !!t)?.map(async (template: GraphQlNode) => {
      const blocks = await formatBlocksJSON(template.blocksJSON ?? "");

      const formattedBlocks = await resolvePromises(
        blocks.filter((b: BlockPropsType | null) => !!b).map(async (block: BlockPropsType) => {
          // For each block of type 'core/template-part', replace with the actual block from templateParts.
          if (block?.name === "core/template-part") {
            const templatePart = templateParts.find(
              (part: GraphQlNode) => part.slug === block?.attributes?.slug,
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
    templates: templatesCombined.filter(Boolean),
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
