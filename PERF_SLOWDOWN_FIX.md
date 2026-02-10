# Performance / “Pages Not Clicking” Fix

## What was wrong

The **new deployment** (after the Jan 14-style fast build) was slow and navigation felt broken (“pages not clicking”). The cause was **Framer Motion’s `AnimatePresence`** used for route transitions in `App.tsx`:

- `<AnimatePresence mode="wait">` was wrapping `<Routes>`.
- `mode="wait"` means: wait for the **exit** animation of the current child to finish before showing the next.
- `<Routes>` is **not** a Framer Motion component, so it never ran an exit animation. AnimatePresence could wait indefinitely or behave oddly, so the next route didn’t show promptly and clicks felt unresponsive.

So the slowdown and “not clicking” came from **route transition handling**, not from the new design or content.

## What we changed

- **Removed AnimatePresence from the route path.** The app now always renders plain `<Routes location={location}>{routeList}</Routes>` with no Framer Motion wrapper.
- Navigation is **instant**: route changes apply immediately with no transition delay.
- **Design is unchanged**: same layout, Header, pages, FloatingAnimationController (still gated by path and `REACT_APP_DISABLE_HEADER_ANIMATIONS`), and all other UI.

## Optional: reduce animation load further

If you still see slowness (e.g. on low-end devices or heavy pages), you can disable header/floating animations and/or minimal CSS at **build time**:

| Env var | Effect |
|--------|--------|
| `REACT_APP_DISABLE_HEADER_ANIMATIONS=true` | Skips FloatingAnimationController and header animation classes. |
| `REACT_APP_MINIMAL_CSS_MODE=true` | Applies minimal-css overrides (e.g. no backdrop-filter, animations off). |

Example (Netlify or local build):

```bash
REACT_APP_DISABLE_HEADER_ANIMATIONS=true yarn build
```

## Bringing back route transitions (optional)

If you later want route transition animations again, they must be implemented so that the **exiting** view is a real motion component with an `exit` animation; otherwise AnimatePresence with `mode="wait"` can again block navigation. Prefer a single `motion.div` wrapping the route content with a proper `exit` so AnimatePresence can detect completion.
