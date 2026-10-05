---
name: design-loop
description: Use when building, changing or reviewing a UI screen, page or component. Gets a TheDesignAgent build brief before building (Discover), scores the result after (Ux, Visual) and fixes what the review finds.
user-invocable: false
---

# The design loop

TheDesignAgent gives you a brief before you build a screen and a scored review after. Follow this loop for any screen-sized UI task. Skip it for one-line style tweaks.

```
set up (once) → identify project → Discover → build → Ux + Visual → fix → (re-check once)
```

## 0. Check the tools, and set up once

If TheDesignAgent's tools (`Discover`, `Ux`, `Visual`) aren't available in this session, stop. Don't write a brief or review yourself in their place. Tell the user the server isn't connected, usually because it has no API key. In Claude Code: Manage Plugins → TheDesignAgent → configure (gear icon) → paste their `tda_` key → restart. In other clients (Codex, Cursor, VS Code, Copilot): run `npx -y --package=@thedesignagent/mcp@0.5.1 thedesignagent login`, paste the key, then restart the client or reload its MCP servers.

If the repo has no `.thedesignagent` file, run the setup skill first. It registers the project and creates DESIGN.md if missing.

## 1. Identify the project

Every call takes a project identity. Use the first that applies:

1. `.thedesignagent` exists in the repo root → read it and pass its `project_id`.
2. Otherwise → pass `repo_hash`, the SHA-256 of the git remote URL:
   `git remote get-url origin | tr -d '\n' | shasum -a 256 | cut -d' ' -f1`

## 2. Before building: `Discover`

Call `Discover` with `task` set to the screen you're about to build, in plain words ("Build the forecast approval queue"). Pass `codebase_context` if nearby code matters.

The response has one of three statuses:

- **Build Brief (ok)**: read the brief and follow it while you build. It names the user's job, the heuristics to apply, patterns and design tokens.
  - If it says to persist `project_id`, write `.thedesignagent` in the repo root as `{ "project_id": "<id>" }` and tell the user to commit it. Every agent on this repo then shares the same project context.
- **Setup Required (`needs_setup`)**: first call for this project. Do the extraction task it gives you: scan the repo (CLAUDE.md or AGENTS.md, schema and type files, modules) and build the `project_model` it describes. Set `schema_hash` to the SHA-256 of the schema/type files you read, concatenated in path order. Call `Discover` again with `project_model` and `schema_hash`.
- **Model Stale (`model_stale`)**: the schema changed since the model was stored. Re-extract as above and call again.

Do the extraction yourself; don't ask the user to do it.

## 3. After building: `Ux` and `Visual`

Call both with the same `task` and the project identity:

- `Ux`: pass the component code (or a precise description) as `artifact`. Scores heuristics, cognitive load, patterns and job fit.
- `Visual`: pass `render_url` (for example `http://localhost:3000/approvals`) so it screenshots the real render. Without it, `Visual` falls back to reading code, which is much weaker, so get a real screenshot whenever the screen has a route (next section).

## Getting a real screenshot

**1. Make sure the app is running.** Check whether the URL answers first. If nothing answers, start the dev server yourself:

- Pick the package manager from the lockfile (`pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb` → bun, otherwise npm) and run the `dev` script, in the background. In a monorepo, run it in the workspace that serves the screen.
- Wait until the URL answers with a 2xx or 3xx (poll every couple of seconds, up to about 90 seconds). Use the port the dev server prints if it isn't the one you expected.
- Tell the user in one line that you started it. When you're done with the review, stop it if you started it.

**2. Pages behind login.** If `Visual` says the page is behind login, it did not run and charged nothing. Follow its instructions, which will be one of:

- **The repo has a login recipe** (`.thedesignagent-login.mjs`): run the command it gives. It logs in a test user with no browser and prints `TDA_AUTH_SAVED`.
- **No recipe:** run the capture command it gives yourself, in the background. A browser window opens; tell the user in one line to log in there. It saves and closes by itself, then prints `TDA_AUTH_SAVED` (or `TDA_AUTH_FAILED` with a reason, and gives up after 10 minutes). Wait for it.

Then retry `Visual` once. If it's still blocked, report that and continue with `Ux` alone. Don't work out the app's auth scheme or build `auth_seed` yourself.

To check whether a session is already saved: `npx -y --package=@thedesignagent/mcp@0.5.1 thedesignagent-auth status <url>`.

## 4. Act on the findings

- Fix every **critical** and **high** finding. Fix medium ones when the change is small and local.
- Re-run the tool that flagged them **once** to confirm. Don't loop on scores.
- Tell the user the before and after scores and what you changed, in a few lines.
- If a finding conflicts with an explicit user instruction, keep the instruction and mention the finding.

## When things go wrong

- **Account error**: show the user the message and stop calling the tools. Don't retry.
- **Rate limited**: wait briefly, retry once, then carry on without the review.
- **Authentication failed** (the response itself is a 401 or 403): the user's API key is missing or wrong. Tell the user to set it: in Claude Code, in the plugin's settings; elsewhere, with `npx -y --package=@thedesignagent/mcp@0.5.1 thedesignagent login`.
- **Pipeline error** (a 5xx, such as `Pipeline error (503)`): a problem on TheDesignAgent's side, even if the detail mentions an API key; that is the pipeline's own key, not the user's. Tell the user the service is having trouble, keep any extracted `project_model` so a retry is one call, and carry on without the brief or review.
- **Pipeline unavailable**: carry on with the build and say the review couldn't run.
