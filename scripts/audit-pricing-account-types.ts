/**
 * Pricing / account-type / Stripe payment link audit.
 *
 * Usage: yarn audit:pricing-account-types
 */

import fs from 'fs';
import path from 'path';
import { ADMIN_PORTAL_TABS } from '../src/data/adminPortalContent';
import { DEFAULT_PRICING_PLANS } from '../src/data/pricingPlansDefaults';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const MD_PATH = path.join(REPORTS_DIR, 'pricing-account-type-audit.md');
const JSON_PATH = path.join(REPORTS_DIR, 'pricing-account-type-audit.json');

const STRIPE_URL_PATTERN = /https:\/\/buy\.stripe\.com\/[^\s'"`]+/g;

type PricingEntry = {
  location: string;
  label: string;
  price: string;
  stripeUrl: string | null;
  recommendedGroup: 'family' | 'small_group' | 'large_organization' | 'product_shop' | 'marketing_only';
  status: 'dynamic' | 'hardcoded' | 'contact_only' | 'missing_stripe';
  notes: string;
};

type AuditReport = {
  generatedAt: string;
  summary: {
    totalEntries: number;
    dynamic: number;
    hardcoded: number;
    missingStripe: number;
    adminTabConfigured: boolean;
    familyModalDynamic: boolean;
    facilitatorModalDynamic: boolean;
  };
  defaultPlans: Array<{
    id: string;
    group: string;
    planName: string;
    priceLabel: string;
    stripeConfigured: boolean;
  }>;
  entries: PricingEntry[];
  programTypeMapping: Array<{ programType: string; pricingGroup: string }>;
  qaChecklist: Array<{ item: string; pass: boolean; detail: string }>;
};

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function walkDir(dir: string, extensions: Set<string>, results: string[] = []): string[] {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'build' || entry.name === 'dist') continue;
      walkDir(fullPath, extensions, results);
      continue;
    }
    const ext = path.extname(entry.name);
    if (extensions.has(ext)) results.push(fullPath);
  }
  return results;
}

function relPath(absPath: string): string {
  return path.relative(process.cwd(), absPath).replace(/\\/g, '/');
}

function scanStripeUrls(): Array<{ file: string; urls: string[] }> {
  const srcDir = path.join(process.cwd(), 'src');
  const files = walkDir(srcDir, new Set(['.ts', '.tsx']));
  const hits: Array<{ file: string; urls: string[] }> = [];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const urls = [...new Set(source.match(STRIPE_URL_PATTERN) ?? [])];
    if (urls.length) hits.push({ file: relPath(file), urls });
  }
  return hits;
}

function buildEntries(): PricingEntry[] {
  const entries: PricingEntry[] = [];

  for (const plan of DEFAULT_PRICING_PLANS) {
    entries.push({
      location: 'src/data/pricingPlansDefaults.ts',
      label: plan.planName,
      price: plan.priceLabel,
      stripeUrl: plan.stripeUrl || null,
      recommendedGroup: plan.group,
      status: plan.stripeUrl ? 'dynamic' : 'missing_stripe',
      notes: 'Default plan seed — admin overrides via Commerce > Membership Plans (localStorage).',
    });
  }

  const externalLinks = readSource('src/config/externalLinks.ts');
  const productLinks = [
    { key: 'limitedEdition', label: 'Limited Edition Pre-order' },
    { key: 'paperback', label: 'Paperback' },
    { key: 'b4Plush', label: 'B-4 Plush' },
    { key: 'tShirt', label: 'T-Shirt' },
  ];
  for (const item of productLinks) {
    const match = externalLinks.match(new RegExp(`${item.key}:\\s*'(https://buy\\.stripe\\.com/[^']+)'`));
    entries.push({
      location: 'src/config/externalLinks.ts',
      label: item.label,
      price: 'Product page pricing',
      stripeUrl: match?.[1] ?? null,
      recommendedGroup: 'product_shop',
      status: 'hardcoded',
      notes: 'Shop / product preorder links — not part of the Hardcover Bundle commerce_products setting.',
    });
  }

  entries.push({
    location: 'public.commerce_products',
    label: 'Hardcover Bundle',
    price: 'commerce_products.display_price_cents',
    stripeUrl: null,
    recommendedGroup: 'product_shop',
    status: 'dynamic',
    notes: 'Admin-managed via Commerce > Products; runtime does not use productLinks.hardcoverBundle.',
  });

  const personaSource = readSource('src/config/personaPages.ts');
  const personaStripeHits = [...personaSource.matchAll(/title:\s*'([^']+)'[\s\S]*?href:\s*'(https:\/\/buy\.stripe\.com\/[^']+)'/g)];
  for (const hit of personaStripeHits) {
    entries.push({
      location: 'src/config/personaPages.ts (marketing)',
      label: hit[1],
      price: 'See persona page tier',
      stripeUrl: hit[2],
      recommendedGroup: hit[1].includes('Camp') ? 'small_group' : 'marketing_only',
      status: 'hardcoded',
      notes: 'Public marketing persona page — still hardcoded; align with admin config in a follow-up.',
    });
  }

  const familyModal = readSource('src/components/family-portal/FamilyUpgradePricingModal.tsx');
  entries.push({
    location: 'src/components/family-portal/FamilyUpgradePricingModal.tsx',
    label: 'Family upgrade modal',
    price: 'From pricing config',
    stripeUrl: null,
    recommendedGroup: 'family',
    status: familyModal.includes('usePricingPlansConfig') ? 'dynamic' : 'hardcoded',
    notes: 'Pulls active family plans via usePricingPlansConfig.',
  });

  const facilitatorModal = readSource('src/components/pilot-dashboard/PilotUpgradePricingModal.tsx');
  entries.push({
    location: 'src/components/pilot-dashboard/PilotUpgradePricingModal.tsx',
    label: 'Facilitator upgrade modal',
    price: 'From pricing config by program type',
    stripeUrl: null,
    recommendedGroup: 'small_group',
    status:
      facilitatorModal.includes('usePricingPlansConfig') &&
      facilitatorModal.includes('resolvePricingPlanGroup')
        ? 'dynamic'
        : 'hardcoded',
    notes: 'Maps program type → family | small_group | large_organization.',
  });

  const contactOnlyPages = [
    { file: 'Families persona pricing', price: '$79/year, $129/year', note: 'Contact / waitlist CTAs' },
    { file: 'Teachers persona pricing', price: '$99/year', note: 'Contact CTA only' },
    { file: 'Schools persona pricing', price: '$999–$2,500/year, $1,999–$5,000+', note: 'Contact CTA only' },
  ];
  for (const page of contactOnlyPages) {
    entries.push({
      location: 'src/config/personaPages.ts (marketing)',
      label: page.file,
      price: page.price,
      stripeUrl: null,
      recommendedGroup: 'marketing_only',
      status: 'contact_only',
      notes: page.note,
    });
  }

  return entries;
}

function buildQaChecklist(): AuditReport['qaChecklist'] {
  const familyModal = readSource('src/components/family-portal/FamilyUpgradePricingModal.tsx');
  const facilitatorModal = readSource('src/components/pilot-dashboard/PilotUpgradePricingModal.tsx');
  const configurableCard = readSource('src/components/shared/ConfigurablePricingCard.tsx');
  const resolver = readSource('src/lib/pricingPlanResolver.ts');

  return [
    {
      item: 'Admin Commerce tab',
      pass: ADMIN_PORTAL_TABS.some((tab) => tab.id === 'commerce'),
      detail: 'Admin portal exposes unified Commerce tab',
    },
    {
      item: 'Family Portal upgrade modal uses config',
      pass: familyModal.includes('usePricingPlansConfig') && !familyModal.includes('buy.stripe.com'),
      detail: 'No hardcoded Stripe URLs in family modal',
    },
    {
      item: 'Facilitator upgrade modal uses config',
      pass:
        facilitatorModal.includes('usePricingPlansConfig') &&
        facilitatorModal.includes('resolvePricingPlanGroup') &&
        !facilitatorModal.includes('buy.stripe.com'),
      detail: 'No hardcoded Stripe URLs in facilitator modal',
    },
    {
      item: 'Missing Stripe link fallback',
      pass:
        configurableCard.includes('Payment link not configured') &&
        configurableCard.includes('isStripeLinkConfigured'),
      detail: 'Disabled CTA + message when Stripe URL missing',
    },
    {
      item: 'Camp / After-School share small_group',
      pass:
        resolver.includes("'Camp / Youth Program'") &&
        resolver.includes("'After-School Program'") &&
        resolver.includes('small_group'),
      detail: 'Both program types resolve to small_group pricing',
    },
    {
      item: 'Independent Family uses family plans',
      pass: resolver.includes("'Independent Family'") && resolver.includes("return 'family'"),
      detail: 'Independent Family resolves to family pricing group',
    },
    {
      item: 'School / District use large_organization',
      pass: resolver.includes("'School'") && resolver.includes("'District'") && resolver.includes('large_organization'),
      detail: 'School and District resolve to large_organization plans',
    },
  ];
}

function runAudit(): AuditReport {
  const entries = buildEntries();
  const qaChecklist = buildQaChecklist();
  const stripeScan = scanStripeUrls();

  const hardcodedFiles = stripeScan.filter(
    ({ file }) =>
      !file.includes('pricingPlansDefaults.ts') &&
      !file.includes('FamilyUpgradePricingModal') &&
      !file.includes('PilotUpgradePricingModal') &&
      !file.includes('ConfigurablePricingCard'),
  );

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalEntries: entries.length,
      dynamic: entries.filter((e) => e.status === 'dynamic').length,
      hardcoded: entries.filter((e) => e.status === 'hardcoded').length,
      missingStripe: entries.filter((e) => e.status === 'missing_stripe').length,
      adminTabConfigured: qaChecklist.find((c) => c.item === 'Admin Commerce tab')?.pass ?? false,
      familyModalDynamic: qaChecklist.find((c) => c.item === 'Family Portal upgrade modal uses config')?.pass ?? false,
      facilitatorModalDynamic:
        qaChecklist.find((c) => c.item === 'Facilitator upgrade modal uses config')?.pass ?? false,
    },
    defaultPlans: DEFAULT_PRICING_PLANS.map((plan) => ({
      id: plan.id,
      group: plan.group,
      planName: plan.planName,
      priceLabel: plan.priceLabel,
      stripeConfigured: Boolean(plan.stripeUrl),
    })),
    entries,
    programTypeMapping: [
      { programType: 'Independent Family', pricingGroup: 'family' },
      { programType: 'Camp / Youth Program', pricingGroup: 'small_group' },
      { programType: 'After-School Program', pricingGroup: 'small_group' },
      { programType: 'Homeschool Group', pricingGroup: 'small_group' },
      { programType: 'Teacher / Classroom', pricingGroup: 'small_group' },
      { programType: 'School', pricingGroup: 'large_organization' },
      { programType: 'District', pricingGroup: 'large_organization' },
    ],
    qaChecklist: [
      ...qaChecklist,
      {
        item: 'Hardcoded Stripe URLs outside defaults',
        pass: hardcodedFiles.length <= 2,
        detail: hardcodedFiles.map(({ file }) => file).join(', ') || 'None',
      },
    ],
  };
}

function renderMarkdown(report: AuditReport): string {
  const lines: string[] = [
    '# Pricing & Account Type Audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Total catalogued entries: **${report.summary.totalEntries}**`,
    `- Dynamic (portal config): **${report.summary.dynamic}**`,
    `- Hardcoded Stripe links: **${report.summary.hardcoded}**`,
    `- Missing Stripe links in defaults: **${report.summary.missingStripe}**`,
    `- Admin Commerce tab: **${report.summary.adminTabConfigured ? 'yes' : 'no'}**`,
    `- Family modal dynamic: **${report.summary.familyModalDynamic ? 'yes' : 'no'}**`,
    `- Facilitator modal dynamic: **${report.summary.facilitatorModalDynamic ? 'yes' : 'no'}**`,
    '',
    '## Pricing groups',
    '',
    '| Group | Account / program types |',
    '| --- | --- |',
    '| **Family** | Family Portal, Digital Book + Family Portal, Independent Family |',
    '| **Small Group** | Camp / Youth Program, After-School Program, Homeschool Group, Teacher / Classroom |',
    '| **Large Organization** | School, District, large camp / after-school (Camp Plus tier) |',
    '',
    '## Program type → pricing group',
    '',
    '| Program type | Pricing group |',
    '| --- | --- |',
    ...report.programTypeMapping.map((row) => `| ${row.programType} | ${row.pricingGroup} |`),
    '',
    '## Default portal plans (admin-editable)',
    '',
    '| Plan | Group | Price | Stripe configured |',
    '| --- | --- | --- | --- |',
    ...report.defaultPlans.map(
      (plan) =>
        `| ${plan.planName} | ${plan.group} | ${plan.priceLabel} | ${plan.stripeConfigured ? 'yes' : 'no — CTA disabled'} |`,
    ),
    '',
    '## Discovered prices & payment links',
    '',
    '| Location | Label | Price | Stripe URL | Group | Status | Notes |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.entries.map((entry) => {
      const url = entry.stripeUrl ? `[link](${entry.stripeUrl})` : '—';
      return `| ${entry.location} | ${entry.label} | ${entry.price} | ${url} | ${entry.recommendedGroup} | ${entry.status} | ${entry.notes} |`;
    }),
    '',
    '## Still hardcoded (recommended follow-up)',
    '',
    '- `src/config/personaPages.ts` — Camp Pilot / Camp Plus marketing CTAs use Stripe URLs directly.',
    '- `src/config/externalLinks.ts` — product shop preorder links (limited edition, paperback, merch).',
    '- Marketing persona pages for Families, Teachers, and Schools use contact CTAs or inline prices not yet wired to admin config.',
    '',
    '## Missing Stripe links (defaults)',
    '',
    ...report.defaultPlans
      .filter((plan) => !plan.stripeConfigured)
      .map((plan) => `- **${plan.planName}** (${plan.group}) — configure in Admin → Commerce → Membership Plans`),
    '',
    '## QA checklist',
    '',
    '| Check | Pass | Detail |',
    '| --- | --- | --- |',
    ...report.qaChecklist.map((check) => `| ${check.item} | ${check.pass ? '✅' : '❌'} | ${check.detail} |`),
    '',
    '## Admin configuration',
    '',
    'Edit plans at **Admin Portal → Commerce → Membership Plans** (`/admin/commerce?tab=memberships`).',
    'Changes persist in browser localStorage (`cc-pricing-plans-config`) and broadcast via `cc-pricing-plans-updated`.',
    '',
  ];

  return lines.join('\n');
}

function main(): void {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const report = runAudit();
  fs.writeFileSync(JSON_PATH, JSON.stringify(report, null, 2));
  fs.writeFileSync(MD_PATH, renderMarkdown(report));

  const failed = report.qaChecklist.filter((check) => !check.pass);
  console.log(`Wrote ${MD_PATH}`);
  console.log(`Wrote ${JSON_PATH}`);
  console.log(`QA checks: ${report.qaChecklist.length - failed.length}/${report.qaChecklist.length} passed`);
  if (failed.length) {
    console.warn('Failed checks:');
    for (const check of failed) console.warn(`  - ${check.item}: ${check.detail}`);
  }
}

main();
