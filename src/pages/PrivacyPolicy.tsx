import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getWaitlistUrl, openExternalUrl } from '../config/externalLinks';
import Button from '../components/ui/Button';
import Header from '../components/Header';

const PrivacyPolicy: React.FC = () => {
  const location = useLocation();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Privacy Policy | Caiden's Courage";
  }, []);

  const handleComingSoonClick = () => {
    setIsComingSoonModalOpen(true);
  };

  const handleWaitlistClick = () => {
    const url = getWaitlistUrl();
    if (url) {
      openExternalUrl(url);
    } else {
      setIsPreorderOpen(true);
    }
  };

  // Get today's date for effective date
  const today = new Date();
  const effectiveDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-cream">
      {/* Shared Header Component */}
      <Header onComingSoonClick={handleComingSoonClick} />

      {/* Blue Header - Matching Resources Page */}
      <div className="bg-navy-500 text-white py-16 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mb-2">
            How we collect, use, and protect information on Caiden's Courage.
          </p>
          <p className="text-sm sm:text-base text-white/80">
            If you have questions, contact us anytime.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="prose prose-lg max-w-none">
          <p className="text-navy-600 mb-6">
            <strong>Effective Date:</strong> {effectiveDate}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Who We Are</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              Caiden's Courage is operated by The Focus Engine, LLC ("we," "us," "our"). We are committed to protecting your privacy and being transparent about how we collect and use your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">What We Collect</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              We collect the following types of information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-navy-600">
              <li><strong>Email address</strong> — when you join our waitlist, sign up for our newsletter, or contact us</li>
              <li><strong>Name</strong> — optional, if you choose to provide it when contacting us or joining the waitlist</li>
              <li><strong>Messages and inquiries</strong> — information you submit through our contact forms</li>
              <li><strong>Basic analytics data</strong> — pages visited, device type, and browser information (if analytics is enabled) to help us improve our website</li>
              <li><strong>Purchase information</strong> — for orders processed through payment processors like Stripe. We do not store full credit card numbers on our servers; payment processing is handled securely by third-party providers.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">How We Use Your Information</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-navy-600">
              <li>Send updates and launch announcements about Caiden's Courage</li>
              <li>Respond to your messages and support requests</li>
              <li>Deliver digital downloads or resources if applicable</li>
              <li>Improve our website performance and content</li>
              <li>Process and fulfill orders for products</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Data Sharing</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              We share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-navy-600">
              <li><strong>Service providers</strong> — with trusted third parties who help us operate our website, such as email platforms, hosting services, analytics providers (if enabled), and payment processors like Stripe</li>
              <li><strong>Legal obligations</strong> — when required by law, court order, or to protect our rights and safety</li>
              <li><strong>We do not sell your personal information</strong> to third parties for marketing purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Cookies</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              Our website may use cookies and similar tracking technologies to improve your experience and analyze how the site is used. If analytics cookies are enabled, we use them to understand visitor behavior. You can control cookies through your browser settings, though disabling cookies may limit some website functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Data Retention</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. You may request deletion of your information at any time by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Your Choices and Rights</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-navy-600">
              <li>Unsubscribe from our communications using the unsubscribe links in our emails</li>
              <li>Request access to the personal information we hold about you</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of cookies through your browser settings</li>
            </ul>
            <p className="text-navy-600 leading-relaxed mb-4">
              To exercise these rights, please contact us at <a href="mailto:hello@caidenscourage.com" className="text-navy-500 hover:text-navy-600 underline">hello@caidenscourage.com</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Children's Privacy</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              Caiden's Courage is intended for families and children, but we do not knowingly collect personal information from children under 13 without parental consent. If we learn that we have collected personal information from a child under 13 without parental consent, we will delete that information promptly. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. Your continued use of our website after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-500 mb-4">Contact Us</h2>
            <p className="text-navy-600 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
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
              <Link to="/resources" className="text-white/70 hover:text-white transition-colors">Resources</Link>
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

export default PrivacyPolicy;
