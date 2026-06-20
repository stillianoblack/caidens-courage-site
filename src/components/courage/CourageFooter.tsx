import React from 'react';
import { Link } from 'react-router-dom';
import CourageFooterLogo from '../marketing/CourageFooterLogo';
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
import FooterLinkItem from './FooterLinkItem';

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  pilotInterest?: 'focus_flame_lab' | 'b4_tools' | 'general_pilot';
};

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
      {
        label: 'Focus Flame Adventures',
        href: FOCUS_FLAME_LAB_PATH,
        pilotInterest: 'focus_flame_lab',
      },
      {
        label: 'B-4 Focus Tools',
        href: BMC_RESET_TOOLS_PATH,
        pilotInterest: 'b4_tools',
      },
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

export default function CourageFooter() {
  return (
    <footer className="border-t border-navy-100 bg-[#050B18] py-12 text-white sm:py-14">
      <div className="cc-site-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-left">
          <Link
            to="/"
            className="courageFooterLogoLink inline-flex rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-golden-500/60"
            aria-label="Caiden's Courage home"
          >
            <CourageFooterLogo />
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
