import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream font-body">
      <Header />

      {/* Hero Section */}
      <div className="cv-cinematic-section text-white py-16 pt-32 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4" style={{ color: '#FFFFFF' }}>
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
            Have a question? Want to bring Caiden's Courage to your school? We'd love to hear from you.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-cream py-16 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-navy-100">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 mb-6">
              Get in Touch
            </h2>
            <p className="text-navy-600 mb-6">
              Send us an email at{' '}
              <a
                href="mailto:stills@caidenscourage.com"
                className="text-navy-700 font-semibold underline hover:text-navy-900 transition-colors"
              >
                stills@caidenscourage.com
              </a>
            </p>
            <p className="text-navy-600">
              We typically respond within 1-2 business days.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
