# AI Setup

This project uses an AGENTS-first setup with minimal compatibility files.

## Canonical Files

- `AGENTS.md` is the canonical AI instruction file for the repository.
- `CLAUDE.md` is a symlink to `AGENTS.md`.
- `.github/copilot-instructions.md` is generated from `AGENTS.md` for Copilot compatibility.

## Sync Flow

- Run `npm run ai:sync-rules` to:
  1. regenerate `.github/copilot-instructions.md`
  2. recreate `CLAUDE.md -> AGENTS.md` symlink
- The pre-commit hook runs this automatically and stages related files.

## Skills

- Single source of truth: `.agents/skills`
- Tool compatibility symlinks:
  - `.claude/skills -> ../.agents/skills`
  - `.cursor/skills -> ../.agents/skills`

Current skills:
- `grill-me`
- `ubiquitous-language`

## Ubiquitous Language Skill

Use `ubiquitous-language` to build and maintain a shared domain glossary in `UBIQUITOUS_LANGUAGE.md`.

- **How to run**
  - Explicitly invoke `/ubiquitous-language` in chat when you want to extract or refresh domain terms.
  - The agent may also auto-apply it when requests mention domain-modeling terms (for example: "DDD", "domain model", "glossary", "ubiquitous language").
- **Execution scope**
  - The skill scans the current chat context where it is executed.
  - On rerun, it also reads existing `UBIQUITOUS_LANGUAGE.md` and updates it based on new discussion.
- **Token usage**
  - Cost mainly depends on current chat length and glossary size.
  - Running it occasionally at milestones keeps usage predictable.
  - Running it repeatedly in long chats increases token usage.
