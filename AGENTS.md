# Superstack AI Assistant Guidance

Superstack is a monorepo starter for headless WordPress + Next.js projects with deployment automation.

## Universal Rules

- Keep changes minimal, focused, and aligned with existing project patterns.
- Reuse existing utilities and conventions before adding new abstractions.
- Ask clarifying questions when requirements are ambiguous or risky.
- Do not add or remove code comments unless explicitly requested.
- Never expose secrets or credentials in code, docs, or commands.
- Do not run destructive git operations unless explicitly requested.

## Task Playbooks

- Gutenberg block work:
  - `docs/ai/skills/wordpress-block-change.md`
- Next-WordPress data contract work:
  - `docs/ai/skills/next-wordpress-data-flow.md`
- Deployment/workflow/provisioning work:
  - `docs/ai/skills/deployment-change-safely.md`

If a task spans multiple areas, combine the relevant playbooks before editing.
