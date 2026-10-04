---
name: setup
description: Set up a repo for TheDesignAgent - register the project and create DESIGN.md if it's missing. Use before the first TheDesignAgent brief, build or review in a repo with no .thedesignagent file.
---

# Set up this repo for TheDesignAgent

Run this once per repo. It leaves files to commit: `.thedesignagent` (the project's identity, shared by every agent on the repo), `DESIGN.md` (the design system the visual review checks against) and, for apps with login, usually `.thedesignagent-login.mjs` (how screenshots sign in).

## 0. Check the tools are available

TheDesignAgent's tools are named `Discover`, `Ux` and `Visual`. If they aren't available in this session, stop. Don't set anything up by hand and don't substitute your own review. Tell the user:

> TheDesignAgent's server isn't connected, usually because it has no API key. In Claude Code, open Manage Plugins → TheDesignAgent → configure (gear icon), paste your `tda_` key, then restart. In other clients, run `npx -y --package=@thedesignagent/mcp@0.4.3 thedesignagent login`, paste your key, then restart the client.

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

## 4. Automatic login for screenshots (if the app has login)

`Visual` screenshots pages in a headless browser, so pages behind login need a saved session. Set this up now so reviews don't stall later. Skip this step if the app has no login.

**Supabase Auth with `@supabase/ssr`** (check `package.json` and how the server client is created): offer a login recipe. It signs in a dedicated test user with no browser.

1. Ask the user which test user to sign in as. Suggest `tda-test@<their domain>`. Say plainly that the recipe will create that user in the Supabase project `.env.local` points at if it doesn't exist. If that's a shared or production project, confirm before going ahead.
2. Copy this skill's template, `assets/login-supabase.mjs` (in the same folder as this SKILL.md), to the repo root as `.thedesignagent-login.mjs`. Set `TEST_EMAIL` and `APP_URL` (the local dev URL) at the top. If the app sets `cookieOptions.name` when creating its Supabase client, set `COOKIE_NAME_OVERRIDE` to that name.
3. Make sure the dev server is running (see the design-loop skill), then test it against a page behind login:

   ```
   node .thedesignagent-login.mjs | npx -y --package=@thedesignagent/mcp@0.4.3 thedesignagent-auth login <a protected page URL>
   ```

   `TDA_AUTH_SAVED` means it works. The recipe holds no secrets (it reads keys from `.env.local` at run time), so it can be committed.
4. If it prints `TDA_AUTH_FAILED session not accepted`, the app needs more than a signed-in user: a role or permission, a passkey or MFA step, onboarding. Tell the user what blocked it and offer either to give the test user what it needs, or to add a dev-only login route (below). Don't change app code or user data without a yes.

**Passkey-only or other auth the recipe can't satisfy:** offer a **dev-only login route**, for example `/__dev/login`, that signs in the test user and completes whatever the app requires. It must return 404 unless `NODE_ENV === 'development'` and must check a secret from `.env.local`. Then write `.thedesignagent-login.mjs` to print that route's URL (with the secret read from `.env.local` at run time). This changes app code, so explain it and wait for approval.

**Anything else, or if the user declines:** offer to capture a session now by hand. Run `npx -y --package=@thedesignagent/mcp@0.4.3 thedesignagent-auth capture <a protected page URL>` in the background, ask the user to log in in the window that opens, and wait for `TDA_AUTH_SAVED`.

## 5. Report

Tell the user, in a few lines:

- the project as TheDesignAgent understood it (type, and the active job from the brief);
- the files created, and that they should commit `.thedesignagent`, `DESIGN.md` and `.thedesignagent-login.mjs` if one was made;
- how screenshots will log in (recipe, dev route, saved capture, or not set up);
- any DESIGN.md values you inferred rather than read, for them to confirm.
