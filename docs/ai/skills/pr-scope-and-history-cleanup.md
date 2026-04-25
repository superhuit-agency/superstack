# Skill: PR Scope and History Cleanup

Use this skill when a branch/PR contains unintended files, mixed concerns, or noisy commit history.

## Goal

Produce a focused PR containing only intended changes with clear, reviewable history.

## Required Pre-Checks

1. Confirm target base branch.
2. Confirm exactly which files/topics should remain in PR.
3. Confirm whether history rewrite is allowed or if follow-up cleanup commits are preferred.

## Where to Look

- Branch state and divergence:
  - `git status`
  - `git log --oneline --decorate`
  - `git diff --name-only <base>...HEAD`
- Commit/file mapping:
  - `git show --name-only <sha>`

## Change Rules

1. Prefer non-destructive cleanup first (revert/restore + cleanup commit).
2. Use cherry-pick into a fresh branch when PR is heavily mixed.
3. Avoid force-push unless explicitly approved and safe.
4. Keep commit messages explicit about scope cleanup.
5. Re-verify PR file list after cleanup.

## Safety Rules

1. Never use destructive git commands without explicit user approval.
2. If branch was already shared, prefer additive cleanup over history rewrite.
3. Confirm final PR scope before pushing.

## Verification Checklist

1. `git diff --name-only <base>...HEAD` matches intended files only.
2. `git log --oneline` reflects understandable commit intent.
3. Local checks/hooks still pass after cleanup.
4. No accidental inclusion of unrelated generated files.

## Output Format For AI Agent

1. Original issue (what was mixed/unwanted).
2. Cleanup strategy used and why.
3. Final PR file scope.
4. Any remaining trade-offs.
