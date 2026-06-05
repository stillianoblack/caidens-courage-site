import React from 'react';
import { Link } from 'react-router-dom';
import { FOCUS_FLAME_LAB_PATH } from '../../config/courageNav';
import { VALE_CLASSIC_HOME_URL } from '../../config/valeLinks';

const FOOTER_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "Caiden's Courage", href: '/' },
  { label: 'Kids', href: '/kids' },
  { label: 'Schools & Districts', href: '/focus-flame-academy' },
  { label: 'Focus Flame Academy', href: '/focus-flame-academy' },
  { label: 'Focus Flame Lab', href: FOCUS_FLAME_LAB_PATH },
  { label: 'Caiden Vale', href: VALE_CLASSIC_HOME_URL, external: true },
];

export default function CourageFooter() {
  return (
    <footer className="border-t border-navy-100 bg-[#050B18] py-10 text-white">
      <div className="cc-site-container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm" aria-label="Caiden's Courage footer">
          {FOOTER_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href + link.label}
                href={link.href}
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href + link.label} to={link.href} className="text-white/70 transition-colors hover:text-white">
                {link.label}
              </Link>
            )
          )}
        </nav>
        <p className="mt-8 text-center text-sm text-white/50">
          © {new Date().getFullYear()} The Focus Engine, LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
