const {
  DEFAULT_SUBJECT,
  buildWelcomeEmail,
} = require('../../../netlify/functions/_lib/welcomeEmailBuilder');
const {
  normalizeEmail,
  recipientIdentifier,
} = require('../../../netlify/functions/_lib/emailDeliveryLog');

const allProgramTypes = [
  'independent_family',
  'Independent Family',
  'Camp / Youth Program',
  'Teacher / Classroom',
  'After-School Program',
  'School',
  'District',
  'Homeschool Group',
];

describe('Focus Flame Academy welcome email builder', () => {
  test.each(allProgramTypes)('supports %s safely', (programType) => {
    const staff = !['independent_family', 'Independent Family'].includes(programType);
    const result = buildWelcomeEmail({
      programType,
      templateType: staff ? 'staff' : 'family',
      recipientRole:
        staff && ['Teacher / Classroom', 'School', 'District'].includes(programType)
          ? 'educator'
          : staff
            ? 'facilitator'
            : 'parent_guardian',
      familyAccessCode: staff ? null : 'FAM-ABC234',
      facilitatorAccessCode: staff ? 'FAC-ABC234' : null,
      programCode: 'CMP-ABC234',
      programName: 'North Star Program',
      learnerName: 'Avery',
      portalLink: 'https://caidenscourage.com/portal',
    });

    expect(result.success).toBe(true);
    expect(result.subject).toBe(DEFAULT_SUBJECT);
    expect(result.html).toContain('Welcome to Focus Flame Academy');
    expect(result.html).toContain('A Caiden’s Courage Learning Adventure');
    expect(result.text).toContain('Welcome to Focus Flame Academy');
    expect(result.text).toContain('A Caiden’s Courage Learning Adventure');
    expect(result.ctaUrl).toBe('https://caidenscourage.com/portal');
  });

  test('family email emphasizes only the family access code', () => {
    const result = buildWelcomeEmail({
      programType: 'independent_family',
      templateType: 'family',
      recipientRole: 'parent_guardian',
      recipientName: 'Jordan',
      learnerName: 'Avery',
      programName: 'The Jordan Family',
      familyAccessCode: 'FAM-ABC234',
      programCode: 'CMP-PRIVATE',
      facilitatorAccessCode: 'FAC-PRIVATE',
      portalLink: 'https://caidenscourage.com/portal',
    });

    expect(result.success).toBe(true);
    expect(result.credentialLabel).toBe('Family Access Code');
    expect(result.html).toContain('FAM-ABC234');
    expect(result.text).toContain('FAM-ABC234');
    expect(result.html).not.toContain('CMP-PRIVATE');
    expect(result.html).not.toContain('FAC-PRIVATE');
    expect(result.text).not.toContain('CMP-PRIVATE');
    expect(result.text).not.toContain('FAC-PRIVATE');
    expect(result.ctaLabel).toBe('Open Family Portal');
    expect(result.text).toContain('Your family is ready to begin its Focus Flame adventure.');
  });

  test('camp parent email uses learner context and omits administrative credentials', () => {
    const result = buildWelcomeEmail({
      programType: 'Camp / Youth Program',
      templateType: 'camp_parent',
      recipientRole: 'parent_guardian',
      learnerName: 'Avery',
      programName: 'North Star Camp',
      familyAccessCode: 'CLAIM-ABC234',
      programCode: 'CMP-PRIVATE',
      facilitatorAccessCode: 'FAC-PRIVATE',
      studentPin: '1234',
      portalLink: 'https://caidenscourage.com/portal?claim=approved',
    });

    expect(result.success).toBe(true);
    expect(result.credentialLabel).toBe('Family Claim Code');
    expect(result.html).toContain('CLAIM-ABC234');
    expect(result.html).toContain('Avery');
    expect(result.html).toContain('North Star Camp');
    expect(result.html).not.toContain('CMP-PRIVATE');
    expect(result.html).not.toContain('FAC-PRIVATE');
    expect(result.html).not.toContain('1234');
    expect(result.ctaLabel).toBe('Open Family Portal');
  });

  test.each([
    ['Camp / Youth Program', 'facilitator', 'Facilitator Access Code', 'Open Facilitator Portal'],
    ['After-School Program', 'facilitator', 'Facilitator Access Code', 'Open Facilitator Portal'],
    ['Homeschool Group', 'facilitator', 'Facilitator Access Code', 'Open Facilitator Portal'],
    ['Teacher / Classroom', 'educator', 'Educator Access Code', 'Open Educator Portal'],
    ['School', 'educator', 'Educator Access Code', 'Open Educator Portal'],
    ['District', 'educator', 'Educator Access Code', 'Open Educator Portal'],
  ])('%s staff email selects the canonical credential and CTA', (programType, role, label, cta) => {
    const result = buildWelcomeEmail({
      programType,
      templateType: 'staff',
      recipientRole: role,
      programName: 'North Star Learning Program',
      facilitatorAccessCode: 'FAC-ABC234',
      familyAccessCode: 'FAM-PRIVATE',
      portalLink: 'https://caidenscourage.com/portal',
    });

    expect(result.success).toBe(true);
    expect(result.credentialLabel).toBe(label);
    expect(result.ctaLabel).toBe(cta);
    expect(result.html).toContain('FAC-ABC234');
    expect(result.html).not.toContain('FAM-PRIVATE');
  });

  test('HTML is responsive and safely escapes long and special-character content', () => {
    const longName = `${'A'.repeat(180)} <script>alert("x")</script>`;
    const result = buildWelcomeEmail({
      programType: 'Camp / Youth Program',
      templateType: 'camp_parent',
      recipientRole: 'parent_guardian',
      learnerName: longName,
      programName: `Camp & Academy ${'B'.repeat(220)}`,
      familyAccessCode: 'FAM-LONG234',
      portalLink: 'https://caidenscourage.com/portal',
    });

    expect(result.success).toBe(true);
    expect(result.html).toContain('@media only screen and (max-width: 520px)');
    expect(result.html).toContain('max-width:620px');
    expect(result.html).toContain('&lt;script&gt;');
    expect(result.html).not.toContain('<script>alert');
    expect(result.text).toContain('<script>alert');
  });

  test('optional learner and program names may be absent', () => {
    const result = buildWelcomeEmail({
      programType: 'independent_family',
      templateType: 'family',
      recipientRole: 'parent_guardian',
      familyAccessCode: 'FAM-ABC234',
    });

    expect(result.success).toBe(true);
    expect(result.html).not.toContain('<strong style="color:#ffffff;">Program:</strong>');
    expect(result.html).not.toContain('<strong style="color:#ffffff;">Learner:</strong>');
  });

  test('unsupported program types and missing credentials fail safely', () => {
    expect(buildWelcomeEmail({
      programType: 'Unknown Organization',
      templateType: 'staff',
      facilitatorAccessCode: 'FAC-ABC234',
    })).toEqual(expect.objectContaining({ success: false, error: 'unsupported_program_type' }));

    expect(buildWelcomeEmail({
      programType: 'School',
      templateType: 'staff',
      recipientRole: 'educator',
    })).toEqual(expect.objectContaining({ success: false, error: 'missing_primary_credential' }));
  });

  test('unsafe CTA URLs fall back to the production portal', () => {
    const result = buildWelcomeEmail({
      programType: 'independent_family',
      templateType: 'family',
      familyAccessCode: 'FAM-ABC234',
      portalLink: 'ftp://unsafe.example.com/portal',
    });
    expect(result.success).toBe(true);
    expect(result.ctaUrl).toBe('https://caidenscourage.com/portal');
  });

  test('recipient identifier is a deterministic SHA-256 hash of lower(trim(email))', () => {
    expect(normalizeEmail('  Parent@Example.COM ')).toBe('parent@example.com');
    expect(recipientIdentifier('  Parent@Example.COM ')).toBe(
      recipientIdentifier('parent@example.com'),
    );
    expect(recipientIdentifier('parent@example.com')).toMatch(/^[a-f0-9]{64}$/);
    expect(recipientIdentifier('parent@example.com')).not.toContain('parent');
  });
});
