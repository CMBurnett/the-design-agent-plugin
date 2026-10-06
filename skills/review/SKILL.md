---
name: review
description: Score a UI with TheDesignAgent's ux and visual reviews and list what to fix.
argument-hint: "[url | file | nothing for changed UI files]"
disable-model-invocation: true
---

Review this UI with TheDesignAgent: $ARGUMENTS

If TheDesignAgent's tools (`Discover`, `Ux`, `Visual`) aren't available in this session, stop. Don't write a brief or review yourself in their place. Tell the user the server isn't connected, usually because it has no API key. In Claude Code: Manage Plugins → TheDesignAgent → configure (gear icon) → paste their `tda_` key → restart. In other clients (Codex, Cursor, VS Code, Copilot): run `npx -y --package=@thedesignagent/mcp@0.5.2 thedesignagent login`, paste the key, then restart the client or reload its MCP servers.

Work out what to review:

- **A URL** (e.g. `http://localhost:3000/checkout`): call `Visual` with it as `render_url`, and `Ux` with the code for that route as `artifact`.
- **A file**: call `Ux` and `Visual` with its contents as `artifact`. If you can tell which route renders it, pass that as `render_url` too.

For any `render_url`, follow "Getting a real screenshot" in the design-loop skill: start the dev server if it isn't running, and handle a login wall the way `Visual` instructs.
- **Nothing**: review the UI files changed on this branch (`git diff --name-only` against the default branch, filtered to `.tsx .jsx .vue .svelte .astro .html .css`). Group files by screen and review each screen once. If more than 5 screens changed, ask which to review first.

Use the project identity from step 1 of the design-loop skill, and a `task` that names what the screen is for.

Report for each screen:

1. The `Ux` and `Visual` scores (0–10).
2. Critical and high findings, one line each, with the file and line where you can place them.
3. The fixes you'd make.

Then ask whether to apply the fixes. Don't edit files until the user says yes.
