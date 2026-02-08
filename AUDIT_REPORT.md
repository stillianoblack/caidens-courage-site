# Repository Audit Report

**Generated:** Performance & path audit

---

## Project root reminder

**Current absolute path (from Node `process.cwd()`):**
```
/Users/tdstills/Library/Mobile Documents/com~apple~CloudDocs/Documents/GitHub/caidenscourage
```

**Status:** The project root is **inside an iCloud-synced directory** (`Library/Mobile Documents/com~apple~CloudDocs/`).

**Recommendation:** For more reliable builds and to avoid sync conflicts, clone or move the repo to a non–iCloud path, for example:
- `/Users/<name>/Documents/Projects/caidenscourage`
- or `~/Developer/caidenscourage`

---

## iCloud / absolute path references

**Search terms:** `iCloud`, `Mobile Documents`, `/Users/`, `~/`, `file://`

**Result:** No matches found in the repository.

- No code or config references iCloud or absolute Mac paths.
- All asset references use root-relative paths (e.g. `/logoCaiden.png`, `/hero-bg_desktop_1280w.webp`), which resolve from the project `public` folder in Create React App.

---

## Asset locations

- **Images and static assets:** All app-referenced assets are under **`/public`**. There is no `/src/assets` folder; `src/` contains only code and `logo.svg` (source asset).
- **Videos:** `public/background_video.mov` exists and is in git; it is **not** referenced by any source file (no `<video>` in the app).
- **Path style:** References in `src/` use leading slash (e.g. `src="/logoCaiden.png"`). In CRA, these resolve to `public/` at build and runtime, so they are correct and portable.

---

## Assets referenced by the app (summary)

| Location        | Resolves to   | Status |
|----------------|---------------|--------|
| `/public/*`    | Project root → `public/` | All references use `/filename` and resolve from `public/`. |
| `/src/assets`  | Not used      | No `src/assets`; not required. |

**Key files verified in git under `public/`:**
- `logoCaiden.png`, `hero-bg.png`, `hero-bg_*.webp`, `ourhistory_img.png`
- Character images, hero WebPs (mission, world, characters), previews, etc.
- `_redirects`, `manifest.json`, favicons

**Possible mismatches (code vs. files in repo):**
- **Mission.tsx** uses `url(/meetthecreator_bg.jpg)` — no `meetthecreator_bg.jpg` in `git ls-files public/`. Add the file to `public/` and commit, or point the style to an existing asset.
- **CourageAcademy.tsx** uses `/NeuroCamp_smaller.jpg` and `/NeuroCamp_explore_smaller.jpg` — repo has `NeuroCamp.jpg` and `NeuroCamp_explore.jpg`. Either add the `_smaller` variants to `public/` and git, or update the code to use the existing filenames.
- **Product/Home** use `Comic5_Coverpage_header_smaller.jpg` and `Caiden'sCourage_SocialImage_smaller.jpg` — confirm these exist in `public/` and are committed (or add/rename as needed).

---

## Fixed paths

**None.** No iCloud or absolute path references were found; no paths were changed.

---

## Confirmation summary

| Check | Status |
|-------|--------|
| No `iCloud` references | OK |
| No `Mobile Documents` references | OK |
| No `/Users/` references | OK |
| No `~/` references | OK |
| No `file://` references | OK |
| All asset references use `/...` from project root | OK |
| Assets live under `public/` (or `src/` for logo.svg) | OK |
| Project root reminder (current path is iCloud) | See above |

---

## Recommendation checklist

1. **Move repo out of iCloud** (optional but recommended): clone or move to e.g. `~/Documents/Projects/caidenscourage` and work from there.
2. **Resolve missing/renamed assets:** Add or rename files so that `meetthecreator_bg.jpg`, `NeuroCamp_smaller.jpg`, `NeuroCamp_explore_smaller.jpg`, `Comic5_Coverpage_header_smaller.jpg`, and `Caiden'sCourage_SocialImage_smaller.jpg` exist under `public/` and are committed (or update code to match existing filenames).
3. **Keep using relative/public paths:** Continue using `/asset-name` for all assets so the app stays portable and works from any project root.
