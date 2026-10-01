---
name: setup
description: Set up a repo for TheDesignAgent - register the project and create DESIGN.md if it's missing. Use before the first TheDesignAgent brief, build or review in a repo with no .thedesignagent file.
---

# Set up this repo for TheDesignAgent

Run this once per repo. It leaves two files to commit: `.thedesignagent` (the project's identity, shared by every agent on the repo) and `DESIGN.md` (the design system the visual review checks against).

## 0. Check the tools are available

TheDesignAgent's tools are named `Discover`, `Ux` and `Visual`. If they aren't available in this session, stop. Don't set anything up by hand and don't substitute your own review. Tell the user:

> TheDesignAgent's server isn't connected, usually because the plugin has no API key. Open Manage Plugins → TheDesignAgent → configure (gear icon), paste your `tda_` key, then restart Claude.

## 1. Already set up?

If `.thedesignagent` exists in the repo root, say so and skip to step 3.

## 2. Register the project

1. Write a one-line `task` describing the product and its main screen, from README, CLAUDE.md or AGENTS.md (for example "Order desk app: the incoming orders queue").
2. Call `Discover` with that `task` and `repo_hash` (SHA-256 of the git remote URL: `git remote get-url origin | tr -d '\n' | shasum -a 256 | cut -d' ' -f1`).
3. It returns **Setup Required** with an extraction task. Do the extraction yourself: read CLAUDE.md or AGENTS.md, schema, migration and type files, and modules, and build the `project_model` it describes. Set `schema_hash` to the SHA-256 of the schema/type files you read, concatenated in path order. Call `Discover` again with `project_id`, `project_model` and `schema_hash`.
4. On a **Build Brief**, write `.thedesignagent` in the repo root:

   ```json
   { "project_id": "<project_id from the response>" }
   ```

If the second call still returns Setup Required, or returns a pipeline error (5xx), stop and show the user the response. Keep the extracted model in the conversation so a retry is one call.

## 3. Create DESIGN.md if missing

If there's no `DESIGN.md` in the repo root (check `docs/DESIGN.md` too, and use that path if it exists), follow the design-md skill to create one from the project's real tokens.

## 4. Report

Tell the user, in a few lines:

- the project as TheDesignAgent understood it (type, and the active job from the brief);
- the files created, and that they should commit `.thedesignagent` and `DESIGN.md`;
- any DESIGN.md values you inferred rather than read, for them to confirm.
