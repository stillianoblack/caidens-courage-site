# Performance Audit – Caiden's Courage (React + React Router)

This project uses **React with React Router**, not Next.js. The audit below maps your requests to this stack and documents applied fixes.

---

## 1. Link optimization

- **Status:** Done.
- **Finding:** All internal navigation uses React Router `<Link>` (Header, Footer, all pages). The only `<a>` tags are `mailto:` links, which correctly stay as `<a>`.
- **Prefetch:**
  - **On app load:** Mission, Resources, About, World, Characters, Contact, Product are prefetched so main menu and CTA routes are ready.
  - **On hover (desktop):** Our Story (Mission), The World dropdown (World + Characters), Shop dropdown (Product + Preview), Partner With Us (Contact). Footer links (Mission, Privacy, Terms, Comic Book, Resources) also prefetch on hover.
  - **On tap (mobile):** Opening “The World” in the mobile menu prefetches World + Characters.

---

## 2. Blocking data & loading UI

- **Status:** Addressed.
- **Stack note:** There are no `getServerSideProps` or Server Components (Next.js). Data is loaded in the client via `useEffect` and/or static imports.
- **Loading UI:** A single `Suspense` boundary in `App.tsx` wraps all routes. Its fallback is `NavigationLoader` – a **skeleton** (header bar + content placeholders) so transitions feel like “content loading” instead of a blank hang. No per-route `loading.tsx` files; one fallback covers all lazy routes.

---

## 3. Middleware & redirects

- **Status:** No issues.
- **Stack note:** There is no `middleware.ts` (Next.js). The app is a client-side SPA.
- **Redirects:** `public/_redirects` contains only the SPA fallback: `/* /index.html 200`. No extra redirects that would cause full reloads or duplicate requests.
- **“Canceled” requests:** In the Network tab, a **canceled** request with initiator **eventsource** is from the **webpack-dev-server Hot Module Replacement (HMR)** connection in development. It is not from app code, and it does not occur in production (e.g. on caidenscourage.com).

---

## 4. Route segments / “dynamic rendering”

- **Stack note:** Next.js concepts (Route Segments, Dynamic Rendering, edge) do not apply. This app uses **React Router** with:
  - **Lazy-loaded route components** (`React.lazy`) for code splitting.
  - **Suspense** with the skeleton fallback so the shell appears immediately while the route chunk loads.
  - **Prefetch** so that by the time the user clicks, the chunk is often already in memory and the transition is instant.

---

## Summary of changes made

1. **Prefetch extended:** Contact and Product on mount; Footer links (Privacy, Terms, Comic Book, Resources) and Header (Shop dropdown, Partner With Us) prefetch on hover/tap where applicable.
2. **Loading skeleton:** `NavigationLoader` updated from a spinner to a layout-matched skeleton (header + content bars) for faster perceived transitions.
3. **No middleware or redirect changes:** Confirmed `_redirects` is SPA-only; no middleware to change.
4. **Canceled eventsource:** Documented as dev-only HMR; no app change required.

For production (e.g. Netlify), ensure you deploy the built app and that the only redirect is the SPA fallback. Hard refresh is instant because the full bundle is cached; client-side navigation is instant when the target route chunk is prefetched or already loaded.
