/**
 * RESOURCES CATALOG
 *
 * Folder structure:
 * - Wallpapers: /public/downloads/wallpapers/
 * - Coloring pages: /public/downloads/coloring-pages/
 * - SEL worksheets: /public/downloads/sel-worksheets/
 *
 * Thumbnail = file path (same image used for preview and download).
 */

export type ResourceType = "wallpaper" | "coloring" | "worksheet" | "teacher-pack";
export type Audience = "parents" | "teachers" | "students" | "all";
export type UseCase = "home" | "classroom" | "both";

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  tags: string[];
  fileUrl: string; // Used for thumbnail, preview, and download
  description?: string;
  format?: string;
  audience: Audience[];
  ageRange?: string;
  useCase: UseCase;
}

export const RESOURCES: Resource[] = [
  // Wallpapers
  {
    id: "wallpaper-1",
    title: "Happy Focus Wallpaper",
    type: "wallpaper",
    tags: ["wallpaper", "focus"],
    fileUrl: "/downloads/wallpapers/Caiden'sCourage_Wallpaper_Tablet_Happy.jpg",
    audience: ["parents", "students", "teachers"],
    useCase: "both",
  },
  {
    id: "wallpaper-2",
    title: "Focus Mode Wallpaper",
    type: "wallpaper",
    tags: ["wallpaper", "focus"],
    fileUrl: "/downloads/wallpapers/Caiden'sCourage_Wallpaper_Tablet.jpg",
    audience: ["parents", "students", "teachers"],
    useCase: "both",
  },
  // Coloring Pages
  {
    id: "coloring-1",
    title: "B-4 Focus Coloring Page",
    type: "coloring",
    tags: ["coloring", "b-4"],
    fileUrl: "/downloads/coloring-pages/B4_CaidensCourage_ColoringBook.jpg",
    audience: ["parents", "teachers", "students"],
    useCase: "both",
  },
  {
    id: "coloring-2",
    title: "Caiden Coloring Page",
    type: "coloring",
    tags: ["coloring", "caiden"],
    fileUrl: "/downloads/coloring-pages/Caiden_CaidensCourage_ColoringBook.jpg",
    audience: ["parents", "teachers", "students"],
    useCase: "both",
  },
  {
    id: "coloring-3",
    title: "Maria Coloring Page",
    type: "coloring",
    tags: ["coloring", "maria"],
    fileUrl: "/downloads/coloring-pages/Maria_CaidensCourage_ColoringBook.jpg",
    audience: ["parents", "teachers", "students"],
    useCase: "both",
  },
  {
    id: "coloring-4",
    title: "Ollie Coloring Page",
    type: "coloring",
    tags: ["coloring", "ollie"],
    fileUrl: "/downloads/coloring-pages/Ollie_CaidensCourage_ColoringBook.jpg",
    audience: ["parents", "teachers", "students"],
    useCase: "both",
  },
  // Worksheets
  {
    id: "worksheet-1",
    title: "B-4 Scan Worksheet",
    type: "worksheet",
    tags: ["worksheet", "sel", "b-4"],
    fileUrl: "/downloads/sel-worksheets/SELWorkshet_B-4Scan.jpg",
    audience: ["teachers", "parents"],
    useCase: "both",
  },
];
