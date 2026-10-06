# TheDesignAgent

TheDesignAgent's tools give you design judgment for UI you build. Use them on every screen, page or component you create or change.

1. **Before building a screen, call `Discover`** with a one-line task describing what the user is trying to get done. It returns the job, the heuristics and patterns that apply, and the project's design tokens. Build from that brief.
2. **After building, call `Ux`** with the same task and the code you wrote (or the page's URL as `render_url` with `Visual`). Call **`Visual`** when the page is running somewhere reachable: a public or preview URL.
3. **Fix high and critical findings**, then review once more. Report the scores to the user.

The first `Discover` in a new project asks for a short project model: scan the repo as the response explains and call again. Save the returned `project_id` in a `.thedesignagent` file at the repo root and send it on later calls.

If the tools aren't connected, run `/mcp auth thedesignagent` and sign in to your TheDesignAgent account in the browser.
