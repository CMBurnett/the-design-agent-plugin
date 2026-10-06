# Installing TheDesignAgent's MCP server

These steps are for an AI agent setting up TheDesignAgent for its user. TheDesignAgent gives coding agents a design brief before building a screen (`Discover`) and a scored UX and visual review after (`Ux`, `Visual`).

## Option 1: hosted server (no install)

Add a remote MCP server with streamable HTTP transport:

- URL: `https://www.thedesignagent.ai/mcp`
- Authentication: if the client supports MCP authorization (OAuth), add the URL with no headers; the client opens a browser for the user to sign in. Otherwise, ask the user for their TheDesignAgent API key (it starts with `tda_`; they get one at https://www.thedesignagent.ai/dashboard/api-keys) and send it as the header `Authorization: Bearer tda_...`.

Example for clients configured with JSON (such as Cline's `cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "thedesignagent": {
      "type": "streamableHttp",
      "url": "https://www.thedesignagent.ai/mcp",
      "headers": { "Authorization": "Bearer tda_..." }
    }
  }
}
```

The hosted server screenshots public pages and preview deploys, not `localhost`.

## Option 2: local server (screenshots `localhost` too)

Requires Node.js 20 or later. Ask the user for their API key, then:

```json
{
  "mcpServers": {
    "thedesignagent": {
      "command": "npx",
      "args": ["-y", "--package=@thedesignagent/mcp", "thedesignagent-mcp"],
      "env": { "THEDESIGNAGENT_API_KEY": "tda_..." }
    }
  }
}
```

Keep the `--package=` form: the package has two commands, so `npx @thedesignagent/mcp` on its own won't start. To keep the key out of config files, the user can run `npx -y --package=@thedesignagent/mcp thedesignagent login` once and drop the `env` line.

## Check it works

List the server's tools: you should see `Discover`, `Ux` and `Visual`. Then call `Discover` with a one-line task, such as "a settings page for a B2B invoicing app". In a new project the first call asks for a short project model; follow the instructions in the response.

## Using it

Call `Discover` before building a screen, build from the brief, then call `Ux` (and `Visual` for a running page) on the result and fix high and critical findings. Save the returned `project_id` in a `.thedesignagent` file at the repo root and send it on later calls.
