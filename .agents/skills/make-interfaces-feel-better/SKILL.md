---
name: make-interfaces-feel-better
description: Design engineering principles for making interfaces feel polished. Use when building UI components, reviewing frontend code, implementing animations, hover states, shadows, borders, typography, micro-interactions, enter/exit animations, or any visual detail work. Triggers on UI polish, design details, "make it feel better", "feels off", stagger animations, border radius, optical alignment, font smoothing, tabular numbers, image outlines, box shadows.
---

# Details that make interfaces feel better

Great interfaces rarely come from a single thing. It's usually a collection of small details that compound into a great experience. Apply these principles, based on Vercel Geist and Eve framework guidelines, when building or reviewing UI and agent code.

## Quick Reference

| Category                      | When to Use                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [Typography](typography.md)   | Text wrapping, font smoothing, tabular numbers, Geist typography scales                                     |
| [Surfaces](surfaces.md)       | Border radius, optical alignment, Geist shadows, image outlines, focus rings, component states              |
| [Animations](animations.md)   | Timings, physical easing, interruptible animations, enter/exit transitions, icon animations, scale on press |
| [Performance](performance.md) | Transition specificity, `will-change` usage                                                                 |
| [Vercel Eve Agents](eve.md)   | Agent config (`defineAgent`), tools (`defineTool`), instructions, skills, schedules, durable execution      |

## Core Principles

### 1. Snappy Motion Over Loops

Use motion only when it clarifies a change, never for decoration. Most interactions should feel instant; a duration of **0ms** is often the snappiest and best choice. When animations are needed:

- State changes: 150ms.
- Popovers and menus: 200ms with `cubic-bezier(0.175, 0.885, 0.32, 1.1)`.
- Modals and overlays: 300ms.

### 2. Concentric Border Radius

Keep radii tight and calculate concentrically: `outerRadius = innerRadius + padding`. Geist shapes:

- **6px (`rounded-sm`)**: Everyday surfaces, buttons, and inputs.
- **12px (`rounded-md`)**: Menus, popovers, dropdowns, and modals.
- **16px (`rounded-lg`)**: Fullscreen layers and large cards.

### 3. Shadows Over Borders

Layer transparent `box-shadow` values for light mode depth:

- Cards: `0 2px 2px rgba(0, 0, 0, 0.04)`
- Popovers/Menus: `0 1px 1px rgba(0, 0, 0, 0.02), 0 4px 8px -4px rgba(0, 0, 0, 0.04), 0 16px 24px -8px rgba(0, 0, 0, 0.06)`
  For dark mode, simplify to a single white border ring: `0 0 0 1px rgba(255, 255, 255, 0.08)`.

### 4. Focus Rings and States

Interactive elements must show focus visible rings. Geist uses a two-layer focus ring: a 2px gap in the surface color, then a 2px `blue-700` (`#006bff`) ring.

### 5. Content Casing

Use **Title Case** for labels, buttons, titles, and tabs (e.g. `Deploy Project`, `Cancel Request`). Use **Sentence case** for body copy, descriptions, helper text, and toast notifications. Name actions with a verb + noun.

### 6. Durable Eve Agents

Structure Vercel Eve agents inside the filesystem (`agent.ts`, `instructions.md`, `tools/`, `skills/`). Specify typed schemas using Zod for tools (`defineTool`), and keep tools stateless to ensure safety during durable session checkpoints.

## Common Mistakes

| Mistake                                | Fix                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Same border radius on parent and child | Calculate `outerRadius = innerRadius + padding` using Geist standard radii                          |
| Snapping elements / slow animations    | Default to 0ms transition or keep them snappy (<300ms) with `cubic-bezier(0.175, 0.885, 0.32, 1.1)` |
| `transition: all` on elements          | Specify exact properties (e.g. `transition-property: scale, opacity`)                               |
| In-memory state inside Eve tools       | Save persistent state in files or databases to maintain durable execution safety                    |
| Missing Title Case on buttons          | Capitalize buttons using Title Case with Verb + Noun format                                         |

## Review Output Format

Always present changes as a markdown table with **Before** and **After** columns. Include every change you made — not just a subset. Never list findings as separate "Before:" / "After:" lines outside of a table. Group changes by principle using a heading above each table, and keep each row focused on a single diff so the reader can scan the whole list quickly.

### Example

#### Concentric border radius & shapes

| Before                                                      | After                                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `rounded-xl` on card + `rounded-xl` on inner button (`p-2`) | `rounded-md` on card (`12px`), `rounded-sm` on inner button (`6px` + `6px padding`) |

#### Button & input actions (Title Case)

| Before                    | After                          |
| ------------------------- | ------------------------------ |
| `<button>submit</button>` | `<button>Submit Form</button>` |

Rows should cite the specific file and the specific property that changed when it isn't obvious from the snippet. If a principle was reviewed but nothing needed to change, omit that table entirely — empty tables add noise.

## Review Checklist

- [ ] Nested rounded elements use concentric border radius conforming to Geist sizes (6px, 12px, 16px)
- [ ] Active and hover states step up the 100–1000 Geist scale correctly
- [ ] Focus rings utilize the two-layer ring (2px gap, 2px `#006bff` outline)
- [ ] Motion timing is snappy (0ms default, max 300ms) and uses physical spring easing
- [ ] Content casing is Title Case on actions/buttons and Sentence case on text/toasts
- [ ] Dynamic numbers use `tabular-nums` with Geist Mono
- [ ] Images have subtle outlines (`rgba(0,0,0,0.1)` or `rgba(255,255,255,0.1)`)
- [ ] Vercel Eve tools use explicit Zod parameters and are stateless for durable execution

## Reference Files

- [typography.md](typography.md) — Geist typography scales, text wrapping, font smoothing, tabular numbers
- [surfaces.md](surfaces.md) — Border radius, optical alignment, Geist shadows, focus rings, component states
- [animations.md](animations.md) — Snappy motion, timing, easing curves, icon animations, scale on press
- [performance.md](performance.md) — Transition specificity, `will-change` usage
- [eve.md](eve.md) — Vercel Eve agent configuration, instructions, tools, and structures
