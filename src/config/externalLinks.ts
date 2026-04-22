export function getStripePreorderUrl(): string | undefined {
  // Limited Edition Pre-order Stripe Payment Link
  return 'https://buy.stripe.com/9B6bJ03DVe0ogMTaZG3Ru00';
}

// Product-specific Stripe links
export const productLinks = {
  limitedEdition: 'https://buy.stripe.com/9B6bJ03DVe0ogMTaZG3Ru00',
  hardcoverBundle: 'https://buy.stripe.com/fZufZggqHbSg7cjd7O3Ru04',
  paperback: 'https://buy.stripe.com/6oU5kCeiz4pO2W3gk03Ru03',
  b4Plush: 'https://buy.stripe.com/6oUaEWa2j9K89kr9VC3Ru01',
  tShirt: 'https://buy.stripe.com/9B6dR80rJ2hGaov0l23Ru02',
  // Coming soon - add link when ready
  // courageJournal: 'https://buy.stripe.com/YOUR_JOURNAL_LINK',
};

export function getWaitlistUrl(): string | undefined {
  // Optional: hardcode a waitlist URL here if you want the top-right button to go somewhere else.
  // Returning undefined keeps the current fallback behavior (opens the existing modal).
  return undefined;
}

export function openExternalUrl(url: string) {
  // Open external purchase links in a new tab safely (prevents window.opener attacks)
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
}


