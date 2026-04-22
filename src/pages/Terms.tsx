import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getWaitlistUrl, openExternalUrl } from '../config/externalLinks';
import Button from '../components/ui/Button';
import Header from '../components/Header';

const Terms: React.FC = () => {
  const location = useLocation();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Terms of Service | Caiden's Courage";
  }, []);

  const handleComingSoonClick = useCallback(() => {
    setIsComingSoonModalOpen(true);
  }, []);

  const handleWaitlistClick = () => {
    const url = getWaitlistUrl();
    if (url) {
      openExternalUrl(url);
    } else {
      setIsPreorderOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Shared Header Component */}
      <Header onComingSoonClick={handleComingSoonClick} />

      {/* Blue Header - Matching Resources Page */}
      <div className="bg-navy-500 text-white py-16 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            Terms of Service
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mb-2">
            The rules for using Caiden's Courage and our website.
          </p>
          <p className="text-sm sm:text-base text-white/80">
            Please read carefully before using the site.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Acceptance of Terms</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              By accessing or using the Caiden's Courage website (the "Site"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Site. We reserve the right to modify these Terms at any time, and your continued use of the Site after such changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Who Can Use the Site</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              Caiden's Courage is designed for families and is intended to be a family-friendly website. By using our Site, you represent that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-navy-600">
              <li>You are at least 18 years old, or you are using the Site with parental supervision and consent</li>
              <li>If you provide information or join our waitlist, you have the legal right to do so</li>
              <li>You will use the Site in compliance with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Intellectual Property</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              All content on the Caiden's Courage website, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-navy-600">
              <li>Characters (Caiden, B-4, and all other characters)</li>
              <li>Artwork, illustrations, and graphic designs</li>
              <li>Storylines, narratives, and text</li>
              <li>Logos, trademarks, and brand names</li>
              <li>Website design and layout</li>
            </ul>
            <p className="text-navy-600 leading-relaxed mb-4">
              All of the above are owned by The Focus Engine, LLC and are protected by copyright, trademark, and other intellectual property laws. You may not copy, reproduce, distribute, create derivative works, or resell any content from this Site without our express written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Acceptable Use</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              You agree to use our Site only for lawful purposes and in a way that does not:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-navy-600">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Attempt to hack, disrupt, or damage our Site or servers</li>
              <li>Scrape, copy, or automate data collection without permission</li>
              <li>Harass, threaten, or harm others</li>
              <li>Transmit any viruses, malware, or harmful code</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Links and Third-Party Services</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              Our Site may contain links to third-party websites or services, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-navy-600">
              <li><strong>Payment processors</strong> (such as Stripe) for processing purchases — your payment information is handled securely by these providers and subject to their privacy policies and terms</li>
              <li><strong>Social media platforms</strong> — if you connect to social media through our Site, you agree to comply with their terms</li>
              <li><strong>Analytics providers</strong> (if enabled) — to help us understand how visitors use our Site</li>
            </ul>
            <p className="text-navy-600 leading-relaxed mb-4">
              We are not responsible for the content, privacy practices, or terms of service of third-party websites. Use of third-party services is at your own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Purchases and Pre-Orders</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              If you purchase products or place pre-orders through our Site:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-navy-600">
              <li>Pre-orders are subject to fulfillment timelines that we will communicate at the time of purchase</li>
              <li>All sales are final unless otherwise stated, or as required by law</li>
              <li>Refunds, if applicable, will be processed according to our refund policy (contact us for details)</li>
              <li>We reserve the right to cancel or refuse any order at our discretion</li>
              <li>Prices and availability are subject to change without notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Disclaimers</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              The content on Caiden's Courage is provided for entertainment and educational purposes only. Our stories, characters, and resources are designed to support children's emotional learning and celebrate neurodiversity, but they are not intended as:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-navy-600">
              <li>Medical, psychological, or therapeutic advice</li>
              <li>Legal or professional advice</li>
              <li>A substitute for professional medical or mental health care</li>
            </ul>
            <p className="text-navy-600 leading-relaxed mb-4">
              If you have concerns about a child's well-being, please consult with qualified professionals.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Limitation of Liability</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              To the fullest extent permitted by law, The Focus Engine, LLC and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Changes to Terms</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page and updating the effective date. Your continued use of the Site after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Governing Law</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of [State], United States, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Site shall be subject to the exclusive jurisdiction of the courts in [State].
            </p>
            <p className="text-navy-600 leading-relaxed mb-4 text-sm italic">
              Note: Please replace "[State]" with your actual state of business registration.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Contact Us</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-navy-600 leading-relaxed">
              <strong>The Focus Engine, LLC</strong><br />
              Email: <a href="mailto:hello@caidenscourage.com" className="text-navy-500 hover:text-navy-600 underline">hello@caidenscourage.com</a><br />
              Or use our website contact form: <a href="mailto:stills@caidenscourage.com" className="text-navy-500 hover:text-navy-600 underline">stills@caidenscourage.com</a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-extrabold">
                <span className="text-white">Caiden's</span>
                <span className="text-golden-400">Courage</span>
              </span>
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
              <Link 
                to="/#about" 
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    const element = document.getElementById('about');
                    if (element) {
                      const headerOffset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                About
              </Link>
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

      {/* Coming Soon Modal */}
      {isComingSoonModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsComingSoonModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-md animate-slide-up bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
            <button
              className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-white text-navy-500 font-bold shadow-lg flex items-center justify-center hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 z-10"
              onClick={() => setIsComingSoonModalOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>
            
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 mb-4">
                We're building this next.
              </h2>
              <p className="text-navy-600 text-base sm:text-lg leading-relaxed mb-8">
                We're designing Caiden & B-4 plushies and limited-edition shirts. Join the Courage Community to get early access when they launch.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsComingSoonModalOpen(false);
                  handleWaitlistClick();
                }}
                className="w-full"
              >
                Join the Courage Community
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-order Modal (managed by page since Header's modal might be separate) */}
      {isPreorderOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setIsPreorderOpen(false)}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10 max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-navy-500 hover:text-navy-700 text-2xl font-bold"
              onClick={() => setIsPreorderOpen(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <iframe
              src="https://beacons.ai/stillianoblack"
              className="w-full h-[600px] border-0 rounded-lg"
              title="Join the Courage Community"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Terms;
