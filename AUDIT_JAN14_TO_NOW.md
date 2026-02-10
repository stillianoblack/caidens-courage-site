# Audit: Jan 14 Build vs Current (What Changed & What Can Break the Site)

**Baseline:** Commit `080d0480` (2026-01-14, "optimizations")  
**Current:** `HEAD` (main)

---

## 1. What the Jan 14 build looked like

### App.tsx (Jan 14)
- **~40 lines.** Single component.
- **Router lived inside App:** `<Router>` (BrowserRouter) wrapped `<Routes>`.
- **No `useLocation`**, no `useEffect`, no state, no refs.
- **No lazy loading** — all pages imported directly (Home, PrivacyPolicy, Terms, …).
- **No Suspense**, no RouteHeroPreload, no FloatingAnimationController, no ChunkErrorBoundary, no LaunchDarkly.
- **Routes:** Plain `<Routes>` with a static list of `<Route>`; no `key`, no `location` prop.

### index.js (Jan 14)
- **~15 lines.** Only: React, ReactDOM, index.css, App, reportWebVitals.
- **No BrowserRouter** (it was inside App).
- **No SAFE_MODE**, no deferred loading, no service worker unregister, no debug/perf tools, no body classes.

### Header / Nav (Jan 14)
- Header used `Link`, `useNavigate`, `useLocation` from react-router-dom (same as now).
- No `config/nav.ts`; no central nav config.

### Src layout (Jan 14)
- No `config/nav.ts`, no `lib/safeMode.ts`, `historyGuard.ts`, `launchdarkly.tsx`, `navMarks.ts`, `perfDetective.ts`, `afterPaint.ts`, `defer.ts`, `flags.ts`.
- No `debug/`, no `perf/`, no `utils/clickBlockerFix.ts`.
- No B4ChatWidget, ChunkErrorBoundary, FloatingAnimationController, RouteHeroPreload, NavigationLoader, B4ChatGate.
- Fewer pages (no B4Clicker, CourageAcademy, ClassroomPilots, TrainingGuides, Characters, World, Contact, ResourcesB4ToolsLibrary, ResourcesDownloads).

---

## 2. What changed (summary)

| Area | Jan 14 | Now |
|------|--------|-----|
| **Router** | `<Router>` inside App | `<BrowserRouter>` in index.js; App has `<Routes>` only |
| **Route list** | Static, all eager imports | Lazy imports for all non-Home pages; many new routes |
| **App state / effects** | None | `useLocation`, state (showChat, showFloatingController), refs, many `useEffect`s (timing, debug, NAV_STALL, etc.) |
| **Route rendering** | `<Routes>{routes}</Routes>` | `<Routes key={location.pathname}>{routeList}</Routes>` inside ChunkErrorBoundary + Suspense |
| **Extra UI in App** | None | RouteHeroPreload, B4ChatWidget (lazy), FloatingAnimationController (lazy) |
| **index.js** | Minimal bootstrap | SAFE_MODE, body classes, deferred reportWebVitals / service worker / navWatch / routePerf / longTasks / perf debug / dev-only clickBlockerFix, perfDetective, navDebug |
| **New deps** | — | framer-motion, launchdarkly, etc. (App no longer uses AnimatePresence; removed for nav fix) |

---

## 3. What from this audit can cause the site “not to work properly”

### High impact (can break navigation or make the site feel broken)

1. **Router moved to index.js**  
   - **Risk:** Low. Single `BrowserRouter` at root is correct. Links and `useNavigate` still work.  
   - **Causes “not working” only if:** Something else blocks updates (e.g. stale route tree).

2. **Lazy-loaded route components**  
   - **Risk:** Medium. On nav, the new page chunk must load; until then Suspense shows `fallback={null}` (blank).  
   - **Can cause:** Slow or “stuck” feel, or blank content if a chunk fails to load.  
   - **Does not by itself:** Keep the *previous* page on screen when the URL changes.

3. **Using `location` in App and passing nothing to `Routes`**  
   - **Risk:** Low *now*. We removed `location={location}` and rely on router context; we added `key={location.pathname}` so the route tree remounts when the path changes.  
   - **If an older build is deployed** (without the key and without removing `location` prop): URL can change but the wrong route can stay mounted → **“URL changes but page doesn’t change.”**

4. **Heavy work on route change**  
   - **Risk:** Medium. Many `useEffect`s in App depend on `location.pathname` (timing, debug, NAV_STALL, etc.). FloatingAnimationController and other lazy components mount on some paths.  
   - **Can cause:** Jank, delay, or NAV_STALL warnings; less likely to prevent the route from updating if `key={location.pathname}` is in place.

5. **FloatingAnimationController**  
   - **Risk:** Low for “not working” if it’s lazy and path-gated. Can add CPU work and jank on `/`, `/comicbook`, `/b4-tools`.  
   - **Mitigation:** `REACT_APP_DISABLE_HEADER_ANIMATIONS=true` or only enabling on specific paths (already done).

6. **Debug / perf / instrumentation**  
   - **Risk:** Low in production. `__NAV_DEBUG__`, perfDetective, navDebug, clickBlockerFix, timerDebug are dev-only or gated by `?debug=1` / `?perf=1`.  
   - **Can cause:** Confusion or extra logs; not the root cause of “page not changing.”

7. **AnimatePresence (removed)**  
   - **Risk:** Was high (route transitions with `mode="wait"` and non-motion children could block nav). **Already removed** in current code.

### Medium / lower impact

8. **RouteHeroPreload**  
   - Only runs when `REACT_APP_ENABLE_PRELOADS=true`. Unlikely to break navigation.

9. **LaunchDarkly**  
   - Wraps app only when `REACT_APP_ENABLE_LAUNCHDARKLY=true`. Adds a provider; should not block route updates if used correctly.

10. **SAFE_MODE (lib/safeMode.ts)**  
    - Off in production. Affects when B4 chat and other deferred work run; not the reason the route view wouldn’t update.

11. **Header / nav config**  
    - Header still uses React Router `Link`/`NavLink`/`useNavigate`. Central `config/nav.ts` is just data. Not the cause of “click link, URL changes, page doesn’t change.”

---

## 4. Root cause that matched “URL changes, page doesn’t change”

- **Controlled `location` and no remount:** Previously we passed `location={location}` to `<Routes>` and did not force a remount. In some cases the route tree did not update correctly when `location` changed.  
- **Fix in place:**  
  - Do **not** pass `location` to `<Routes>` (use router context only).  
  - Use **`<Routes key={location.pathname}>`** so React unmounts/remounts the route tree when the path changes.

If the **deployed** build does not include this fix (or is an old cached bundle), the site can still show “URL changes but page doesn’t change.”

---

## 5. Recommendations

### A. Ensure the current fix is live
- Confirm the build you deploy includes:
  - **No** `location={location}` on `<Routes>`.
  - **`key={location.pathname}`** on `<Routes>`.
- After deploy: hard refresh (e.g. Cmd+Shift+R) or disable cache when testing so the new bundle loads.

### B. If it’s still broken after that
- Simplify App toward Jan 14 routing:
  - Keep `BrowserRouter` in index.js.
  - In App: render only `<Routes>{routeList}</Routes>` (no `useLocation`, no `key` if you first want to test without it).
  - You can keep lazy-loaded pages; ensure there are no `useEffect`s or wrappers that block or delay the route update.
- If needed, temporarily remove or gate:
  - FloatingAnimationController,
  - RouteHeroPreload,
  - Any `useEffect` that does heavy work on `location.pathname`,

  until navigation is reliable again.

### C. Optional: “Minimal App” like Jan 14
- To match Jan 14 behavior as closely as possible while keeping new routes and design:
  - In App: one inner component that returns only `<Routes>{routeList}</Routes>`.
  - No `useLocation`, no `key`, no Suspense around Routes, no RouteHeroPreload/FloatingAnimationController in the critical path.
  - Keep lazy imports for pages if you want; add `key={location.pathname}` only if you still see the route not updating.

**Minimal routing block (if you try this):** Replace the `AppContent` return with only Routes in one boundary — e.g. `return ( <ChunkErrorBoundary><Suspense fallback={null}><Routes>{routeList}</Routes></Suspense></ChunkErrorBoundary> );` — and keep RouteHeroPreload / B4ChatWidget / FloatingAnimationController outside or gated. Current code already uses `key={location.pathname}` on `Routes`; ensure that build is deployed first.

---

## 6. File-level change summary (critical path only)

| File | Change vs Jan 14 |
|------|-------------------|
| **src/App.tsx** | Router removed; Routes moved under index’s BrowserRouter; lazy routes; useLocation + key on Routes; many effects; RouteHeroPreload, B4ChatWidget, FloatingAnimationController, ChunkErrorBoundary. |
| **src/index.js** | BrowserRouter added; SAFE_MODE, body classes, deferred reportWebVitals/SW/navWatch/routePerf/longTasks; dev-only debug/perf tools. |
| **src/components/Header.tsx** | Much larger; central nav config (config/nav.ts); dropdowns and mobile menu; same use of Link/NavLink/navigate. |
| **public/index.html** | Hero preload logic (homepage-only script added to avoid “preloaded but not used” on other routes). |

Everything in **Section 3** that is “high impact” is either already mitigated (AnimatePresence removed, `key` + no `location` on Routes) or is about ensuring the right build is deployed and that lazy loading / heavy effects aren’t hiding the fix.
