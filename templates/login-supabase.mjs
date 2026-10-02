#!/usr/bin/env node
// TheDesignAgent login recipe for apps using Supabase Auth with @supabase/ssr.
//
// Signs in a dedicated TEST user and prints the session as cookies, for
// `thedesignagent-auth login` to apply and verify. No browser, no password.
//
//   node .thedesignagent-login.mjs | thedesignagent-auth login http://localhost:3000/dashboard
//
// How: the service-role key generates a magic-link token for the test user
// (creating the user if needed), exchanges it for a session, and encodes it the
// way @supabase/ssr stores it: cookie `sb-<project-ref>-auth-token`, value
// "base64-" + base64url(JSON session), split into .0/.1… past 3180 characters.
//
// Safety: runs against local dev only (set TDA_ALLOW_REMOTE=1 to override),
// never prints the session to a terminal, and only ever signs in TEST_EMAIL.
// Contains no secrets: keys are read from .env.local / .env at run time.

import { existsSync, readFileSync } from 'node:fs'

// ── Set by /tda:setup ─────────────────────────────────────────────────────────
const TEST_EMAIL = 'tda-test@example.com'
const APP_URL = 'http://localhost:3000'
// Only if the app overrides the cookie name via cookieOptions.name:
const COOKIE_NAME_OVERRIDE = null
// ──────────────────────────────────────────────────────────────────────────────

function fail(message) {
  console.error(`✗ login recipe: ${message}`)
  process.exit(1)
}

function loadEnv() {
  const env = { ...process.env }
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
      if (!m || env[m[1]] !== undefined) continue
      env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
  return env
}

if (process.stdout.isTTY) {
  fail('this prints a live session. Pipe it into the login command instead:\n  node .thedesignagent-login.mjs | thedesignagent-auth login ' + APP_URL)
}

const appHost = new URL(APP_URL).hostname
if (!['localhost', '127.0.0.1'].includes(appHost) && process.env.TDA_ALLOW_REMOTE !== '1') {
  fail(`refusing to sign in to ${appHost}: local dev only (set TDA_ALLOW_REMOTE=1 to override)`)
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL || env.PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY
if (!supabaseUrl) fail('no Supabase URL found (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL)')
if (!serviceKey) fail('no service-role key found (SUPABASE_SERVICE_ROLE_KEY)')

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
const api = (path, body) =>
  fetch(`${supabaseUrl}/auth/v1${path}`, { method: 'POST', headers, body: JSON.stringify(body) })
    .then(async r => ({ ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) }))

async function hashedToken() {
  let res = await api('/admin/generate_link', { type: 'magiclink', email: TEST_EMAIL })
  if (!res.ok && /not.?found|no user/i.test(JSON.stringify(res.data))) {
    const created = await api('/admin/users', { email: TEST_EMAIL, email_confirm: true })
    if (!created.ok) fail(`could not create test user ${TEST_EMAIL} (${created.status})`)
    res = await api('/admin/generate_link', { type: 'magiclink', email: TEST_EMAIL })
  }
  if (!res.ok) fail(`generate_link failed (${res.status}): ${res.data.msg || res.data.message || res.data.error_description || 'unknown'}`)
  const token = res.data.hashed_token ?? res.data.properties?.hashed_token
  if (!token) fail('generate_link returned no hashed_token')
  return token
}

const verified = await api('/verify', { type: 'magiclink', token_hash: await hashedToken() })
if (!verified.ok || !verified.data.access_token) {
  fail(`could not exchange the token for a session (${verified.status}): ${verified.data.msg || verified.data.error_description || 'is email sign-in enabled in Supabase Auth?'}`)
}

const s = verified.data
const session = {
  access_token: s.access_token,
  token_type: s.token_type,
  expires_in: s.expires_in,
  expires_at: s.expires_at ?? Math.floor(Date.now() / 1000) + Number(s.expires_in ?? 3600),
  refresh_token: s.refresh_token,
  user: s.user,
}

const name = COOKIE_NAME_OVERRIDE ?? `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
const value = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url')
const MAX = 3180
const cookies = value.length <= MAX
  ? [{ name, value }]
  : Array.from({ length: Math.ceil(value.length / MAX) }, (_, i) => ({ name: `${name}.${i}`, value: value.slice(i * MAX, (i + 1) * MAX) }))

process.stdout.write(JSON.stringify({ cookies: cookies.map(c => ({ ...c, path: '/', sameSite: 'Lax' })) }) + '\n')
