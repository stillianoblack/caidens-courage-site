import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActiveChildNickname } from '../config/activeChildNickname';
import { readActivePortalRole } from '../config/portalContext';
import {
  FACILITATOR_PORTAL_PATH,
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import { PILOT_SIDEBAR_NAV, type PilotSidebarNavId } from '../data/pilotDashboardContent';
import { loadAdultAssessmentSession } from './adultAssessmentStorage';
import {
  findLocalAdultParticipant,
  findLocalStudentParticipant,
} from './pilotTrackingLocalStorage';
import { resolvePortalPageTitle } from './familyPortalNav';

export const GA4_MEASUREMENT_ID = 'G-X3FLSWS5L7';
export const CLARITY_PROJECT_ID = 'x3m4u6g96g';

export type PortalType = 'family' | 'facilitator' | 'portal_gateway' | 'public';

export type AnalyticsUserData = {
  participant_id?: string;
  nickname?: string;
  role?: string;
  program_code?: string;
  organization?: string;
};

export type PageViewParams = {
  page_path: string;
  page_title: string;
  page_section?: string;
  portal_type: PortalType;
  user_role?: string | null;
  program_code?: string | null;
};

export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

type GtagFn = (...args: unknown[]) => void;
type ClarityFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
    clarity?: ClarityFn;
  }
}

const FACILITATOR_NAV_TITLE: Record<PilotSidebarNavId, string> = Object.fromEntries(
  PILOT_SIDEBAR_NAV.map((item) => [item.id, item.label]),
) as Record<PilotSidebarNavId, string>;

const VALID_FACILITATOR_NAV = new Set(PILOT_SIDEBAR_NAV.map((item) => item.id));

let initialized = false;
let gaConfigured = false;
let lastPageViewKey = '';
const queuedGaCalls: Array<Parameters<GtagFn>> = [];

const isBrowser = typeof window !== 'undefined';
const isDev = process.env.NODE_ENV === 'development';
const gaDebugEnabled = process.env.REACT_APP_GA_DEBUG === 'true';

function loadScript(src: string, id?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      resolve();
      return;
    }
    if (id && document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    if (id) script.id = id;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

function getGtag(): GtagFn | null {
  return isBrowser && typeof window.gtag === 'function' ? window.gtag : null;
}

function getClarity(): ClarityFn | null {
  return isBrowser && typeof window.clarity === 'function' ? window.clarity : null;
}

function sanitizeParams(params: AnalyticsEventParams): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    clean[key] = value;
  }
  return clean;
}

export function resolvePortalType(pathname: string): PortalType {
  if (pathname === '/portal' || pathname.startsWith('/portal/dashboard')) {
    return 'portal_gateway';
  }
  if (pathname.startsWith(FAMILY_PORTAL_PATH) || pathname.startsWith(FAMILY_HUB_PATH)) {
    return 'family';
  }
  if (
    pathname.startsWith(FACILITATOR_PORTAL_PATH) ||
    pathname.startsWith(PROGRAM_DASHBOARD_PATH) ||
    pathname.startsWith('/portal/blueribbon')
  ) {
    return 'facilitator';
  }
  return 'public';
}

export function resolveAnalyticsPageTitle(pathname: string, hash = ''): string {
  const portalType = resolvePortalType(pathname);
  if (portalType === 'family') {
    return resolvePortalPageTitle(pathname);
  }

  const navId = hash.replace('#', '') as PilotSidebarNavId;
  if (portalType === 'facilitator' && navId && VALID_FACILITATOR_NAV.has(navId)) {
    return FACILITATOR_NAV_TITLE[navId];
  }

  if (isBrowser && document.title) {
    return document.title.replace(/\s*\|\s*Caiden's Courage\s*$/i, '').trim();
  }
  return pathname;
}

export function resolveAnalyticsPageSection(pathname: string, hash = ''): string | undefined {
  const portalType = resolvePortalType(pathname);
  const navId = hash.replace('#', '') as PilotSidebarNavId;
  if (portalType === 'facilitator' && navId && VALID_FACILITATOR_NAV.has(navId)) {
    return navId;
  }
  if (portalType === 'family') {
    return resolvePortalPageTitle(pathname);
  }
  return undefined;
}

export function resolveCurrentProgramCode(): string | null {
  return readActivePilotProgram()?.programCode ?? null;
}

export function resolveCurrentUserRole(): string | null {
  return readActivePortalRole();
}

export function resolveCurrentParticipantForAnalytics(): AnalyticsUserData | null {
  const programCode = resolveCurrentProgramCode();
  const portalRole = readActivePortalRole();

  const nickname = readActiveChildNickname();
  if (nickname && programCode) {
    const student = findLocalStudentParticipant({
      nickname,
      role: 'student',
      programCode,
    });
    if (student) {
      return {
        participant_id: student.id,
        nickname: student.nickname,
        role: 'student',
        program_code: programCode,
      };
    }
  }

  const adultSession = loadAdultAssessmentSession().profile;
  if (adultSession?.email && programCode) {
    const adultRole = portalRole === 'family' ? 'parent' : 'facilitator';
    const adult = findLocalAdultParticipant({
      email: adultSession.email,
      programCode,
    });
    if (adult) {
      return {
        participant_id: adult.id,
        role: adultRole,
        organization: adult.organization ?? adult.group_name,
        program_code: programCode,
      };
    }
  }

  if (portalRole && programCode) {
    return { role: portalRole, program_code: programCode };
  }

  return null;
}

function applyClarityTags(tags: AnalyticsEventParams): void {
  const clarity = getClarity();
  if (!clarity) return;
  for (const [key, value] of Object.entries(tags)) {
    if (value === null || value === undefined || value === '') continue;
    clarity('set', key, String(value));
  }
}

function sendGa4Event(eventName: string, params: AnalyticsEventParams): void {
  const args: Parameters<GtagFn> = ['event', eventName, sanitizeParams(params)];
  const gtag = getGtag();
  if (!gtag || !gaConfigured) {
    queuedGaCalls.push(args);
    return;
  }
  gtag(...args);
}

function sendGa4UserProperties(userData: AnalyticsUserData): void {
  const properties = sanitizeParams({
    participant_id: userData.participant_id,
    nickname: userData.nickname,
    user_role: userData.role,
    program_code: userData.program_code,
    organization: userData.organization,
  });
  if (Object.keys(properties).length === 0) return;

  const args: Parameters<GtagFn> = ['set', 'user_properties', properties];
  const gtag = getGtag();
  if (!gtag || !gaConfigured) {
    queuedGaCalls.push(args);
    return;
  }
  gtag(...args);
}

function flushQueuedGaCalls(): void {
  const gtag = getGtag();
  if (!gtag || !gaConfigured) return;
  while (queuedGaCalls.length > 0) {
    const args = queuedGaCalls.shift();
    if (args) gtag(...args);
  }
}

/** Initialize GA4 and Microsoft Clarity. Safe to call multiple times. */
export function initAnalytics(): void {
  if (!isBrowser || initialized) return;
  initialized = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  void loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`, 'ga4-script')
    .then(() => {
      const gtag = getGtag();
      if (!gtag) return;
      gtag('js', new Date());
      gtag('config', GA4_MEASUREMENT_ID, {
        send_page_view: false,
        debug_mode: gaDebugEnabled,
      });
      gaConfigured = true;
      flushQueuedGaCalls();
    })
    .catch((error) => {
      if (isDev) console.warn('[analytics] GA4 failed to load', error);
    });

  window.clarity =
    window.clarity ??
    function clarityStub(...args: unknown[]) {
      (window.clarity as ClarityFn & { q?: unknown[] }).q =
        (window.clarity as ClarityFn & { q?: unknown[] }).q ?? [];
      (window.clarity as ClarityFn & { q?: unknown[] }).q?.push(args);
    };

  void loadScript(`https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`, 'clarity-script').catch((error) => {
    if (isDev) console.warn('[analytics] Clarity failed to load', error);
  });

  const participant = resolveCurrentParticipantForAnalytics();
  if (participant) {
    identifyUser(participant);
  } else {
    syncContextTags();
  }
}

function syncContextTags(): void {
  applyClarityTags({
    portal_type: resolvePortalType(window.location.pathname),
    program_code: resolveCurrentProgramCode(),
    user_role: resolveCurrentUserRole(),
  });
}

function hasSessionPortalEvent(eventName: string): boolean {
  try {
    return sessionStorage.getItem(`cc-analytics-${eventName}`) === '1';
  } catch {
    return false;
  }
}

function markSessionPortalEvent(eventName: string): void {
  try {
    sessionStorage.setItem(`cc-analytics-${eventName}`, '1');
  } catch {
    /* sessionStorage unavailable */
  }
}

/** Fire a page_view on route change. Deduplicates identical consecutive views. */
export function trackPageView(overrides: Partial<PageViewParams> = {}): void {
  if (!isBrowser) return;

  const pathname = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;
  const page_path = overrides.page_path ?? `${pathname}${search}${hash}`;
  const portal_type = overrides.portal_type ?? resolvePortalType(pathname);
  const page_title =
    overrides.page_title ?? resolveAnalyticsPageTitle(pathname, hash);
  const page_section =
    overrides.page_section ?? resolveAnalyticsPageSection(pathname, hash);
  const user_role = overrides.user_role ?? resolveCurrentUserRole();
  const program_code = overrides.program_code ?? resolveCurrentProgramCode();

  const dedupeKey = `${page_path}|${page_title}|${page_section ?? ''}`;
  if (dedupeKey === lastPageViewKey) return;
  lastPageViewKey = dedupeKey;

  const params: AnalyticsEventParams = {
    page_path,
    page_title,
    page_section,
    portal_type,
    user_role,
    program_code,
  };

  sendGa4Event('page_view', params);
  applyClarityTags({ portal_type, program_code, user_role });

  if (isDev || gaDebugEnabled) {
    console.debug('[analytics] page_view', sanitizeParams(params));
  }
}

/** Track a custom analytics event across GA4 and Clarity. */
export function trackEvent(eventName: string, params: AnalyticsEventParams = {}): void {
  if (!isBrowser) return;

  const enriched = sanitizeParams({
    portal_type: resolvePortalType(window.location.pathname),
    program_code: resolveCurrentProgramCode(),
    user_role: resolveCurrentUserRole(),
    ...params,
  });

  sendGa4Event(eventName, enriched);

  const clarity = getClarity();
  if (clarity) {
    clarity('event', eventName);
    for (const [key, value] of Object.entries(enriched)) {
      clarity('set', key, String(value));
    }
  }

  if (isDev || gaDebugEnabled) {
    console.debug(`[analytics] ${eventName}`, enriched);
  }
}

/** Identify the current participant for GA4 user properties and Clarity recordings. */
export function identifyUser(userData: AnalyticsUserData): void {
  if (!isBrowser) return;

  const safe: AnalyticsUserData = {
    participant_id: userData.participant_id,
    nickname: userData.nickname,
    role: userData.role,
    program_code: userData.program_code,
    organization: userData.organization,
  };

  sendGa4UserProperties(safe);

  const clarity = getClarity();
  if (clarity && safe.participant_id) {
    const friendlyName = safe.nickname ?? safe.role ?? 'participant';
    clarity('identify', safe.participant_id, undefined, undefined, friendlyName);
  }

  applyClarityTags({
    portal_type: resolvePortalType(window.location.pathname),
    program_code: safe.program_code ?? resolveCurrentProgramCode(),
    user_role: safe.role ?? resolveCurrentUserRole(),
  });

  if (isDev || gaDebugEnabled) {
    console.debug('[analytics] identify', safe);
  }
}

/** Re-sync identity and tags after login, profile save, or program unlock. */
export function refreshAnalyticsIdentity(): void {
  const participant = resolveCurrentParticipantForAnalytics();
  if (participant) {
    identifyUser(participant);
  } else {
    syncContextTags();
  }
}

export function trackPortalViewed(): void {
  if (hasSessionPortalEvent('portal_viewed')) return;
  markSessionPortalEvent('portal_viewed');
  trackEvent('portal_viewed', { source_page: window.location.pathname });
}

export function trackFamilyPortalViewed(): void {
  if (hasSessionPortalEvent('family_portal_viewed')) return;
  markSessionPortalEvent('family_portal_viewed');
  trackEvent('family_portal_viewed');
  refreshAnalyticsIdentity();
}

export function trackFacilitatorPortalViewed(): void {
  if (hasSessionPortalEvent('facilitator_portal_viewed')) return;
  markSessionPortalEvent('facilitator_portal_viewed');
  trackEvent('facilitator_portal_viewed');
  refreshAnalyticsIdentity();
}

export function trackWeeklyModuleOpened(params: {
  week: number;
  title: string;
  role?: string;
}): void {
  trackEvent('weekly_module_opened', params);
}

export function trackWeeklyModuleDownloaded(params: {
  week: number;
  title: string;
  role?: string;
}): void {
  trackEvent('weekly_module_downloaded', params);
}

export function trackDownload(
  eventName:
    | 'coloring_page_downloaded'
    | 'worksheet_downloaded'
    | 'facilitator_guide_downloaded'
    | 'certificate_downloaded'
    | 'activity_downloaded',
  asset_name: string,
  asset_type?: string,
): void {
  trackEvent(eventName, { asset_name, asset_type });
}

export function trackCtaClick(label: string, href: string, sourcePage?: string): void {
  const lower = label.toLowerCase();
  const params = { source_page: sourcePage ?? window.location.pathname };

  if (
    lower.includes('schedule') ||
    lower.includes('demo') ||
    lower.includes('call') ||
    lower.includes('book')
  ) {
    trackSalesFunnel('request_demo_clicked', params);
    return;
  }

  if (
    lower.includes('pilot') ||
    lower.includes('request') ||
    lower.includes('start camp') ||
    lower.includes('get started') ||
    lower.includes('enroll') ||
    href.includes('/contact') ||
    href.includes('#pilot')
  ) {
    trackSalesFunnel('pilot_interest_clicked', params);
  }
}

let contactFormStarted = false;

export function trackContactFormStarted(sourcePage?: string): void {
  if (contactFormStarted) return;
  contactFormStarted = true;
  trackSalesFunnel('contact_form_started', { source_page: sourcePage });
}

export function trackContactFormSubmitted(sourcePage?: string): void {
  trackSalesFunnel('contact_form_submitted', { source_page: sourcePage });
}

export function trackSalesFunnel(
  eventName:
    | 'request_demo_clicked'
    | 'pilot_interest_clicked'
    | 'contact_form_started'
    | 'contact_form_submitted'
    | 'pricing_viewed'
    | 'support_pilot_clicked',
  params: { source_page?: string; portal?: string } = {},
): void {
  trackEvent(eventName, {
    source_page: params.source_page ?? window.location.pathname,
    portal: params.portal ?? resolvePortalType(window.location.pathname),
  });
}
