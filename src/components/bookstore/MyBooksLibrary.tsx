import React, { useState } from 'react';

type MyBooksLibraryProps = {
  initialEmail?: string;
};

/**
 * Prepared My Books surface. It is not mounted inside the family portal.
 * Recovery sends a one-time email link and does not reveal whether a purchase exists.
 */
export default function MyBooksLibrary({ initialEmail = '' }: MyBooksLibraryProps) {
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const recover = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch('/.netlify/functions/bookstore-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => ({}));
      setMessage(payload.message || 'If this email has a digital purchase, we sent a one-time download link. It expires soon and works once.');
    } catch {
      setMessage('If this email has a digital purchase, we sent a one-time download link. It expires soon and works once.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={recover} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="font-display text-3xl font-extrabold text-navy-500">My Books</h1>
      <p className="mt-3 text-sm leading-relaxed text-navy-600">
        Enter the email from checkout. If it has a digital purchase, we will email a one-time download link.
      </p>
      <label className="mt-5 block text-sm font-semibold text-navy-500" htmlFor="my-books-email">
        Email
      </label>
      <input
        id="my-books-email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-navy-600"
      />
      {message ? <p className="mt-4 text-sm leading-relaxed text-navy-600">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full px-7 py-4 text-[16px] font-semibold text-navy-600 disabled:opacity-60 sm:w-auto"
        style={{ backgroundColor: '#F2D06B' }}
      >
        {pending ? 'Sending link...' : 'Email my download link'}
      </button>
    </form>
  );
}
