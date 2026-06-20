alter table public.participants
  add column if not exists student_pin_reveal_value text;

comment on column public.participants.student_pin_reveal_value is
  'Current student PIN for authorized adult reveal/copy workflows. Student login still verifies against student_pin_hash.';
