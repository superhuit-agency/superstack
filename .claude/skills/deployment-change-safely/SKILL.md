---
description: Apply deployment-related changes safely in this stack. Use when modifying GitHub Actions workflows, composite actions, provisioning scripts, deploy scripts, or deployment documentation.
compatibility: Superstack — headless WordPress + Next.js monorepo
---

## Goal

Apply deployment updates without regressions in environment handling, release flow, or secret usage.

## Required Pre-Checks

1. Confirm target environment(s): `future`, `staging`, `production`, or custom.
2. Confirm whether deployment path is Vercel, SSH, or both.
3. Identify every affected file before editing.
4. Read `docs/setup/deployment.md` and align behavior with it.

## Where to Look

- Workflows: `.github/workflows/*.yml`
- Composite actions: `.github/actions/**/action.yml`
- Provisioning/deploy scripts: `wordpress/scripts/*.sh`
- Deployment docs: `docs/setup/deployment.md`
- Example env contracts: `.env.github.example`

## Change Rules

1. Keep changes minimal and specific to the requested deploy behavior.
2. Keep required vars/secrets checks aligned with real action inputs.
3. Do not remove safety checks unless explicitly requested.
4. Preserve idempotent provisioning behavior.
5. Avoid unrelated refactors in deployment files.

## Safety Rules

1. Never hardcode secrets, tokens, SSH keys, or credentials.
2. Confirm before changing branch triggers or production execution paths.
3. Confirm before changing rollback/cleanup behavior.
4. If deployment docs and workflows diverge, update both in the same task.

## Verification Checklist

1. Validate YAML syntax and key paths after edits.
2. Verify required vars/secrets lists still match usage in steps/actions.
3. Confirm workflow triggers and `if` conditions reflect intended environment behavior.
4. Confirm docs remain accurate for changed flow.
5. Confirm no unrelated file changes.

## Output Format

1. What deployment behavior changed and why.
2. Which files were updated.
3. What was verified (syntax, conditions, env contract alignment).
4. Any risk notes and follow-up actions.
