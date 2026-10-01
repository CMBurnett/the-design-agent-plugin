---
name: review
description: Score a UI with TheDesignAgent's ux and visual reviews and list what to fix.
argument-hint: "[url | file | nothing for changed UI files]"
disable-model-invocation: true
---

Review this UI with TheDesignAgent: $ARGUMENTS

Work out what to review:

- **A URL** (e.g. `http://localhost:3000/checkout`): call `visual` with it as `render_url`, and `ux` with the code for that route as `artifact`.
- **A file**: call `ux` and `visual` with its contents as `artifact`. If the dev server is running and you can tell which route renders it, pass `render_url` too.
- **Nothing**: review the UI files changed on this branch (`git diff --name-only` against the default branch, filtered to `.tsx .jsx .vue .svelte .astro .html .css`). Group files by screen and review each screen once. If more than 5 screens changed, ask which to review first.

Use the project identity from step 1 of the design-loop skill, and a `task` that names what the screen is for.

Report for each screen:

1. The `ux` and `visual` scores (0–10).
2. Critical and high findings, one line each, with the file and line where you can place them.
3. The fixes you'd make.

Then ask whether to apply the fixes. Don't edit files until the user says yes.
