import React from 'react';
import { Link } from 'react-router-dom';
import {
  BMC_COLORING_PATH,
  BMC_RESET_TOOLS_PATH,
  BRAVE_MIND_CLUB_PATH,
  FOCUS_FLAME_LAB_PATH,
  PARENTS_PATH,
  STORY_BOOKS_PATH,
  STORY_CHARACTERS_PATH,
  STORY_PATH,
  TEACHERS_PATH,
  CAMPS_PATH,
  SCHOOLS_PATH,
} from '../../config/courageRoutes';

type FooterLink = { label: string; href: string; external?: boolean };

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Story',
    links: [
      { label: 'Caiden Vale', href: STORY_PATH },
      { label: 'Books', href: STORY_BOOKS_PATH },
      { label: 'Characters', href: STORY_CHARACTERS_PATH },
    ],
  },
  {
    title: 'Kids',
    links: [
      { label: 'Brave Mind Club', href: BRAVE_MIND_CLUB_PATH },
      { label: 'Focus Flame Lab', href: FOCUS_FLAME_LAB_PATH },
      { label: 'B-4 Reset Tools', href: BMC_RESET_TOOLS_PATH },
      { label: 'Coloring Pages', href: BMC_COLORING_PATH },
    ],
  },
  {
    title: 'Educators',
    links: [
      { label: 'Parents', href: PARENTS_PATH },
      { label: 'Teachers', href: TEACHERS_PATH },
      { label: 'Camps', href: CAMPS_PATH },
      { label: 'Schools & Districts', href: SCHOOLS_PATH },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className = 'text-sm text-white/70 transition-colors hover:text-white';
  if (link.external) {
    return (
      <a href={link.href} rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link to={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export default function CourageFooter() {
  return (
    <footer className="border-t border-navy-100 bg-[#050B18] py-12 text-white sm:py-14">
      <div className="cc-site-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-left">
          <Link to="/" className="font-display text-lg font-extrabold text-white transition-colors hover:text-golden-400">
            Caiden&apos;s Courage™
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-golden-500/90">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-white/10 pt-8 text-left text-sm text-white/50">
          © {new Date().getFullYear()} The Focus Engine, LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
