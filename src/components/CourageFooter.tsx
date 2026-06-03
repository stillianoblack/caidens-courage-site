import React from 'react';
import { Link } from 'react-router-dom';
import { CAIDEN_VALE_HOME_PATH } from '../config/nav';
import { FOCUS_FLAME_LAB_PATH } from '../config/courageNav';

const FOOTER_LINKS = [
  { label: "Caiden's Courage", href: '/' },
  { label: 'Kids', href: '/kids' },
  { label: 'Schools & Districts', href: '/focus-flame-academy' },
  { label: 'Focus Flame Academy', href: '/focus-flame-academy' },
  { label: 'Focus Flame Lab', href: FOCUS_FLAME_LAB_PATH },
  { label: 'Caiden Vale', href: CAIDEN_VALE_HOME_PATH },
];

export default function CourageFooter() {
  return (
    <footer className="border-t border-navy-100 bg-[#050B18] py-10 text-white">
      <div className="cc-site-container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm" aria-label="Caiden's Courage footer">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href + link.label} to={link.href} className="text-white/70 transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-center text-sm text-white/50">
          © {new Date().getFullYear()} The Focus Engine, LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
