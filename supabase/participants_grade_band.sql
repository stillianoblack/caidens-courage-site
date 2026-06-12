-- Grade band settings for family portal activity personalization
alter table participants
  add column if not exists grade_band text,
  add column if not exists allow_stretch_level boolean not null default false;

comment on column participants.grade_band is 'Family portal grade band (e.g. 2–3, 3–4, 4–5, 5–6)';
comment on column participants.allow_stretch_level is 'Allow occasional activities 1–2 grade bands higher';
