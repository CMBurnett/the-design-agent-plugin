#!/usr/bin/env node
// PostToolUse hook: after a UI file changes, remind the agent to run a TheDesignAgent review.
// Fires on the first UI edit in a session, then every EVERY-th one, so it doesn't nag.
// Always exits 0: a reminder must never block an edit.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const UI_FILE = /\.(tsx|jsx|vue|svelte|astro|html|css|scss)$/i
const NOT_UI = /\.(test|spec|stories)\.[^.]+$/i
const EVERY = 8

try {
  const input = JSON.parse(readFileSync(0, 'utf8'))
  const file = input?.tool_input?.file_path ?? ''
  if (!UI_FILE.test(file) || NOT_UI.test(file)) process.exit(0)

  const dir = process.env.CLAUDE_PLUGIN_DATA || join(tmpdir(), 'thedesignagent-plugin')
  mkdirSync(dir, { recursive: true })
  const session = String(input.session_id ?? 'default').replace(/[^\w-]/g, '')
  const counterFile = join(dir, `ui-edits-${session}.txt`)

  let count = 0
  try { count = Number(readFileSync(counterFile, 'utf8')) || 0 } catch {}
  count += 1
  writeFileSync(counterFile, String(count))

  if (count !== 1 && count % EVERY !== 0) process.exit(0)

  const message = [
    `UI file changed: ${file}.`,
    'When this screen is done, review it with TheDesignAgent: call the `Ux` tool,',
    'and `Visual` with `render_url` if the page is running locally.',
    'The design-loop skill has the steps.',
  ].join(' ')

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: message },
  }))
} catch {
  // Malformed input or an unwritable data dir: stay silent.
}
process.exit(0)
