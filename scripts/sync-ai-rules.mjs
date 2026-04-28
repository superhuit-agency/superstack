import { mkdir, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the repository root from this script location.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Shared header for generated compatibility files.
const generatedHeader = (target) =>
  [
    "<!-- GENERATED FILE: do not edit directly -->",
    `<!-- Source: AGENTS.md -->`,
    `<!-- Target: ${target} -->`,
    "",
  ].join("\n");

// Minimal Copilot instructions that point to AGENTS.md.
const copilotDoc = [
  generatedHeader(".github/copilot-instructions.md"),
  "# Copilot Instructions",
  "",
  "Use `AGENTS.md` as the canonical instruction source for this repository.",
  "For task-specific behavior, follow the skill files referenced from `AGENTS.md`.",
  "",
].join("\n");

// Ensure target folder exists, then write Copilot instructions.
await mkdir(path.join(rootDir, ".github"), { recursive: true });
await writeFile(path.join(rootDir, ".github/copilot-instructions.md"), copilotDoc, "utf8");

// Keep CLAUDE.md as a symlink to AGENTS.md for single-source behavior.
const claudePath = path.join(rootDir, "CLAUDE.md");
await rm(claudePath, { force: true });
await symlink("AGENTS.md", claudePath);

// Print success feedback for local/CI runs.
console.log("AI rule files synchronized from AGENTS.md");
