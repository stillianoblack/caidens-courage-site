// Navigation configuration for desktop and mobile
// All internal links use React Router <Link> (never <a>). Prefetch is on for nav: onMouseEnter + useEffect(import) (React Router has no prefetch prop). No loading="lazy" on Links – only on images where appropriate.

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

// Helper function to handle anchor scrolling
export const handleAnchorClick = (
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  navigate: (path: string) => void,
  location: { pathname: string }
) => {
  if (href.startsWith('/#')) {
    const anchor = href.substring(2);
    if (location.pathname !== '/') {
      e.preventDefault();
      navigate(`/#${anchor}`);
    } else {
      e.preventDefault();
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
        label: 'B-4 Reset Tools',
        href: '/b4-tools',
        description: 'Interactive reset missions to help kids notice feelings and find calm.'
      },
      {
        label: 'B-4 Tools Library',
        href: '/resources',
        description: 'Printable guides, posters, and worksheets for home and classroom use.'
      },
      {
        label: 'FAQs',
        href: '/resources#faq',
        description: 'Quick answers about using our free resources.'
      },
      {
        label: 'Camp Courage',
        href: '/camp-courage',
        description: 'Guided SEL missions, companion activities, and classroom pilots.'
      },
      {
        label: 'Classroom Pilots',
        href: '/classroom-pilots',
        description: 'Bring Caiden\'s Courage to your school or organization.'
      },
      {
        label: 'Training & Guides',
        href: '/training-guides',
        description: 'How to use B-4 tools at home and in the classroom.'
      },
      {
        label: 'Shop',
        href: '/comicbook',
        description: 'Pre-order Volume 1 and explore our products'
      }
    ],
    twoColumn: true
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
