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
- **“Canceled” requests:**  
  - **Development:** A canceled request with initiator **eventsource** is from **webpack-dev-server HMR**; not from app code.  
  - **Production (e.g. caidenscourage.com):** If you see canceled **eventsource** requests, they may be from **LaunchDarkly** or another SDK that uses EventSource. LaunchDarkly is initialized via `src/lib/launchdarkly.ts` with **streaming: false** and **bootstrap: "localStorage"** so it does not open EventSource connections.  
  - **Middleware:** There is no middleware in this project. The only redirect is the SPA fallback in `_redirects`. Nothing in the app aborts requests during client-side routing.

---

## 4. Route segments / “dynamic rendering”

- **Stack note:** Next.js concepts (Route Segments, Dynamic Rendering, edge) do not apply. This app uses **React Router** with:
  - **Lazy-loaded route components** (`React.lazy`) for code splitting.
  - **Suspense** with the skeleton fallback so the shell appears immediately while the route chunk loads.
  - **Prefetch** so that by the time the user clicks, the chunk is often already in memory and the transition is instant.

---

## 5. Blocking scripts (SDKs / analytics)

- **Status:** Addressed.
- **reportWebVitals:** Runs after idle so it never blocks the main thread or navigation.
- **LaunchDarkly – no streaming:**
  - Single init in `src/lib/launchdarkly.ts` via `getLDClient()` with **streaming: false** and **bootstrap: "localStorage"** so EventSource is never used and the app does not hang on LD requests.
  - No provider in the tree; init is triggered from `App.tsx` in a useEffect. If `REACT_APP_LAUNCHDARKLY_CLIENT_ID` is missing, a warning is logged and the app runs without LD.
  - Script tag: Do not add a LaunchDarkly `<script>` in HTML or Netlify; see comment in `public/index.html`.
- **Loading states:** The single **Suspense** fallback **`NavigationLoader`** in `App.tsx` is the root loading UI; it shows immediately during route transitions.

---

## Summary of changes made

1. **Prefetch (React Router equivalent of prefetch={true}):** All internal links use `<Link>`. Prefetch is implemented via `onMouseEnter` + `useEffect(import)` for main and footer links; Contact and Product on mount; Shop dropdown and Partner With Us on hover.
2. **Loading skeleton:** `NavigationLoader` is the single loading UI (like loading.tsx per segment); it shows immediately during route transitions.
3. **No middleware:** No middleware in project; `_redirects` is SPA-only. No code aborts requests during routing.
4. **LaunchDarkly decoupled:** No provider in tree; init after 100ms with `deferInitialization: true` and 100ms timeout so the site proceeds without waiting. Nav never awaits flags. Script tag (if used) must have async and defer.

For production (e.g. Netlify), ensure you deploy the built app and that the only redirect is the SPA fallback. Hard refresh is instant because the full bundle is cached; client-side navigation is instant when the target route chunk is prefetched or already loaded.
