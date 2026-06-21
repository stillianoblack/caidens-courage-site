function isMissingRevealColumnError(message) {
  return /student_pin_reveal_value|schema cache/i.test(String(message || ''));
}

function buildPinUpdatePayload(pin, hash, fingerprint, now, includeReveal = true) {
  const payload = {
    student_pin_hash: hash,
    student_pin_fingerprint: fingerprint,
    student_pin_enabled: true,
    student_pin_last_rotated_at: now,
  };
  if (includeReveal) {
    payload.student_pin_reveal_value = pin;
  }
  return payload;
}

async function persistStudentPinUpdate(supabase, programCode, participantId, pin, hash, fingerprint, now) {
  const { error } = await supabase
    .from('participants')
    .update(buildPinUpdatePayload(pin, hash, fingerprint, now, true))
    .eq('id', participantId)
    .eq('program_code', programCode);

  if (!error) {
    return { ok: true, revealStored: true };
  }

  if (!isMissingRevealColumnError(error.message)) {
    return { ok: false, error: error.message };
  }

  const { error: retryError } = await supabase
    .from('participants')
    .update(buildPinUpdatePayload(pin, hash, fingerprint, now, false))
    .eq('id', participantId)
    .eq('program_code', programCode);

  if (retryError) {
    return { ok: false, error: retryError.message };
  }

  console.warn(
    '[student-pin] student_pin_reveal_value column missing — PIN saved without reveal storage. Run supabase/student_pin_reveal_value_migration.sql',
  );

  return { ok: true, revealStored: false };
}

module.exports = {
  isMissingRevealColumnError,
  buildPinUpdatePayload,
  persistStudentPinUpdate,
};
