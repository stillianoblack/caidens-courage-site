import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { STORY_BOOKS_LIBRARY_PATH, STORY_BOOKS_PATH } from '../config/courageRoutes';
import {
  cancelClearBookstoreRecoveryToken,
  captureBookstoreRecoveryToken,
  scheduleClearBookstoreRecoveryToken,
} from '../lib/bookstoreRecoveryHandoff';

type AccessState = {
  status: 'loading' | 'ready' | 'missing_file' | 'failed' | 'instructions';
  message?: string;
  downloadUrl?: string;
  cta?: string;
};

const BookstoreDownloadPage: React.FC = () => {
  const [params] = useSearchParams();
  const checkoutStarted = params.get('checkout') === 'success';
  const [token, setToken] = useState('');
  const [tokenReady, setTokenReady] = useState(false);
  const [access, setAccess] = useState<AccessState>({ status: 'loading' });

  useEffect(() => {
    document.title = 'Download Your Book | Caiden Vale';
    cancelClearBookstoreRecoveryToken();
    const nextToken = captureBookstoreRecoveryToken();
    setToken(nextToken);
    setTokenReady(true);
    return () => {
      scheduleClearBookstoreRecoveryToken();
    };
  }, []);

  useEffect(() => {
    if (!tokenReady) return;
    if (!token) {
      setAccess({
        status: 'instructions',
        message: checkoutStarted
          ? 'Payment is being confirmed. Check your email for a one-time download link.'
          : 'Open the one-time link from your email, or request a new link from My Books.',
      });
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/.netlify/functions/bookstore-digital-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.ok && payload.downloadUrl) {
          setAccess({ status: 'ready', downloadUrl: payload.downloadUrl, cta: payload.cta || 'Download Your Book' });
          return;
        }
        if (payload.error === 'missing_file') {
          setAccess({ status: 'missing_file', message: payload.message });
          return;
        }
        setAccess({ status: 'failed', message: payload.message || 'We could not verify this download.' });
      } catch {
        if (!cancelled) setAccess({ status: 'failed', message: 'The download could not be prepared.' });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [checkoutStarted, token, tokenReady]);

  return (
    <div className="min-h-screen bg-cream font-body">
      <Header />
      <main className="cv-under-marvel-header mx-auto max-w-xl px-4 pb-16 sm:px-6" style={{ paddingTop: '150px' }}>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="font-display text-3xl font-extrabold text-navy-500">Your digital edition</h1>
          {access.status === 'loading' ? <p className="mt-4 text-navy-600">Confirming your download link...</p> : null}
          {access.status === 'ready' && access.downloadUrl ? (
            <a
              href={access.downloadUrl}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full px-7 py-4 text-[16px] font-semibold text-navy-600 sm:w-auto"
              style={{ backgroundColor: '#F2D06B' }}
            >
              {access.cta}
            </a>
          ) : null}
          {access.message ? <p className="mt-4 text-sm leading-relaxed text-navy-600">{access.message}</p> : null}
          <p className="mt-5 text-sm text-navy-500">
            <Link to={STORY_BOOKS_LIBRARY_PATH} className="font-semibold text-navy-600 underline-offset-2 hover:underline">
              Open My Books
            </Link>
          </p>
        </section>
        <p className="mt-6 text-sm text-navy-500">
          <Link to={STORY_BOOKS_PATH} className="font-semibold text-navy-600 underline-offset-2 hover:underline">
            Back to the bookstore
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default BookstoreDownloadPage;
