const DEFAULT_PORTAL_URL = 'https://caidenscourage.com/portal';
const DEFAULT_SUBJECT = 'Welcome to Focus Flame Academy — Your Adventure Starts Here';
const SUPPORT_EMAIL = 'hello@caidenscourage.com';

const FAMILY_TYPES = new Set(['independent_family', 'Independent Family', 'Homeschool Group']);
const EDUCATOR_TYPES = new Set(['Teacher / Classroom', 'School', 'District']);
const CAMP_TYPES = new Set(['Camp / Youth Program', 'After-School Program']);
const SUPPORTED_PROGRAM_TYPES = new Set([...FAMILY_TYPES, ...EDUCATOR_TYPES, ...CAMP_TYPES]);
const SUPPORTED_TEMPLATE_TYPES = new Set(['family', 'camp_parent', 'staff']);

function text(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safePortalUrl(value) {
  const candidate = text(value, DEFAULT_PORTAL_URL);
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'https:' || (parsed.protocol === 'http:' && parsed.hostname === 'localhost')) {
      return parsed.toString();
    }
  } catch {
    // Fall through to the production-safe canonical URL.
  }
  return DEFAULT_PORTAL_URL;
}

function resolveTemplateType(payload) {
  if (SUPPORTED_TEMPLATE_TYPES.has(payload.templateType)) return payload.templateType;
  if (payload.recipientRole === 'parent_guardian' && CAMP_TYPES.has(payload.programType)) {
    return 'camp_parent';
  }
  if (payload.recipientRole === 'facilitator' || payload.recipientRole === 'educator') {
    return 'staff';
  }
  return 'family';
}

function resolveWelcomeContent(payload) {
  const programType = text(payload.programType, 'Independent Family');
  const templateType = resolveTemplateType(payload);
  const recipientRole =
    text(payload.recipientRole) ||
    (templateType === 'staff' ? (EDUCATOR_TYPES.has(programType) ? 'educator' : 'facilitator') : 'parent_guardian');
  const programName = text(payload.programName);
  const learnerName = text(payload.learnerName || payload.studentName || payload.childName);
  const portalLink = safePortalUrl(payload.portalLink || payload.loginUrl);

  if (templateType === 'staff') {
    const educator = EDUCATOR_TYPES.has(programType) || recipientRole === 'educator';
    const credential = text(payload.facilitatorAccessCode || payload.programCode);
    return {
      templateType,
      programType,
      recipientRole: educator ? 'educator' : 'facilitator',
      greeting: 'Welcome aboard. Your Focus Flame Academy program is ready for learners.',
      credentialLabel: educator ? 'Educator Access Code' : 'Facilitator Access Code',
      credential,
      credentialHelp: educator
        ? 'Use this code to securely open your educator workspace.'
        : 'Use this code to securely manage your program and roster.',
      ctaLabel: educator ? 'Open Educator Portal' : 'Open Facilitator Portal',
      ctaUrl: portalLink,
      programName,
      learnerName: '',
      nextSteps: educator
        ? 'Sign in, add or manage learners, open weekly adventures, review progress, and access program resources.'
        : 'Sign in, confirm your roster, invite families when appropriate, and prepare the first weekly adventure.',
    };
  }

  if (templateType === 'camp_parent') {
    const credential = text(payload.familyAccessCode || payload.claimCode);
    return {
      templateType,
      programType,
      recipientRole: 'parent_guardian',
      greeting: learnerName
        ? `Welcome aboard. ${learnerName} is ready to begin their Focus Flame adventure${programName ? ` with ${programName}` : ''}.`
        : `Welcome aboard. Your learner is ready to begin their Focus Flame adventure${programName ? ` with ${programName}` : ''}.`,
      credentialLabel: credential.startsWith('CLAIM-') ? 'Family Claim Code' : 'Family Access Code',
      credential,
      credentialHelp: 'Use this code to securely connect to your learner.',
      ctaLabel: 'Open Family Portal',
      ctaUrl: portalLink,
      programName,
      learnerName,
      nextSteps: 'Connect to your learner, follow progress and rewards, view certificates, and keep up with program activity.',
    };
  }

  const credential = text(payload.familyAccessCode || payload.claimCode);
  return {
    templateType: 'family',
    programType,
    recipientRole: 'parent_guardian',
    greeting: 'Welcome aboard. Your family is ready to begin its Focus Flame adventure.',
    credentialLabel: credential.startsWith('CLAIM-') ? 'Family Claim Code' : 'Family Access Code',
    credential,
    credentialHelp: 'Use this code to securely connect to your child.',
    ctaLabel: 'Open Family Portal',
    ctaUrl: portalLink,
    programName,
    learnerName,
    nextSteps: 'Connect to your child, view progress and rewards, celebrate certificates, and begin the first learning adventure.',
  };
}

function buildWelcomeEmail(payload) {
  const content = resolveWelcomeContent(payload);
  if (!SUPPORTED_PROGRAM_TYPES.has(content.programType)) {
    return {
      success: false,
      error: 'unsupported_program_type',
      programType: content.programType,
      templateType: content.templateType,
    };
  }
  if (!content.credential) {
    return {
      success: false,
      error: 'missing_primary_credential',
      programType: content.programType,
      templateType: content.templateType,
    };
  }

  const greetingName = text(payload.recipientName || payload.parentFirstName);
  const greeting = greetingName ? `Hi ${greetingName},` : 'Hello,';
  const details = [
    content.programName ? `Program: ${content.programName}` : null,
    content.learnerName ? `Learner: ${content.learnerName}` : null,
  ].filter(Boolean);
  const plainText = [
    'CAIDEN’S COURAGE',
    '',
    'Welcome to Focus Flame Academy',
    'A Caiden’s Courage Learning Adventure',
    '',
    greeting,
    '',
    content.greeting,
    '',
    content.credentialLabel.toUpperCase(),
    content.credential,
    content.credentialHelp,
    '',
    content.ctaLabel,
    content.ctaUrl,
    ...(details.length ? ['', ...details] : []),
    '',
    'Next steps:',
    content.nextSteps,
    '',
    `Need help? Contact ${SUPPORT_EMAIL}.`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      @media only screen and (max-width: 520px) {
        .email-wrap { padding: 12px !important; }
        .email-card { border-radius: 14px !important; }
        .email-header, .email-body { padding: 22px 18px !important; }
        .email-title { font-size: 28px !important; }
        .credential { font-size: 24px !important; letter-spacing: .08em !important; }
        .cta { display: block !important; text-align: center !important; }
      }
    </style>
  </head>
  <body style="margin:0;background:#07101f;">
    <div class="email-wrap" style="margin:0;padding:28px;background:#07101f;font-family:Inter,Arial,sans-serif;color:#f8fafc;">
      <div class="email-card" style="max-width:620px;margin:0 auto;border:1px solid rgba(229,192,106,.30);border-radius:18px;background:#0f1b2d;overflow:hidden;">
        <div class="email-header" style="padding:26px 28px;border-bottom:1px solid rgba(229,192,106,.22);">
          <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#e5c06a;">CAIDEN’S COURAGE</div>
          <h1 class="email-title" style="margin:9px 0 8px;font-size:32px;line-height:1.12;color:#ffffff;">Welcome to Focus Flame Academy</h1>
          <p style="margin:0;color:#a9c7f8;font-size:15px;">A Caiden’s Courage Learning Adventure</p>
        </div>
        <div class="email-body" style="padding:28px;font-size:16px;line-height:1.65;color:#dbeafe;">
          <p style="margin:0 0 14px;">${escapeHtml(greeting)}</p>
          <h2 style="margin:0 0 12px;font-size:22px;color:#ffffff;">Your Learning Adventure Begins</h2>
          <p style="margin:0 0 22px;">${escapeHtml(content.greeting)}</p>
          <div style="margin:0 0 22px;padding:20px;border-radius:14px;background:rgba(229,192,106,.12);border:1px solid rgba(229,192,106,.32);text-align:center;">
            <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#e5c06a;font-weight:700;">${escapeHtml(content.credentialLabel)}</div>
            <div class="credential" style="margin:8px 0 5px;font-size:29px;letter-spacing:.11em;color:#ffffff;font-weight:800;word-break:break-word;">${escapeHtml(content.credential)}</div>
            <div style="font-size:14px;color:#a7b4cc;">${escapeHtml(content.credentialHelp)}</div>
          </div>
          <p style="margin:0 0 24px;"><a class="cta" href="${escapeHtml(content.ctaUrl)}" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#4f7df3;color:#ffffff;text-decoration:none;font-weight:700;">${escapeHtml(content.ctaLabel)}</a></p>
          ${content.programName ? `<p style="margin:0 0 7px;"><strong style="color:#ffffff;">Program:</strong> ${escapeHtml(content.programName)}</p>` : ''}
          ${content.learnerName ? `<p style="margin:0 0 18px;"><strong style="color:#ffffff;">Learner:</strong> ${escapeHtml(content.learnerName)}</p>` : ''}
          <p style="margin:0 0 18px;color:#a7b4cc;"><strong style="color:#dbeafe;">Next steps:</strong> ${escapeHtml(content.nextSteps)}</p>
          <p style="margin:0;color:#a7b4cc;">Need help? Contact <a href="mailto:${SUPPORT_EMAIL}" style="color:#e5c06a;">${SUPPORT_EMAIL}</a>.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

  return {
    success: true,
    subject: DEFAULT_SUBJECT,
    html,
    text: plainText,
    templateType: content.templateType,
    programType: content.programType,
    recipientRole: content.recipientRole,
    ctaLabel: content.ctaLabel,
    ctaUrl: content.ctaUrl,
    credentialLabel: content.credentialLabel,
  };
}

module.exports = {
  DEFAULT_PORTAL_URL,
  DEFAULT_SUBJECT,
  SUPPORTED_PROGRAM_TYPES,
  buildWelcomeEmail,
  resolveTemplateType,
  safePortalUrl,
};
