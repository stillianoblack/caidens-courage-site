# Image & Asset Usage Audit Report

**Generated:** 2026-02-08  
**Scope:** All image references (url(), src, background-image, img, link preload, og:image, fileUrl) across `src/`, `public/index.html`, and `public/`.  
**No files were modified.**

---

## 1. SAFE ✅

These paths resolve to files under `public/` and match case. They will work in production.

### Root public assets (favicon, manifest icons)
| Path | File location |
|------|----------------|
| `/favicon.ico` | `public/favicon.ico` |
| `/logo192.png` | `public/logo192.png` |
| `/logo512.png` | `public/logo512.png` |

### Under `/images/` (all verified present and case-matched)
- `/images/heroes/world_hero_mobile_400w.webp`, `600w`, `800w`
- `/images/heroes/world_hero_desktop_640w.webp`, `960w`, `1280w`, `1600w`
- `/images/heroes/mission_hero_mobile_400w.webp`, `600w`, `800w`
- `/images/heroes/mission_hero_desktop_640w.webp`, `960w`, `1280w`, `1600w`
- `/images/heroes/characters_hero_mobile_400w.webp`, `600w`, `800w`
- `/images/heroes/characters_hero_desktop_640w.webp`, `960w`, `1280w`, `1600w`
- `/images/heroes/hero-bg_mobile_400w.webp`, `600w`, `800w`
- `/images/heroes/hero-bg_desktop_640w.webp`, `960w`, `1280w`, `1600w`
- `/images/heroes/hero-bg.webp`, `hero-bg_img_2.webp`, `homepage_hero-bg_mobile_img.webp`
- `/images/heroes/Neurodiversity-positiveheroes_img.webp`
- `/images/world_card_know_640w.webp`, `960w`, `1280w`
- `/images/world_card_other_640w.webp`, `960w`, `1280w`
- `/images/theknowworld_img.webp`
- `/images/TheOtherworld_genesis_img.webp`, `/images/TheOtherworld_img.webp`
- `/images/map.webp`
- `/images/Headers_world_mobile.webp`
- `/images/backgrounds/background_caidensworld_img.webp`, `background_ourstory_img.webp`, `background_ourstory_mobile_img.webp`, `background_img.webp`, `background_caidenscharacter_img.webp`, `background_caidenscharacter_mobile_img.webp`
- `/images/backgrounds/meetthecreator_bg.jpg`
- `/images/Caiden_FAQ_section.webp`, `/images/Caiden@4x-100.webp`
- `/images/Caiden'sCourage_SocialImage_smaller.webp`
- `/images/Comic5_Coverpage_header_smaller.webp`, `/images/Comic5_Coverpage_header_Shop_smaller.webp`
- `/images/coloringpage_Caiden.webp`, `/images/CoolCaiden_header.webp`, `/images/SELThubmails.webp`
- `/images/ui/logoCaiden.webp`, `/images/ui/b4-watermark.svg`
- `/images/page-01.webp` … `/images/page-05.webp`
- `/images/creator-photo.webp`
- `/images/Emotionallearningthroughstory_img.webp`
- `/images/characters/Character-drivengrowth_img.webp`
- `/images/Toolsthatsupportkidsbeyondthepage_img.webp`
- `/images/TheWorldIsJustBeginning_img.webp`
- `/images/ourhistory_img.webp`, `/images/OurPromise_img.webp`
- `/images/characters/Caiden_img_profile.webp`, `b4_img_profile.webp`, `ollie_img_profile.webp`, `breathoflife_img_profile.webp`, `dragon_img_profile.webp`, `unclet_img_profile.webp`, `maria_img_profile.webp`
- `/images/genesis_img_pic.webp`
- `/images/Courageforeverykid.webp`, `/images/SEL_Caidenshield_img.webp`
- `/images/NeuroCamp_smaller.webp`, `/images/NeuroCamp_explore_smaller.webp`
- `/images/B-4@4x-100.webp`, `/images/Genesis@4x-100.webp`, `/images/Turtle@4x-100.webp`
- `/images/B-4plushcompanions_img.webp`, `/images/Caiden'Courage_Tshirt_smaller.webp`

---

## 2. MISSING 🚨

These references point to files that **do not exist** under `public/`. They will 404 in production.

| Reference | Used in | Expected location |
|-----------|--------|--------------------|
| `/downloads/wallpapers/caiden-desktop.png` | `src/data/resources.ts` (RESOURCES[0].fileUrl) | `public/downloads/wallpapers/caiden-desktop.png` |
| `/downloads/coloring-pages/caiden-coloring.pdf` | `src/data/resources.ts` (RESOURCES[1].fileUrl) | `public/downloads/coloring-pages/caiden-coloring.pdf` |
| `/downloads/sel-worksheets/emotional-awareness.pdf` | `src/data/resources.ts` (RESOURCES[2].fileUrl) | `public/downloads/sel-worksheets/emotional-awareness.pdf` |

**Note:** `public/downloads/` exists but has no files (no `wallpapers/`, `coloring-pages/`, or `sel-worksheets/` with the above assets). Add the files or point `fileUrl` to existing assets.

---

## 3. SHOULD CONVERT TO WEBP ⚡

These references use `.jpg` or `.png` while a `.webp` version exists in the same folder. Prefer `.webp` for smaller size and same quality.

| Current reference | Used in | Recommendation |
|-------------------|--------|----------------|
| `https://caidenscourage.com/images/Caiden'sCourage_SocialImage_smaller.jpg` | `public/index.html` (og:image, twitter:image) | Use `/images/Caiden'sCourage_SocialImage_smaller.webp` (or full URL with .webp) for social cards. |
| `url(/images/backgrounds/meetthecreator_bg.jpg)` | `src/pages/Mission.tsx` (backgroundImage) | No `.webp` exists yet; optional: add `meetthecreator_bg.webp` and switch to it. |

**Optional:** Favicon and manifest icons (`/logo192.png`, `/logo512.png`) are intentionally PNG for compatibility; no change needed unless you add WebP variants for supported clients.

---

## 4. Case sensitivity

All checked `/images/...` paths match the actual filenames on disk (including capital letters such as `Headers_world_mobile.webp`, `TheOtherworld_genesis_img.webp`, `OurPromise_img.webp`, `Character-drivengrowth_img.webp`, `Neurodiversity-positiveheroes_img.webp`, `TheWorldIsJustBeginning_img.webp`, `Comic5_Coverpage_header_smaller.webp`). On case-sensitive hosts (e.g. Linux/Netlify), these will resolve correctly.

---

## 5. Summary

| Category | Count |
|----------|--------|
| SAFE ✅ | All `/images/...` and `/favicon.ico`, `/logo192.png`, `/logo512.png` references |
| MISSING 🚨 | 3 (downloads: wallpaper PNG, coloring PDF, worksheet PDF) |
| SHOULD CONVERT TO WEBP ⚡ | 1 (og/twitter social image; optional: meetthecreator_bg) |

**Recommended next steps:**  
1. Add the missing files under `public/downloads/` or update `fileUrl` in `src/data/resources.ts` to existing assets.  
2. Optionally switch og:image and twitter:image to the existing `.webp` social image and, if desired, add and use `meetthecreator_bg.webp` in Mission.
