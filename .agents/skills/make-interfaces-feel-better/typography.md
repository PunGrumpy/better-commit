# Typography

Typography rendering details and token systems following Vercel Geist design guidelines.

## Geist Font Families

Geist utilizes two primary font families to distinguish interface roles:

- **Geist Sans**: Main font for UI controls, labels, and copy.
- **Geist Mono**: Specialized font for code snippets, database keys, tabular data, and numbers.

## Geist Typography Tokens

Geist defines concrete typographic standards that must be used instead of manual font styling:

### 1. Headings

Designed for title pages and section headers. Note that `letterSpacing` tightens progressively as font size increases:

- `heading-72`: `72px` size, `600` weight, `72px` line-height, `-4.32px` letter-spacing
- `heading-64`: `64px` size, `600` weight, `64px` line-height, `-3.84px` letter-spacing
- `heading-48`: `48px` size, `600` weight, `56px` line-height, `-2.88px` letter-spacing
- `heading-32`: `32px` size, `600` weight, `40px` line-height, `-1.28px` letter-spacing
- `heading-24`: `24px` size, `600` weight, `32px` line-height, `-0.96px` letter-spacing
- `heading-16`: `16px` size, `600` weight, `24px` line-height, `-0.32px` letter-spacing
- `heading-14`: `14px` size, `600` weight, `20px` line-height, `-0.28px` letter-spacing

### 2. Labels

For single-line, scannable text (navigation, form labels, table headers, metadata):

- `label-20`: `20px` size, `400` weight, `32px` line-height
- `label-14`: `14px` size, `400` weight, `20px` line-height (Standard label size)
- `label-12`: `12px` size, `400` weight, `16px` line-height
- `label-14-mono` / `label-12-mono`: Pairs Geist Mono with label metrics.

### 3. Copy

For multi-line body text. Includes a taller line-height for readability:

- `copy-18`: `18px` size, `400` weight, `28px` line-height
- `copy-16`: `16px` size, `400` weight, `24px` line-height
- `copy-14`: `14px` size, `400` weight, `20px` line-height (Standard copy size)
- `copy-13`: `13px` size, `400` weight, `18px` line-height

### 4. Buttons

Medium-weight labels for buttons and compact controls:

- `button-16`: `16px` size, `500` weight, `20px` line-height
- `button-14`: `14px` size, `500` weight, `20px` line-height
- `button-12`: `12px` size, `500` weight, `16px` line-height

## Text Wrapping & Balancing

### text-wrap: balance

Distributes text evenly across lines, preventing orphaned words on headings and short text blocks.
_Constraint: Only works on blocks of 6 lines or fewer._

```css
/* Good — balanced lines for headings */
h1,
h2,
h3 {
  text-wrap: balance;
}
```

### text-wrap: pretty

Prevents single orphaned words on the last line of paragraphs by adjusting line breaks. Works on text of any length. Use this as the default for short-to-medium body text.

```css
/* Good — body copy and captions */
p,
li,
figcaption {
  text-wrap: pretty;
}
```

## Content Casing Guidelines

Copy styling dictates readability and consistency across Vercel apps:

- **Title Case**: Labels, button actions, section titles, and navigation tabs.
- **Sentence case**: Body copy, descriptions, helper text, and toast notifications.
- ** ellipses (...)**: Use in-progress states with a present participle: `Saving…`, `Deploying…`.

## Tabular Numbers

Use `font-variant-numeric: tabular-nums` (Tailwind: `tabular-nums`) paired with `Geist Mono` for any dynamically updating numbers (counters, timers, dashboards) to prevent layout shifts as the digits change:

```tsx
// Good — prevents layout shift on live ticks
<span className="font-mono tabular-nums">{count}</span>
```

## Font Smoothing (macOS)

On macOS, text renders slightly heavier than intended by default. Apply antialiased smoothing to the root HTML layout:

```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```
