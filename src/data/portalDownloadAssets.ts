/**
 * Shared download asset config for Family Portal and Facilitator Portal.
 *
 * TODO(performance): Investigate why coloring pages and worksheet images load slowly
 * in the live environment. Check whether large JPGs are used as previews, whether
 * images are uncompressed, whether thumbnails should use WebP, whether downloadable
 * files should stay JPG/PDF while previews use optimized WebP, whether image
 * dimensions are too large, whether assets are missing width/height (layout shift),
 * and whether caching is configured correctly.
 * Recommendation: use optimized WebP thumbnails for page previews; keep original
 * JPG/PDF files for downloads. Do not load full-resolution JPGs for small previews.
 */

import { BMC_COLORING_PATH } from '../config/courageRoutes';

export type PortalDownloadStatus = 'available' | 'coming-soon';

export type PortalColoringPage = {
  id: string;
  title: string;
  status: PortalDownloadStatus;
  href: string;
};

export const PORTAL_COLORING_PAGES: PortalColoringPage[] = [
  {
    id: 'b4',
    title: 'B-4 Coloring Page',
    status: 'available',
    href: '/downloads/coloring-pages/B4_CaidensCourage_ColoringBook.jpg',
  },
  {
    id: 'caiden',
    title: 'Caiden Coloring Page',
    status: 'available',
    href: '/downloads/coloring-pages/Caiden_CaidensCourage_ColoringBook.jpg',
  },
  {
    id: 'miranda',
    title: 'Miranda Coloring Page',
    status: 'available',
    href: '/downloads/coloring-pages/Maria_CaidensCourage_ColoringBook.jpg',
  },
  {
    id: 'ollie',
    title: 'Ollie Buck Coloring Page',
    status: 'available',
    href: '/downloads/coloring-pages/Ollie_CaidensCourage_ColoringBook.jpg',
  },
  {
    id: 'genesis',
    title: 'Genesis Coloring Page',
    status: 'coming-soon',
    href: '#',
  },
  {
    id: 'leviathan',
    title: 'Leviathan Coloring Page',
    status: 'coming-soon',
    href: '#',
  },
  {
    id: 'breath',
    title: 'Breath of Life Coloring Page',
    status: 'coming-soon',
    href: '#',
  },
];

/** Brave Mind Club coloring section — same destination as Resources "Download All" button. */
export const PORTAL_COLORING_DOWNLOAD_ALL_HREF = BMC_COLORING_PATH;

export type PortalPrintableActivity = {
  id: string;
  title: string;
  status: PortalDownloadStatus;
  href: string;
};

export const PORTAL_PRINTABLE_ACTIVITIES: PortalPrintableActivity[] = [
  {
    id: 'b4-sel-scan',
    title: 'B-4 SEL Scan Worksheet',
    status: 'available',
    href: '/downloads/sel-worksheets/SELWorkshet_B-4Scan.jpg',
  },
  {
    id: 'focus-tracker',
    title: 'Focus Tracker',
    status: 'coming-soon',
    href: '#',
  },
  {
    id: 'brave-cards',
    title: 'Brave Choice Cards',
    status: 'coming-soon',
    href: '#',
  },
  {
    id: 'emotion-wheel',
    title: 'Emotion Wheel',
    status: 'coming-soon',
    href: '#',
  },
];
