import React from 'react';
import PersonaMarketingPage from '../components/courage/PersonaMarketingPage';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { PARENTS_PAGE } from '../config/personaPages';

export default function ParentsPage() {
  return (
    <PersonaMarketingPage config={PARENTS_PAGE}>
      <section id="see-what-kids-get" className="cc-schools-section scroll-mt-24 border-t border-navy-100/80">
        <div className="cc-courage-header-shell sm:px-6 lg:px-8">
          <div className="cc-site-container mx-auto">
            <div className="overflow-hidden rounded-3xl border-2 border-navy-100 bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-2">
                <div className="p-8 sm:p-10 lg:p-12">
                  <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">See what kids get</h2>
                  <p className="mt-4 text-base leading-relaxed text-navy-600 sm:text-lg">
                    The Kids hub is where children play Focus Flame Lab, explore Brave Mind Club activities, and practice
                    B-4 reset tools — all designed to build courage and focus through story.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {['Focus Flame Lab interactive play', 'Coloring pages & printable missions', 'Kid-friendly story access'].map(
                      (item) => (
                        <li key={item} className="flex gap-3 text-base text-navy-600">
                          <span className="mt-1 shrink-0 text-golden-600" aria-hidden>
                            ✓
                          </span>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                  <div className="mt-8">
                    <Button variant="primary" size="lg" as={Link} to="/kids" leftIconSrc={null} className="w-full sm:w-auto">
                      Explore the Kids Hub
                    </Button>
                  </div>
                </div>
                <figure className="relative min-h-[14rem] bg-navy-100 lg:min-h-0">
                  <img
                    src="/images/caidenscourage/Choose_your_path/kid_card.webp"
                    alt="Kids exploring Caiden's Courage activities"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PersonaMarketingPage>
  );
}
