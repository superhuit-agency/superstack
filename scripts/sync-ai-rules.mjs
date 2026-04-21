// Node.js utilities for filesystem access and path handling.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve absolute paths for this script and the project root.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load the single source-of-truth AI guidance document.
const sourcePath = path.join(rootDir, "docs/ai/assistant-guidance.md");
const source = (await readFile(sourcePath, "utf8")).trim();

// Reusable metadata header injected into generated markdown files.
const generatedHeader = (target) =>
  [
    "<!-- GENERATED FILE: do not edit directly -->",
    `<!-- Source: docs/ai/assistant-guidance.md -->`,
    `<!-- Target: ${target} -->`,
    "",
  ].join("\n");

// Build Cursor-compatible rule content with required frontmatter.
const cursorRule = [
  "---",
  "description: Core AI collaboration rules for this repository",
  "alwaysApply: true",
  "---",
  "",
  source,
  "",
].join("\n");

// Build CLAUDE.md output content from the canonical source.
const claudeDoc = [
  generatedHeader("CLAUDE.md"),
  "# CLAUDE Instructions",
  "",
  source,
  "",
].join("\n");

// Build AGENTS.md output content for generic agent ecosystems.
const agentsDoc = [
  generatedHeader("AGENTS.md"),
  "# AGENTS Instructions",
  "",
  source,
  "",
].join("\n");

// Build GitHub Copilot instructions output content.
const copilotDoc = [
  generatedHeader(".github/copilot-instructions.md"),
  "# Copilot Instructions",
  "",
  source,
  "",
].join("\n");

// Ensure all target directories exist before writing files.
await mkdir(path.join(rootDir, ".cursor/rules"), { recursive: true });
await mkdir(path.join(rootDir, ".github"), { recursive: true });
await mkdir(path.join(rootDir, ".cursor"), { recursive: true });

// Write synchronized outputs for each supported assistant format.
await writeFile(path.join(rootDir, ".cursor/rules/ai-core.mdc"), cursorRule, "utf8");
await writeFile(path.join(rootDir, "CLAUDE.md"), claudeDoc, "utf8");
await writeFile(path.join(rootDir, "AGENTS.md"), agentsDoc, "utf8");
await writeFile(path.join(rootDir, ".github/copilot-instructions.md"), copilotDoc, "utf8");

// Print a clear success message for terminal feedback.
console.log("AI rule files synchronized from docs/ai/assistant-guidance.md");
