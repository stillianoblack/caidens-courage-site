export type ProgramCodeChangeEmailInput = {
  adminEmail?: string | null;
  programName?: string | null;
  programCode?: string | null;
  familyAccessCode?: string | null;
  facilitatorAccessCode?: string | null;
  relatedProgramId?: string | null;
};

export type ProgramCodeChangeEmailResult = {
  success: boolean;
  skipped: boolean;
  reason?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type ResolvedProgramCodeChangeEmailInput = {
  programName: string;
  programCode: string;
  familyAccessCode: string;
  facilitatorAccessCode: string;
};

function buildProgramCodeChangeBody(input: ResolvedProgramCodeChangeEmailInput): string {
  return [
    `Program codes have been updated for ${input.programName}.`,
    '',
    `Program name: ${input.programName}`,
    `New Program Code: ${input.programCode}`,
    `New Family Access Code: ${input.familyAccessCode}`,
    `New Facilitator Code: ${input.facilitatorAccessCode}`,
    '',
    'Existing student progress, badges, rewards, assessments, family links, and family accounts were preserved.',
    '',
    'Use the new codes for future facilitator and family portal access.',
    '',
    "The Caiden's Courage Team",
  ].join('\n');
}

function buildProgramCodeChangeHtml(input: ResolvedProgramCodeChangeEmailInput): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <h1 style="font-size:24px;margin:0 0 16px;">Program codes updated</h1>
      <p>Your program codes have been updated for <strong>${escapeHtml(input.programName)}</strong>.</p>
      <ul>
        <li><strong>Program name:</strong> ${escapeHtml(input.programName)}</li>
        <li><strong>New Program Code:</strong> ${escapeHtml(input.programCode)}</li>
        <li><strong>New Family Access Code:</strong> ${escapeHtml(input.familyAccessCode)}</li>
        <li><strong>New Facilitator Code:</strong> ${escapeHtml(input.facilitatorAccessCode)}</li>
      </ul>
      <p>Existing student progress, badges, rewards, assessments, family links, and family accounts were preserved.</p>
      <p>Use the new codes for future facilitator and family portal access.</p>
    </div>
  `;
}

export async function queueProgramCodeChangeEmail(
  input: ProgramCodeChangeEmailInput,
): Promise<ProgramCodeChangeEmailResult> {
  const recipientEmail = input.adminEmail?.trim();
  if (!recipientEmail) {
    return { success: false, skipped: true, reason: 'missing_recipient' };
  }

  const programName = input.programName?.trim() || 'your program';
  const programCode = input.programCode?.trim() || 'Updated in your admin portal';
  const familyAccessCode = input.familyAccessCode?.trim() || 'Updated in your admin portal';
  const facilitatorAccessCode = input.facilitatorAccessCode?.trim() || 'Updated in your admin portal';
  const body = buildProgramCodeChangeBody({
    programName,
    programCode,
    familyAccessCode,
    facilitatorAccessCode,
  });
  const html = buildProgramCodeChangeHtml({
    programName,
    programCode,
    familyAccessCode,
    facilitatorAccessCode,
  });

  try {
    const response = await fetch('/.netlify/functions/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail,
        emailType: 'program_code_changed',
        subject: `Updated access codes for ${programName}`,
        body,
        html,
        programName,
        familyAccessCode,
        relatedProgramId: input.relatedProgramId?.trim() || programCode,
      }),
    });

    if (!response.ok) {
      let reason = `send_failed_${response.status}`;
      try {
        const payload = (await response.json()) as { error?: string };
        reason = payload.error || reason;
      } catch {
        /* keep fallback reason */
      }
      console.info('[PROGRAM_CODE_CHANGE_EMAIL]', {
        recipient_email: recipientEmail,
        success: false,
        skipped: response.status === 503,
        reason,
      });
      return { success: false, skipped: response.status === 503, reason };
    }

    console.info('[PROGRAM_CODE_CHANGE_EMAIL]', {
      recipient_email: recipientEmail,
      success: true,
      skipped: false,
    });
    return { success: true, skipped: false };
  } catch {
    console.info('[PROGRAM_CODE_CHANGE_EMAIL]', {
      recipient_email: recipientEmail,
      success: false,
      skipped: true,
      reason: 'send_function_unavailable',
    });
    return { success: false, skipped: true, reason: 'send_function_unavailable' };
  }
}
