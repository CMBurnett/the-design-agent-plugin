# TheDesignAgent plugin

A design agent in your coding agent's loop, for Claude Code, Grok Build, Codex, Cursor, VS Code with GitHub Copilot, and other clients that load [Agent Plugins](https://agent-plugins.org). It works in layers:

- **Before you build:** a brief calibrated to your project, its users and the screen (`Discover`).
- **After you build:** a 0–10 score with findings for UX and visual design (`Ux`, `Visual`), from a real screenshot when the page is running.
- **Project memory:** every agent on the repo shares the same project context through a `.thedesignagent` file, and each review shapes the next brief.

## Install

In Claude Code:

```
/plugin marketplace add CMBurnett/the-design-agent-plugin
/plugin install tda@thedesignagent
```

You'll be asked for your API key. If you weren't, or the tools don't appear, set it in Manage Plugins → TheDesignAgent → configure (gear icon), then restart Claude. Get one at [thedesignagent.ai/dashboard/api-keys](https://www.thedesignagent.ai/dashboard/api-keys).

Grok Build reads Claude Code plugins, so the same install works there.

Requires Node.js 20+ (the MCP server runs through `npx`).

After installing or updating the plugin, fully restart Claude Code (in VS Code: Command Palette → Developer: Reload Window). Reloading plugins refreshes skills and hooks but keeps the old MCP server running.

### Codex, VS Code, GitHub Copilot CLI, Cursor and other Agent Plugins clients

The same repo is an [Agent Plugins 1.0](https://agent-plugins.org) package (`plugin.json`, `mcp.json`, `skills/`). These clients have no standard way to ask for an API key, so save it once first:

```
npx -y --package=@thedesignagent/mcp thedesignagent login
```

It goes to `~/.thedesignagent/credentials`, readable only by you, and every client (and the `thedesignagent` CLI) uses it. Then install:

- **Codex:** `codex plugin marketplace add CMBurnett/the-design-agent-plugin`, then `codex plugin add tda@thedesignagent`.
- **VS Code:** Command Palette → **Chat: Install Plugin From Source** → `https://github.com/CMBurnett/the-design-agent-plugin`.
- **GitHub Copilot CLI:** `copilot plugin install CMBurnett/the-design-agent-plugin`.
- **Cursor and others:** install from the repo URL if the client supports Agent Plugins; otherwise add the MCP server on its own (see [`@thedesignagent/mcp`](https://www.npmjs.com/package/@thedesignagent/mcp)).

### Cursor

The Cursor plugin (`.cursor-plugin/`) uses the hosted server, so there's no key to save: after installing, Cursor shows TheDesignAgent as needing a login; click it and sign in to your TheDesignAgent account in the browser. The hosted server reviews public pages and preview deploys. To screenshot pages on `localhost`, add the local server from [`@thedesignagent/mcp`](https://www.npmjs.com/package/@thedesignagent/mcp) as well.

### Gemini CLI

```
gemini extensions install https://github.com/CMBurnett/the-design-agent-plugin
```

Then run `/mcp auth thedesignagent` and sign in in the browser. `GEMINI.md` tells Gemini when to call the tools.

Outside Claude Code you get the MCP server and the skills (`design-loop`, `setup`, `brief`, `review`, `design-md`); the session-start and after-edit hooks are Claude Code only.

## What's included

| Piece | What it does |
| --- | --- |
| MCP server `the_design_agent` | The `Discover`, `Ux` and `Visual` tools ([`@thedesignagent/mcp`](https://www.npmjs.com/package/@thedesignagent/mcp)) |
| Skill `design-loop` | Teaches the agent the brief → build → review → fix loop. Loads automatically for UI work |
| `/tda:setup` | Set up a repo once: registers the project (`.thedesignagent`), creates `DESIGN.md` if missing, and sets up automatic login for screenshots. Runs automatically before the first UI task |
| `/tda:brief [task]` | Get a build brief for a screen |
| `/tda:review [url\|file]` | Score a page, a file, or every UI file changed on the branch |
| Skill `design-md` | Write or update the project's `DESIGN.md` from its real tokens |
| Hooks | At session start: prompts setup in UI repos that aren't registered yet. After UI files change: reminds the agent to run a review (first edit, then every 8th) |

## Screenshots and pages behind login

`Visual` screenshots the page in a headless browser. The agent starts your dev server if it isn't running.

For pages behind login, `/tda:setup` sets up automatic login:

- **Supabase apps:** a login recipe, `.thedesignagent-login.mjs`, that signs in a dedicated test user with no browser (from `skills/setup/assets/login-supabase.mjs`). It holds no secrets and can be committed.
- **Passkey-only apps:** optionally, a dev-only login route the recipe can call (only with your approval, since it changes app code).
- **Anything else:** the agent opens a browser window for you to log in once; it saves and closes by itself.

If a session expires, `Visual` stops before reviewing (nothing is charged) and the agent refreshes the session the same way.

## Developing this plugin

Load it from a local checkout without installing:

```
claude --plugin-dir ./the-design-agent-plugin
```

To test against a local build of the MCP server, add a `.mcp.json` in the repo you test in whose `thedesignagent` server runs `node <path-to>/the-design-agent/mcp-server/dist/index.js` with `THEDESIGNAGENT_API_KEY` set.

Test the hook on its own:

```
echo '{"session_id":"t","tool_input":{"file_path":"app/page.tsx"}}' | node scripts/ui-edit-nudge.mjs
```

Validate before a release:

```
claude plugin validate .
```

## Support

Email [thedesignagent@borntall.com](mailto:thedesignagent@borntall.com) or see [thedesignagent.ai/support](https://www.thedesignagent.ai/support). Privacy policy and terms: [thedesignagent.ai/privacy](https://www.thedesignagent.ai/privacy), [thedesignagent.ai/terms](https://www.thedesignagent.ai/terms).

## License

MIT. See [LICENSE](LICENSE).
