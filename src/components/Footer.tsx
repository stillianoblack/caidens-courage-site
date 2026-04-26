import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050B18] py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img
              src="/images/logos/CaidenVale_Logo_Web.svg"
              alt="Caiden Vale and the Focus Flame"
              className="footer-logo-img h-5 sm:h-6 w-auto object-contain"
              decoding="async"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/mission" className="text-white/70 hover:text-white transition-colors">Mission</Link>
            <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center gap-4 text-sm mb-4">
            <Link to="/comicbook" className="text-white/70 hover:text-white transition-colors">Comic Book</Link>
            <Link to="/braveminds" className="text-white/70 hover:text-white transition-colors">Resources</Link>
            <Link to="/#about" className="text-white/70 hover:text-white transition-colors">About</Link>
            <Link to="/#characters" className="text-white/70 hover:text-white transition-colors">Characters</Link>
            <Link to="/#products" className="text-white/70 hover:text-white transition-colors">Shop</Link>
            <a href="mailto:stills@caidenscourage.com" className="text-white/70 hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-white/60 text-sm text-center">
            © {new Date().getFullYear()} The Focus Engine, LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
