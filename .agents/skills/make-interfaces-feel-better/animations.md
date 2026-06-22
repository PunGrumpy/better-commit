# Animations

Motion, easing, timing, and state-change transitions following Vercel Geist specifications.

## The Geist Motion Principle

**Use motion only when it clarifies a change, never for decoration.**
Most interactions should feel instant: a duration of `0ms` (no transition) is often the snappiest and best choice. Only introduce motion when it assists spatial understanding (revealing, moving, or expanding elements).

- **Timings**: Keep animations short:
  - **150ms**: Interactive state changes (e.g. hover, active).
  - **200ms**: Popovers, dropdown menus, and tooltips.
  - **300ms**: Full overlays and modals.
- **Physical Easing**: When motion helps, use the physical spring-like cubic-bezier:
  `cubic-bezier(0.175, 0.885, 0.32, 1.1)`
- **Accessibility**: Always honor `prefers-reduced-motion` by dropping nonessential animations.

## Interruptible CSS Transitions

Users change their mind mid-interaction. Always prefer CSS transitions for interactive changes (hover, press, toggle, open/close) because they interpolate toward the latest state and can be interrupted mid-animation. Reserve keyframes for one-shot staged animations (like entrance animations or loading indicators).

```css
/* Good — interruptible transition */
.drawer {
  transform: translateX(-100%);
  transition: transform 200ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
}
.drawer.open {
  transform: translateX(0);
}
```

## Enter Animations: Split and Stagger

Avoid animating large page containers as a single block. Break content into logical semantic chunks and stagger each with a ~100ms delay.

```tsx
// Motion (Framer Motion) — staggered enter
function PageHeader() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)" },
        }}
      >
        Welcome
      </motion.h1>

      <motion.p
        variants={{
          hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)" },
        }}
      >
        A description of the page.
      </motion.p>
    </motion.div>
  );
}
```

## Subtle Exit Animations

Exit animations must be softer than enters. The user's focus is moving to the next task—do not draw attention to exiting items.

- Use a small fixed `translateY` (like `-8px` or `-12px`) instead of shifting the full height.
- Keep exit duration shorter than enter duration (100ms - 150ms).

```tsx
<motion.div
  exit={{
    opacity: 0,
    y: -8,
    filter: "blur(2px)",
    transition: { duration: 0.12, ease: "easeIn" },
  }}
>
  {content}
</motion.div>
```

## Contextual Icon Animations

When swapping icons contextually (e.g., play → pause, like → liked, or action reveals on hover), transition them with `opacity`, `scale`, and `blur` instead of snapping visibility.

### Easing and Values (Strict Standard)

- `scale`: `0.25` → `1` (never use other starting values)
- `opacity`: `0` → `1`
- `filter`: `"blur(4px)"` → `"blur(0px)"`
- If Framer Motion is installed, use a bounce-free spring:
  `transition={{ type: "spring", duration: 0.3, bounce: 0 }}`
- If no motion library is present, keep both icons in the DOM (one absolute-positioned) and crossfade using:
  `transition: all 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1)`

```tsx
function IconButton({ isActive, ActiveIcon, InactiveIcon }) {
  return (
    <button className="relative size-10 flex items-center justify-center">
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out",
          isActive
            ? "scale-100 opacity-100 blur-0"
            : "scale-[0.25] opacity-0 blur-[4px]"
        )}
      >
        <ActiveIcon />
      </div>
      <div
        className={cn(
          "transition-all duration-200 ease-out",
          isActive
            ? "scale-[0.25] opacity-0 blur-[4px]"
            : "scale-100 opacity-100 blur-0"
        )}
      >
        <InactiveIcon />
      </div>
    </button>
  );
}
```

## Scale on Press (Tactile Feedback)

A subtle `scale(0.96)` active state gives buttons tactile feedback.

- Never use a scale value smaller than `0.95` (it reads as exaggerated/mushy).
- Provide a `static` prop to disable this when micro-motion would be distracting in dense layouts.

```tsx
// Tailwind example
<button className="transition-transform duration-150 active:scale-[0.96]">
  Deploy
</button>
```
