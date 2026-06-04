// Navigation configuration for desktop and mobile.
// All internal links use React Router <Link> / <NavLink> / useNavigate() only.
// No window.history.pushState, replaceState, or <a href="/path"> for in-app routes.

export interface NavItem {
  label: string;
  href: string;
  type: 'link' | 'dropdown';
  dropdownItems?: DropdownItem[];
  activePaths?: string[]; // Paths that should show this item as active
  twoColumn?: boolean; // For Resources dropdown
  column2Items?: DropdownItem[]; // Second column items for Resources
  isShop?: boolean; // Special handling for Shop dropdown with "Coming Soon" items
}

export interface DropdownItem {
  label: string;
  href: string;
  description?: string;
  subtitle?: string;
}

// React Router navigate (To = string or { pathname, hash?, search? })
type NavigateTo = (to: string | { pathname: string; hash?: string; search?: string }) => void;

/** Caiden Vale marketing homepage (not the Courage ecosystem hub at `/`). */
export const CAIDEN_VALE_HOME_PATH = '/classic-home';

// Helper: handle /#anchor links with React Router only (no pushState/replaceState).
// When not on the Vale homepage, navigate there with hash so route and URL both update.
export const handleAnchorClick = (
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  navigate: NavigateTo,
  location: { pathname: string }
) => {
  if (href.startsWith('/#')) {
    const anchor = href.substring(2);
    e.preventDefault();
    if (location.pathname !== CAIDEN_VALE_HOME_PATH) {
      navigate({ pathname: CAIDEN_VALE_HOME_PATH, hash: anchor });
    } else {
      const element = document.getElementById(anchor);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }
};

// Top-level navigation items (left-aligned cluster)
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Our Story',
    href: '/mission',
    type: 'link',
    activePaths: ['/mission', '/about']
  },
  {
    label: 'The World',
    href: '#',
    type: 'dropdown',
    dropdownItems: [
      {
        label: "Explore Caiden's World",
        href: '/world',
        description: 'Learn about Caiden and his journey'
      },
      {
        label: 'Characters',
        href: '/characters',
        description: 'Discover the heroes, friends, and guides'
      }
    ]
  },
  {
    label: 'Resources',
    href: '#',
    type: 'dropdown',
    dropdownItems: [
      {
        label: 'Preview the Book',
        href: '/preview',
        description: 'See inside Volume 1 before you pre-order.'
      },
      {
        label: 'Pre-Order Volume 1',
        href: '/comicbook',
        description: 'The graphic novel and official shop.'
      },
      {
        label: 'Characters',
        href: '/characters',
        description: 'Meet Caiden, B-4, Genesis, and the world’s heroes.'
      },
      {
        label: 'Character Art Downloads',
        href: '/braveminds?type=wallpaper',
        description: 'Wallpapers and character art from the Caiden Vale universe.'
      },
      {
        label: 'Story Journey',
        href: '/journey',
        description: 'Milestones, updates, and the story behind the book.'
      },
      {
        label: 'Press & Media',
        href: '/contact',
        description: 'Partnerships, press, and media inquiries.'
      }
    ]
  },
  {
    label: 'Shop',
    href: '#',
    type: 'dropdown',
    dropdownItems: [
      {
        label: 'Pre-Order Volume 1',
        href: '/comicbook',
        subtitle: 'The Graphic Novel'
      },
      {
        label: 'Comic Book',
        href: '/comicbook',
        subtitle: 'Volume 1: The Graphic Novel'
      },
      {
        label: 'Preview Pages',
        href: '/preview',
        subtitle: 'See inside the book'
      },
      {
        label: 'T-shirts',
        href: '#',
        subtitle: 'Coming Soon',
        description: "Caiden's courage t-shirts"
      },
      {
        label: 'Plushies',
        href: '#',
        subtitle: 'Coming Soon',
        description: 'Soft companions for your journey'
      }
    ]
  },
  {
    label: 'Journey',
    href: '/journey',
    type: 'link',
    activePaths: ['/journey']
  }
];

// Right-side items (separate from main nav)
export const RIGHT_NAV_ITEMS = {
  partnerLink: {
    label: 'Partner With Us',
    href: '/contact',
    activePaths: ['/contact']
  }
};
