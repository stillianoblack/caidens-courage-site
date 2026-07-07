# Performance and Asset Audit - 2026-07-07

## Scope

This report is an inventory only. No assets were deleted.

Tonight's low-risk changes:

- Production source maps are disabled in the build command.
- Brand-domain redirects are clarified in `public/_redirects`.
- Large deploy and repo assets are listed below for a future cleanup pass.

## Current Size Snapshot

| Area | Size | Notes |
| --- | ---: | --- |
| `public/` | 415 MB | Copied into production build. Cleanup here can reduce deploy size. |
| `public/images/` | 257 MB | Main image weight. |
| `public/videos/` | 56 MB | Focus Flame videos. |
| `public/downloads/` | 69 MB | Large PDFs and worksheets. |
| `build/` | 449 MB | Current generated build. Will shrink after rebuilding with source maps off. |
| `src/` | 12 MB | Not the main storage issue. |
| `caidens-courage-site/` nested folder | 791 MB | Repo-root folder, likely not part of live build unless referenced. Needs review before deleting. |
| `caidenscourage/` root folder | 259 MB | Repo-root folder, likely not part of live build unless referenced. Needs review before deleting. |

## Largest Public Assets

These files are copied to production because they live in `public/`.

| Size | File |
| ---: | --- |
| 55 MB | `public/downloads/Weekly Module/CaidensCourage_Weekly 1_CourageInTheDark.pdf` |
| 25 MB | `public/images/caidenscourage/Videos/hero_video_cc.mp4` |
| 18 MB | `public/images/caidenscourage/Weekly Activites/week_1_thumbnail.svg` |
| 13 MB | `public/videos/focus-flame/the-path.mp4` |
| 13 MB | `public/videos/focus-flame/the-camp.mp4` |
| 12 MB | `public/videos/focus-flame/the-cave.mp4` |
| 9.8 MB | `public/images/caidenscourage/backgrounds/classroom-with-desks-and-whiteboard-2026-03-25-09-30-13-utc copy.webp` |
| 9.8 MB | `public/images/caidenscourage/backgrounds/classroom-with-desks-and-whiteboard-2026-03-25-09-30-13-utc copy 2.webp` |
| 7.5 MB | `public/videos/focus-flame/tap/path-tap-2.mp4` |
| 7.0 MB | `public/videos/focus-flame/tap/path_tap_1.mp4` |
| 6.2 MB | `public/audio/focus-flame-ambient.mp3` |
| 5.9 MB | `public/images/gallery/B4_bre.webp` |
| 5.5 MB | `public/images/heros/hero-mobile_slide_3.webp` |
| 5.5 MB | `public/images/gallery/olliebuck_bre.webp` |
| 5.5 MB | `public/images/camp-courage/courage_story.webp` |

## Public Root Asset Candidates

These files sit directly in `public/`, which makes them harder to reason about than assets grouped by brand or feature.

| Size | File |
| ---: | --- |
| 2.2 MB | `public/Comic5_Coverpage_header.jpg` |
| 1.8 MB | `public/CaidenCool_Hero_2.PNG` |
| 1.7 MB | `public/CoolCaiden_header.png` |
| 1.6 MB | `public/Comic5_Coverpage_header_Shop.jpg` |
| 1.2 MB | `public/Courageforeverykid_header_ADHD.png` |
| 956 KB | `public/coloringpage_Caiden.png` |
| 848 KB | `public/CaidenBackground.jpeg` |
| 652 KB | `public/Caiden'Courage_Tshirt.jpg` |
| 576 KB | `public/Caidenbackground_phone.jpg` |

Recommendation: before deleting, search each filename in `src/`, `public/`, and content/docs. If unused, move to an archive outside the repo first; delete in a later commit after a clean build and visual QA.

## B-4 Focus Flight Assets

`public/images/B-4FlightGame/` is about 19 MB.

Largest files:

| Size | File |
| ---: | --- |
| 2.8 MB | `public/images/B-4FlightGame/background/layers/mountains_far.png` |
| 1.9 MB | `public/images/B-4FlightGame/background/layers/trees_mid.png` |
| 1.7 MB | `public/images/B-4FlightGame/background/layers/trees_far.png` |
| 1.7 MB | `public/images/B-4FlightGame/background/layers/sky.png` |
| 1.7 MB | `public/images/B-4FlightGame/background/layers/mountains_mid.png` |
| 1.6 MB | `public/images/B-4FlightGame/background/layers/stars.png` |
| 1.4 MB | `public/images/B-4FlightGame/background/layers/forground_leaves.png` |
| 1.4 MB | `public/images/B-4FlightGame/background/layers/clouds.png` |

Recommendation: keep these for now because the game uses them. Later, convert large transparent PNG layers to optimized WebP/AVIF where Phaser support is reliable, or use smaller mobile-specific layers.

## Source Maps

The current `build/` includes about 25 MB of source maps. The build script now disables production source maps, so the next build should not generate `*.map` files.

Expected result after rebuild:

- Smaller `build/`
- Fewer files uploaded to Netlify
- Less source exposure in production

## Brand Organization Recommendation

Do not split into a second repo yet. First, organize assets by brand and feature:

```text
public/
  images/
    caidens-courage/
    caiden-vale/
    shared/
    B-4FlightGame/
```

Suggested route/brand intent:

- `caidenscourage.com`: app, product, portal, parent/school/pilot pages
- `caidenvale.com`: story, graphic novel, world, characters, classic-home

## Recommended Next Cleanup Pass

1. Rebuild and confirm source maps are gone.
2. Search references for each public-root asset.
3. Move unused public-root assets to an archive outside the repo.
4. Compress or replace assets over 2 MB that are still used.
5. Move large downloadable PDFs/videos to dedicated storage if they do not need to ship with every deploy.
6. Plan a separate brand-folder refactor after domain behavior is stable.
