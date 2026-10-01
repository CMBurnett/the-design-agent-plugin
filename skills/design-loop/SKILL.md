---
name: design-loop
description: Use when building or changing a UI screen, page or component and TheDesignAgent's MCP tools (Discover, Ux, Visual) are available. Get a build brief before building, then score the result and fix what the review finds.
user-invocable: false
---

# The design loop

TheDesignAgent gives you a brief before you build a screen and a scored review after. Follow this loop for any screen-sized UI task. Skip it for one-line style tweaks.

```
identify project → discover → build → ux + visual → fix → (re-check once)
```

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
- `Visual`: if the page runs locally, pass `render_url` (for example `http://localhost:3000/approvals`) so it screenshots the real render. Without it, `Visual` falls back to reading code, which is weaker.

**Pages behind login:** `Visual` returns an auth-required message with a capture command. Stop and show the user that exact command. If `thedesignagent-auth` isn't installed, give the npx form:
`npx -y --package=@thedesignagent/mcp thedesignagent-auth capture <origin>`
Don't try to work out the app's auth or build `auth_seed` yourself.

## 4. Act on the findings

- Fix every **critical** and **high** finding. Fix medium ones when the change is small and local.
- Re-run the tool that flagged them **once** to confirm. Don't loop on scores.
- Tell the user the before and after scores and what you changed, in a few lines.
- If a finding conflicts with an explicit user instruction, keep the instruction and mention the finding.

## When things go wrong

- **Account error**: show the user the message and stop calling the tools. Don't retry.
- **Rate limited**: wait briefly, retry once, then carry on without the review.
- **Authentication failed**: the API key is missing or wrong. Tell the user to set it in the plugin's settings (`/plugin` → TheDesignAgent → configure).
- **Pipeline unavailable**: carry on with the build and say the review couldn't run.
