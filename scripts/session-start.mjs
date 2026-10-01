#!/usr/bin/env node
// SessionStart hook: make TheDesignAgent's state explicit at the start of every session.
//  - No API key → tell the user where to set it, and tell Claude the tools are unavailable
//    so it doesn't quietly substitute its own review.
//  - Key set but the repo isn't registered (.thedesignagent missing) in a UI project →
//    tell Claude to run the setup skill before the first UI task.
//  - Registered but no DESIGN.md → tell Claude to offer one.
// Always exits 0: session start must never be blocked.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const UI_DEPS = /"(react|next|vue|nuxt|svelte|@sveltejs\/kit|astro|solid-js|@angular\/core|preact|remix|@remix-run\/react)"\s*:/

function isUiProject(dir) {
  try {
    return UI_DEPS.test(readFileSync(join(dir, 'package.json'), 'utf8'))
  } catch {
    return false
  }
}

function emit(context, userMessage) {
  const out = { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context } }
  if (userMessage) out.systemMessage = userMessage
  process.stdout.write(JSON.stringify(out))
}

try {
  let input = {}
  try { input = JSON.parse(readFileSync(0, 'utf8')) } catch {}
  const dir = input.cwd || process.cwd()
  const key = (process.env.CLAUDE_PLUGIN_OPTION_API_KEY || '').trim()

  if (!key) {
    emit(
      [
        "TheDesignAgent's tools are unavailable this session: the plugin has no API key, so its MCP server didn't start.",
        "If the user asks for a TheDesignAgent brief or review (/tda:brief, /tda:review, /tda:setup), don't do the review yourself.",
        'Tell them to set the key: Manage Plugins → TheDesignAgent → configure (gear icon) → paste their tda_ key → restart Claude.',
      ].join(' '),
      'TheDesignAgent needs your API key. Open Manage Plugins → TheDesignAgent → configure (gear icon), paste your tda_ key, then restart Claude.',
    )
  } else if (!existsSync(join(dir, '.thedesignagent'))) {
    if (isUiProject(dir)) {
      emit([
        "This repo isn't set up with TheDesignAgent yet (no .thedesignagent file).",
        'Before the first UI brief, build or review in this session, run the tda:setup skill: it registers the project and creates DESIGN.md if missing.',
        "Say in one line that you're doing it. Don't run it for non-UI work.",
      ].join(' '))
    }
  } else if (!existsSync(join(dir, 'DESIGN.md'))) {
    emit(
      "This repo is registered with TheDesignAgent but has no DESIGN.md, so visual reviews can't check brand compliance. Before the first UI task, offer once to create it with the tda:design-md skill.",
    )
  }
} catch {
  // Stay silent on any unexpected error.
}
process.exit(0)
