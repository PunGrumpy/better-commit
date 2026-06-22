# Surfaces

Border radius, optical alignment, shadows, focus rings, and image outlines following Vercel Geist specifications.

## Concentric Border Radius & Geist Shapes

When nesting rounded elements, the outer radius must equal the inner radius plus the padding between them:

```
outerRadius = innerRadius + padding
```

This rule is most useful when nested surfaces are close together. If padding is larger than `24px`, treat the layers as separate surfaces and choose each radius independently instead of forcing strict concentric math.

### Geist Border Radius Specifications

Geist enforces strict radius parameters to maintain a cohesive shape language:
- **6px (`rounded-sm`)**: Everyday surfaces, buttons, inputs, and small controls.
- **12px (`rounded-md`)**: Menus, popovers, dropdowns, and modals.
- **16px (`rounded-lg`)**: Fullscreen surfaces or large landing page cards.
- **9999px (`rounded-full`)**: Pills, badges, avatars, and circular controls.

*Rule: Keep one radius family per view rather than mixing rounded and sharp corners.*

### Example

```css
/* Good — concentric radii matching Geist (6px inner, 8px padding, 14px outer) */
.card-outer {
  border-radius: 14px; /* 6px + 8px */
  padding: 8px;
}
.card-inner {
  border-radius: 6px;
}

/* Bad — mismatching radii */
.card-outer {
  border-radius: 12px;
  padding: 8px;
}
.card-inner {
  border-radius: 12px;
}
```

## Optical Alignment

When geometric centering looks off, align optically instead.

### Buttons with Text + Icon

Use slightly less padding on the icon side to make the button feel balanced. A reliable rule of thumb is:
`icon-side padding = text-side padding - 2px`.

```css
/* Good — less padding on icon side */
.button-with-icon {
  padding-left: 16px;
  padding-right: 14px; /* icon side = text side - 2px */
}
```

```tsx
// Tailwind
<button className="pl-4 pr-3.5 flex items-center gap-2">
  <span>Continue</span>
  <ArrowRightIcon />
</button>
```

### Play Button Triangles

Play icons are triangular and their geometric center is not their visual center. Shift slightly right:

```css
/* Good — optically centered */
.play-button svg {
  margin-left: 2px; /* shift right to account for triangle shape */
}
```

## Elevation & Depth (Geist Shadows)

Hierarchy comes from tonal surfaces and borders first, so shadows stay subtle. Apply these exact `box-shadow` values:

### Light Mode Shadows
- **Raised cards**: `0 2px 2px rgba(0, 0, 0, 0.04)`
- **Popovers, menus, and dropdowns**: `0 1px 1px rgba(0, 0, 0, 0.02), 0 4px 8px -4px rgba(0, 0, 0, 0.04), 0 16px 24px -8px rgba(0, 0, 0, 0.06)`
- **Modals and dialogs**: `0 1px 1px rgba(0, 0, 0, 0.02), 0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 24px 32px -8px rgba(0, 0, 0, 0.06)`

### Dark Mode Shadows
Layered depth shadows are not visible on dark backgrounds. Simplify to a single white ring:
- **Default border ring**: `0 0 0 1px rgba(255, 255, 255, 0.08)`
- **Hover border ring**: `0 0 0 1px rgba(255, 255, 255, 0.13)`

## Focus Rings

Every interactive element must show a visible focus ring at `:focus-visible`. Never remove an outline without a visible replacement.

### Geist Focus Ring Spec
Geist uses a two-layer focus ring: a 2px gap in the surface color, then a 2px `blue-700` (`#006bff`) ring.

```css
.interactive-element:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #006bff;
}

/* For dark mode, match the inner gap to the dark background color */
.dark .interactive-element:focus-visible {
  box-shadow: 0 0 0 2px #0a0a0a, 0 0 0 4px #006bff;
}
```

## Geist Component States

Geist uses a 10-step gray scale where step encodes intent rather than just lightness. Use the steps below to design interactive surfaces:

- **Backgrounds**: `100` (default bg), `200` (hover bg), `300` (active bg).
- **Borders**: `400` (default border), `500` (hover border), `600` (active border).
- **Text & Icons**: `900` (secondary), `1000` (primary).

### Buttons & Inputs
- **Primary Button**: Solid `gray-1000` (`#171717`) background, `background-100` (`#ffffff`) text, 6px radius, height 40px (padding: `0 10px`).
- **Secondary Button**: `background-100` background, translucent `gray-alpha-400` border, 6px radius, height 40px.
- **Tertiary Button**: Transparent background, `gray-1000` text, 6px radius, height 40px (tints with `gray-alpha-200` on hover).
- **Disabled**: `gray-100` fill, `gray-700` text, and a `not-allowed` cursor.

## Image Outlines

Add a subtle `1px` outline with low opacity to images to prevent them from washing out on light/dark backgrounds.

### Color rules (non-negotiable)
- **Light mode**: pure black — `rgba(0, 0, 0, 0.1)`.
- **Dark mode**: pure white — `rgba(255, 255, 255, 0.1)`.
- Never use near-black or near-white palette tints (e.g. slate, zinc, neutral). A tinted outline picks up the surface color underneath and reads as dirt on the image edge.

```css
img {
  outline: 1px solid rgba(0, 0, 0, 0.1);
  outline-offset: -1px; /* inset so it doesn't affect layout dimensions */
}

@media (prefers-color-scheme: dark) {
  img {
    outline: 1px solid rgba(255, 255, 255, 0.1);
  }
}
```

## Minimum Hit Area

Interactive elements should have a minimum hit area of at least 40×40px (preferably 44×44px). If the visible element is smaller, extend the hit area with a pseudo-element:

```css
.checkbox {
  position: relative;
  width: 20px;
  height: 20px;
}

.checkbox::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
}
```
