/**
 * Live Stripe Payment Links open only for a consistent production site.
 * Staging, and any missing or contradictory identity, fail closed.
 * Test-mode Checkout Sessions stay available only through the verified
 * server redirect, and only when this build is consistently staging.
 */

export const CHECKOUT_PRODUCTION_PROJECT_REF = 'bnopaocdqkknjzmmkaen';
export const CHECKOUT_STAGING_PROJECT_REF = 'gpcsombdaxlvlizoupqw';

const PRODUCTION_CHECKOUT_HOSTS = new Set([
  'caidenscourage.com',
  'www.caidenscourage.com',
  'caidenvale.com',
  'www.caidenvale.com',
  'quiet-pothos-3ae8ce.netlify.app',
]);

export type CheckoutEnvironmentName = 'production' | 'staging' | 'unknown';

export type CheckoutEnvironmentInput = {
  appEnvironment?: string | null;
  supabaseUrl?: string | null;
  expectedProjectRef?: string | null;
  productionProjectRef?: string | null;
  stagingProjectRef?: string | null;
  hostname?: string | null;
};

export type CheckoutEnvironment = {
  name: CheckoutEnvironmentName;
  consistent: boolean;
  allowLivePaymentLinks: boolean;
  allowVerifiedTestCheckout: boolean;
};

export type StripeCheckoutKind = 'payment_link' | 'live_session' | 'test_session' | 'not_stripe';

type ProvidedInput = CheckoutEnvironmentInput & {
  hasAppEnvironment: boolean;
  hasSupabaseUrl: boolean;
  hasExpectedProjectRef: boolean;
  hasProductionProjectRef: boolean;
  hasStagingProjectRef: boolean;
  hasHostname: boolean;
};

function provided(input: CheckoutEnvironmentInput | undefined, key: keyof CheckoutEnvironmentInput): boolean {
  return Boolean(input && Object.prototype.hasOwnProperty.call(input, key));
}

function readInput(input?: CheckoutEnvironmentInput): ProvidedInput {
  return {
    ...input,
    hasAppEnvironment: provided(input, 'appEnvironment'),
    hasSupabaseUrl: provided(input, 'supabaseUrl'),
    hasExpectedProjectRef: provided(input, 'expectedProjectRef'),
    hasProductionProjectRef: provided(input, 'productionProjectRef'),
    hasStagingProjectRef: provided(input, 'stagingProjectRef'),
    hasHostname: provided(input, 'hostname'),
  };
}

function text(value: string | null | undefined): string {
  return value?.trim() || '';
}

export function extractCheckoutProjectRef(url?: string | null): string | null {
  const value = text(url);
  if (!value) return null;
  const match = value.match(/^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/i);
  return match?.[1] ?? null;
}

function environmentName(value: string): 'production' | 'staging' | '' | 'invalid' {
  if (!value) return '';
  if (value === 'production' || value === 'staging') return value;
  return 'invalid';
}

function knownRef(explicit: string, supplied: boolean, envValue: string | undefined, known: string): string | null {
  if (supplied) return explicit || null;
  const fromEnv = text(envValue);
  if (!fromEnv) return known;
  return fromEnv === known ? known : null;
}

function currentHostname(input: ProvidedInput): string {
  if (input.hasHostname) return text(input.hostname).toLowerCase();
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname.toLowerCase();
  }
  return '';
}

export function resolveCheckoutEnvironment(input?: CheckoutEnvironmentInput): CheckoutEnvironment {
  const source = readInput(input);
  const closed: CheckoutEnvironment = {
    name: 'unknown',
    consistent: false,
    allowLivePaymentLinks: false,
    allowVerifiedTestCheckout: false,
  };
  const productionRef = knownRef(
    text(source.productionProjectRef),
    source.hasProductionProjectRef,
    process.env.REACT_APP_PRODUCTION_SUPABASE_PROJECT_REF,
    CHECKOUT_PRODUCTION_PROJECT_REF,
  );
  const stagingRef = knownRef(
    text(source.stagingProjectRef),
    source.hasStagingProjectRef,
    process.env.REACT_APP_STAGING_SUPABASE_PROJECT_REF,
    CHECKOUT_STAGING_PROJECT_REF,
  );
  if (!productionRef || !stagingRef || productionRef === stagingRef) return closed;

  const supabaseUrl = source.hasSupabaseUrl
    ? text(source.supabaseUrl)
    : text(process.env.REACT_APP_SUPABASE_URL);
  const projectRef = extractCheckoutProjectRef(supabaseUrl);
  if (!projectRef) return closed;

  const expectedRef = source.hasExpectedProjectRef
    ? text(source.expectedProjectRef)
    : text(process.env.REACT_APP_SUPABASE_EXPECTED_PROJECT_REF);
  if (expectedRef && expectedRef !== projectRef) return closed;

  const declared = environmentName(
    source.hasAppEnvironment
      ? text(source.appEnvironment)
      : text(process.env.REACT_APP_APP_ENVIRONMENT),
  );
  if (declared === 'invalid') return closed;

  const urlIsProduction = projectRef === productionRef;
  const urlIsStaging = projectRef === stagingRef;
  if (!urlIsProduction && !urlIsStaging) return closed;
  if (declared === 'production' && !urlIsProduction) return closed;
  if (declared === 'staging' && !urlIsStaging) return closed;

  const name: CheckoutEnvironmentName = declared || (urlIsProduction ? 'production' : 'staging');
  const hostname = currentHostname(source);
  const productionHost = PRODUCTION_CHECKOUT_HOSTS.has(hostname);
  return {
    name,
    consistent: true,
    allowLivePaymentLinks: name === 'production' && productionHost,
    allowVerifiedTestCheckout: name === 'staging',
  };
}

export function classifyStripeCheckoutUrl(value?: string | null): StripeCheckoutKind {
  const trimmed = text(value);
  if (!trimmed) return 'not_stripe';
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return 'not_stripe';
  }
  if (url.protocol !== 'https:') return 'not_stripe';
  const host = url.hostname.toLowerCase();
  if (host === 'buy.stripe.com' || host === 'pay.stripe.com') return 'payment_link';
  if (host !== 'checkout.stripe.com') return 'not_stripe';
  const marker = `${url.pathname}${url.search}`;
  if (/cs_test_[A-Za-z0-9]+/.test(marker)) return 'test_session';
  if (/cs_live_[A-Za-z0-9]+/.test(marker)) return 'live_session';
  return 'payment_link';
}

export function isStripeCheckoutUrl(value?: string | null): boolean {
  return classifyStripeCheckoutUrl(value) !== 'not_stripe';
}

export function paymentLinkCheckoutAllowed(input?: CheckoutEnvironmentInput): boolean {
  return resolveCheckoutEnvironment(input).allowLivePaymentLinks;
}

export function canFollowCheckoutUrl(
  value: string | null | undefined,
  options?: { verifiedTestSession?: boolean },
  input?: CheckoutEnvironmentInput,
): boolean {
  const kind = classifyStripeCheckoutUrl(value);
  if (kind === 'not_stripe') return false;
  const environment = resolveCheckoutEnvironment(input);
  if (environment.allowLivePaymentLinks) return true;
  return Boolean(
    options?.verifiedTestSession
    && kind === 'test_session'
    && environment.allowVerifiedTestCheckout,
  );
}

export function canOpenExternalUrl(value: string, input?: CheckoutEnvironmentInput): boolean {
  if (!isStripeCheckoutUrl(value)) return true;
  return canFollowCheckoutUrl(value, { verifiedTestSession: false }, input);
}

/** Href for a checkout control. Stripe destinations are removed unless production checkout is open. */
export function visibleCheckoutHref(value?: string | null, input?: CheckoutEnvironmentInput): string | null {
  const trimmed = text(value);
  if (!trimmed) return null;
  if (!isStripeCheckoutUrl(trimmed)) return trimmed;
  return canOpenExternalUrl(trimmed, input) ? trimmed : null;
}

let permitVerifiedAssign = false;

export function stripeAssignIsAllowed(value: string): boolean {
  if (!isStripeCheckoutUrl(value)) return true;
  if (permitVerifiedAssign) return canFollowCheckoutUrl(value, { verifiedTestSession: true });
  return canOpenExternalUrl(value);
}

/** Follow a Checkout Session returned by our server. Live Payment Links never use this path. */
export function navigateToVerifiedTestCheckout(value: string): boolean {
  if (!canFollowCheckoutUrl(value, { verifiedTestSession: true })) return false;
  if (typeof window === 'undefined') return false;
  permitVerifiedAssign = true;
  try {
    window.location.assign(value);
  } finally {
    permitVerifiedAssign = false;
  }
  return true;
}
