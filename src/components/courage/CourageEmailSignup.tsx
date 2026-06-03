import React, { useState } from 'react';
import Button from '../ui/Button';
import { submitNetlifyForm } from '../../utils/netlifyForms';

export default function CourageEmailSignup() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await submitNetlifyForm('resource_notify', {
        email: trimmed,
        source: 'courage-club',
      });
      if (res.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      name="resource_notify"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <input type="hidden" name="form-name" value="resource_notify" />
      <input type="hidden" name="source" value="courage-club" />
      <p className="hidden">
        <label>
          Don&apos;t fill this out: <input name="bot-field" />
        </label>
      </p>
      <label htmlFor="courage-club-email" className="sr-only">
        Email address
      </label>
      <input
        id="courage-club-email"
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-12 w-full flex-1 rounded-full border border-navy-200 bg-white px-5 text-navy-600 placeholder:text-navy-400 focus:border-golden-500 focus:outline-none focus:ring-2 focus:ring-golden-500/30"
      />
      <Button type="submit" variant="primary" size="lg" className="w-full shrink-0 sm:w-auto" disabled={submitting}>
        {success ? 'Subscribed!' : submitting ? 'Joining…' : 'Join'}
      </Button>
      {error ? <p className="text-sm text-red-600 sm:basis-full">{error}</p> : null}
      {success ? (
        <p className="text-sm text-navy-600 sm:basis-full">Thanks for joining the Courage Club!</p>
      ) : null}
    </form>
  );
}
