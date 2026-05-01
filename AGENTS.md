# Superstack AI Assistant Guidance

Superstack is a monorepo starter for headless WordPress + Next.js projects with deployment automation.

## Universal Rules

- Keep changes minimal, focused, and aligned with existing project patterns.
- Reuse existing utilities and conventions before adding new abstractions.
- Ask clarifying questions when requirements are ambiguous or risky.
- Do not add or remove code comments unless explicitly requested.
- Never expose secrets or credentials in code, docs, or commands.
- Do not run destructive git operations unless explicitly requested.

## Skills

Skills are stored in `.agents/skills` (single source of truth).

Available skills:
- `grill-me` (opt-in, only when user explicitly asks to be grilled)
- `ubiquitous-language`

For tools that support slash commands, use `/grill-me` or `/ubiquitous-language`.
For tools without slash support, follow the matching skill from `.agents/skills/<name>/SKILL.md`.

## Communication

- Keep responses concise and practical by default.
