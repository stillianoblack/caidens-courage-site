import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotifySuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream font-body">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-20" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="w-full max-w-md rounded-2xl border border-[#E7EEF7] bg-white p-8 sm:p-10 text-center shadow-[0_12px_35px_rgba(31,60,99,0.12)]">
          <div
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-golden-500 text-navy-700 text-2xl mb-5"
            style={{ boxShadow: '0 10px 22px rgba(244, 212, 119, 0.55)' }}
            aria-hidden
          >
            ✓
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-navy-700 tracking-tight">
            You&apos;re subscribed.
          </h1>
          <p className="mt-3 text-base text-[#4E6A86] leading-relaxed">
            We&apos;ll notify you when new free resources are added to the B-4 Tools Library.
          </p>
          <Link
            to="/braveminds"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-golden-500 text-navy-700 px-7 py-3.5 font-semibold transition-all hover:brightness-[0.98]"
            style={{ boxShadow: '0 10px 22px rgba(244, 212, 119, 0.55)' }}
          >
            Back to Resources
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotifySuccess;
