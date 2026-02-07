/**
 * RESOURCES CATALOG
 * 
 * HOW TO ADD A NEW RESOURCE:
 * 
 * 1. Drop your file in the appropriate folder:
 *    - Wallpapers: /public/downloads/wallpapers/
 *    - Coloring pages: /public/downloads/coloring-pages/
 *    - SEL worksheets: /public/downloads/sel-worksheets/
 *    - Teacher packs: /public/downloads/teacher-packs/
 * 
 * 2. Create or add a thumbnail image:
 *    - Save thumbnail in: /public/thumbnails/
 *    - Recommended size: 300x300px or similar square format
 *    - Use the same filename or a descriptive name
 * 
 * 3. Add one object to the RESOURCES array below:
 *    - Copy an existing resource object
 *    - Update all fields with your new resource's information
 *    - Make sure fileUrl points to your file in /public/downloads/
 *    - Make sure thumbnail points to your image in /public/thumbnails/
 * 
 * That's it! The new resource will appear on the Resources page automatically.
 */

export type ResourceType = "wallpaper" | "coloring" | "worksheet" | "teacher-pack";
export type Audience = "parents" | "teachers" | "students" | "all";
export type UseCase = "home" | "classroom" | "both";

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  tags: string[];
  thumbnail: string;
  fileUrl: string;
  description?: string;
  format?: string;
  audience: Audience[]; // Who this resource is for
  ageRange?: string; // e.g., "Ages 6-12"
  useCase: UseCase; // Where it's used
}

export const RESOURCES: Resource[] = [
  {
    id: "wallpaper-1",
    title: "Caiden Desktop Wallpaper",
    type: "wallpaper",
    tags: ["caiden", "desktop", "inspirational"],
    thumbnail: "/CoolCaiden_header.png",
    fileUrl: "/downloads/wallpapers/caiden-desktop.png",
    description: "A fun, confidence-boosting wallpaper to inspire kids at home or school",
    format: "PNG",
    audience: ["parents", "students", "teachers"],
    ageRange: "Ages 6-12",
    useCase: "both"
  },
  {
    id: "coloring-1",
    title: "Caiden Coloring Page",
    type: "coloring",
    tags: ["caiden", "coloring", "kids"],
    thumbnail: "/coloringpage_Caiden.png",
    fileUrl: "/downloads/coloring-pages/caiden-coloring.pdf",
    description: "A calming, creative activity that helps kids express themselves while building fine motor skills",
    format: "PDF",
    audience: ["parents", "teachers", "students"],
    ageRange: "Ages 5-10",
    useCase: "both"
  },
  {
    id: "worksheet-1",
    title: "Emotional Awareness Worksheet",
    type: "worksheet",
    tags: ["sel", "emotions", "learning"],
    thumbnail: "/SELThubmails.jpg",
    fileUrl: "/downloads/sel-worksheets/emotional-awareness.pdf",
    description: "Build emotional vocabulary and self-awareness through guided reflection and discussion",
    format: "PDF",
    audience: ["teachers", "parents"],
    ageRange: "Ages 7-12",
    useCase: "both"
  }
];

