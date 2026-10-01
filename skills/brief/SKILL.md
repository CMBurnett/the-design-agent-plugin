---
name: brief
description: Get a TheDesignAgent build brief for a screen before building it.
argument-hint: "[what you're building]"
disable-model-invocation: true
---

Get a build brief from TheDesignAgent for: $ARGUMENTS

If TheDesignAgent's tools (`Discover`, `Ux`, `Visual`) aren't available in this session, stop. Don't write a brief or review yourself in their place. Tell the user the server isn't connected, usually because the plugin has no API key: Manage Plugins → TheDesignAgent → configure (gear icon) → paste their `tda_` key → restart Claude.

If no task was given, ask the user in one line what screen they're about to build.

Follow steps 1 and 2 of the design-loop skill: identify the project, call `Discover`, and handle `needs_setup` or `model_stale` by extracting the project model yourself and calling again.

Then show the user the brief, lightly trimmed, and ask whether to start building from it.
