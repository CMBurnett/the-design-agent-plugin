---
name: design-md
description: Use when creating or updating a project's DESIGN.md, the design system file TheDesignAgent and coding agents read for brand tokens and the reasoning behind them.
---

# Writing DESIGN.md

DESIGN.md describes a project's visual identity for coding agents. It follows Google's [design.md format](https://github.com/google-labs-code/design.md): YAML frontmatter holds machine-readable tokens, and markdown prose explains why the values exist and how to apply them where tokens can't decide. TheDesignAgent's `visual` review checks brand compliance against it.

Put it in the repo root.

## Gather the values first

Read, don't invent. Sources in order of trust:

1. Existing tokens: CSS custom properties, `tailwind.config.*`, the `@theme` block in Tailwind v4 CSS, `tokens.json`, a theme file.
2. Component library config (shadcn `components.json`, MUI theme, and so on).
3. Values repeated across components.

Any value you had to infer rather than read, mark with a `# inferred` comment and list them for the user at the end.

## Frontmatter

```yaml
---
version: alpha
name: <Project name>
description: <one line: product, register, mode>
colors:
  bg: "#09090b"
  fg: "#fafafa"
  primary: "#34d399"
typography:
  body:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
  h1:
    fontFamily: Geist
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.05
rounded:
  sm: 6px
  card: 12px
spacing:
  page-x: 24px
  section: 64px
components:
  button-primary:
    backgroundColor: "{colors.fg}"
    textColor: "#000000"
    rounded: "{rounded.sm}"
    padding: 10px 16px
---
```

- Token groups: `colors`, `typography`, `rounded`, `spacing`, `components`.
- Components reference tokens with `{group.name}` rather than repeating raw values.
- Name tokens by role (`bg-raised`, `signal`, `warn`), not by hue (`green-400`).

## Prose sections, in this order

1. **Overview**: the register and feel in 2–3 sentences, the dominant mode (light or dark) and why.
2. **Colors**: what each color *means* and when to use it. Say what is rare ("accent, kept very sparingly").
3. **Typography**: the scale, which face is for what, what the mono register signals if there is one.
4. **Layout**: max width, page padding, section rhythm, density.
5. **Elevation & Depth**: how surfaces stack (raised and elevated backgrounds, borders versus shadows).
6. **Shapes**: corner radii and where each applies.
7. **Components**: notes on variants and states that the tokens alone don't capture.
8. **Do's and Don'ts**: short, concrete rules an agent can check itself against.

Keep the prose about intent and edge cases; the values live in the frontmatter.

## After writing

- Show the user the inferred values and ask them to confirm.
- If TheDesignAgent tools are available, run `visual` on one existing page to check the file and the UI agree.
