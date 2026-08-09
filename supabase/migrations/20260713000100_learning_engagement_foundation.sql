-- Learning content, lightweight onboarding, achievements, and communication preparation.
-- ADDITIVE ONLY. Provider delivery remains held/disabled until separately approved.

alter table if exists public.program_goals
  add column if not exists dashboard_onboarding_dismissed_at timestamptz;

create table if not exists public.learning_question_sets (
  id uuid primary key default gen_random_uuid(),
  program_key text not null default 'caidens-courage',
  title text not null,
  grade_band text not null check (grade_band in ('k_2','3_5','6_8','general')),
  month_number integer not null check (month_number > 0),
  week_number integer not null check (week_number > 0),
  module_key text not null,
  skill text not null,
  story_scene text,
  status text not null default 'draft' check (status in ('draft','internal_review','educator_review','published','archived')),
  version integer not null default 1 check (version > 0),
  is_program_default boolean not null default false,
  created_by uuid references auth.users(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_key, module_key, grade_band, version)
);

create table if not exists public.learning_questions (
  id uuid primary key default gen_random_uuid(),
  question_set_id uuid not null references public.learning_question_sets(id) on delete cascade,
  question_type text not null check (question_type in ('multiple_choice','scenario','short_response','open_reflection','facilitator_prompt','family_prompt')),
  category text not null,
  prompt text not null,
  answer_options jsonb not null default '[]'::jsonb,
  correct_answer jsonb,
  explanation text,
  difficulty text not null default 'standard' check (difficulty in ('introductory','standard','stretch')),
  reading_standard text,
  sel_competency text,
  display_order integer not null,
  points integer not null default 1 check (points >= 0),
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_set_id, display_order)
);

create index if not exists learning_question_sets_lookup_idx
  on public.learning_question_sets (program_key, module_key, grade_band, status, version desc);
create index if not exists learning_questions_set_order_idx
  on public.learning_questions (question_set_id, active, display_order);

create table if not exists public.achievement_events (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null,
  event_type text not null,
  source_record_type text not null,
  source_record_id text not null,
  event_key text not null unique,
  repeatable boolean not null default false,
  status text not null default 'recorded' check (status in ('recorded','awarded','ignored','failed')),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.achievement_awards (
  id uuid primary key default gen_random_uuid(),
  achievement_event_id uuid not null references public.achievement_events(id),
  participant_id uuid not null,
  award_type text not null check (award_type in ('coins','badge','certificate','focus_flame_progress','b4_progress')),
  award_key text not null,
  quantity integer not null default 1 check (quantity > 0),
  reason text not null,
  created_at timestamptz not null default now(),
  unique (participant_id, award_type, award_key)
);

create index if not exists achievement_events_participant_idx on public.achievement_events (participant_id, created_at desc);
create index if not exists achievement_awards_participant_idx on public.achievement_awards (participant_id, created_at desc);

create table if not exists public.learning_communication_deliveries (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,
  provider text not null default 'kit',
  communication_type text not null,
  reporting_period_start date not null,
  reporting_period_end date not null,
  recipient_contact_id uuid references public.contacts(id),
  recipient_user_id uuid references auth.users(id),
  student_id uuid not null,
  status text not null default 'held' check (status in ('held','prepared','queued','sent','retryable_failure','permanent_failure','cancelled')),
  provider_reference text,
  error_message text,
  summary_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  updated_at timestamptz not null default now(),
  check (recipient_contact_id is not null or recipient_user_id is not null),
  unique (communication_type, reporting_period_start, reporting_period_end, recipient_contact_id, recipient_user_id, student_id)
);

create index if not exists learning_deliveries_status_idx
  on public.learning_communication_deliveries (status, reporting_period_end, created_at);

alter table public.learning_question_sets enable row level security;
alter table public.learning_questions enable row level security;
alter table public.achievement_events enable row level security;
alter table public.achievement_awards enable row level security;
alter table public.learning_communication_deliveries enable row level security;

comment on table public.learning_question_sets is 'Editable, versioned learning content. Browser delivery occurs through an answer-safe server projection.';
comment on column public.learning_questions.correct_answer is 'Server/Admin only. Never return this field before a learner submits.';
comment on table public.achievement_events is 'Server-authoritative, idempotent achievement event ledger.';
comment on table public.learning_communication_deliveries is 'Data-minimized weekly summary preparation and delivery ledger. New rows default held.';

-- Seed an editable 12-week framework without replacing existing source-file questions.
with skills(week_number, skill) as (values
  (1,'Courage in uncertainty'), (2,'Communication and asking for help'),
  (3,'Teamwork'), (4,'Leadership'), (5,'Empathy'), (6,'Problem solving'),
  (7,'Focus and attention'), (8,'Resilience'), (9,'Friendship and trust'),
  (10,'Emotional regulation'), (11,'Self-advocacy and confidence'),
  (12,'Reflection, growth, and celebration')
), bands(grade_band) as (values ('k_2'),('3_5'),('6_8'))
insert into public.learning_question_sets
  (program_key, title, grade_band, month_number, week_number, module_key, skill, story_scene, status, version)
select
  'caidens-courage',
  'Week ' || s.week_number || ': ' || s.skill || ' — ' || replace(b.grade_band, '_', '–'),
  b.grade_band,
  ((s.week_number - 1) / 4) + 1,
  s.week_number,
  'week-' || s.week_number,
  s.skill,
  case when s.week_number <= 2 then 'Existing approved Week ' || s.week_number || ' story/content remains authoritative until reviewed for import.'
       else 'Draft story alignment placeholder; requires internal and educator review.' end,
  'draft',
  1
from skills s cross join bands b
on conflict (program_key, module_key, grade_band, version) do nothing;

-- Create grade-appropriate draft samples at the requested counts: 8 for K-2,
-- 11 for 3-5, and 13 for 6-8 (student items plus two facilitator and one family prompt).
with category_templates(display_order, category, question_type) as (values
  (1,'reading_comprehension','multiple_choice'), (2,'recall','multiple_choice'),
  (3,'vocabulary','multiple_choice'), (4,'sequencing','multiple_choice'),
  (5,'inference','scenario'), (6,'main_idea_theme','multiple_choice'),
  (7,'character_motivation','scenario'), (8,'sel_reflection','open_reflection'),
  (9,'real_world_application','scenario'), (10,'critical_thinking','short_response'),
  (11,'facilitator_discussion','facilitator_prompt'), (12,'facilitator_discussion','facilitator_prompt'),
  (13,'family_discussion','family_prompt')
)
insert into public.learning_questions
  (question_set_id, question_type, category, prompt, answer_options, correct_answer, explanation, difficulty, display_order, points, metadata)
select
  qs.id,
  t.question_type,
  t.category,
  case
    when t.question_type = 'facilitator_prompt' then 'Draft facilitator prompt: How can learners practice ' || lower(qs.skill) || ' together this week?'
    when t.question_type = 'family_prompt' then 'Draft family prompt: When could your family use ' || lower(qs.skill) || ' at home?'
    when t.question_type in ('open_reflection','short_response') then 'Draft reflection: Describe one way you could show ' || lower(qs.skill) || '.'
    else 'Draft question ' || t.display_order || ': Which choice best shows ' || lower(qs.skill) || '?'
  end,
  case when t.question_type in ('multiple_choice','scenario')
       then jsonb_build_array('Ask for help and make a thoughtful choice','Ignore the situation','Give up immediately')
       else '[]'::jsonb end,
  case when t.question_type in ('multiple_choice','scenario') then '"Ask for help and make a thoughtful choice"'::jsonb else null end,
  case when t.question_type in ('multiple_choice','scenario') then 'This draft answer models the week’s skill and must be reviewed against the final story.' else null end,
  case when qs.grade_band = 'k_2' then 'introductory' when qs.grade_band = '6_8' then 'stretch' else 'standard' end,
  t.display_order,
  case when t.question_type in ('facilitator_prompt','family_prompt') then 0 else 1 end,
  jsonb_build_object('seed_status','draft_sample','requires_story_review',true,'read_aloud_compatible',qs.grade_band = 'k_2')
from public.learning_question_sets qs
join category_templates t on
  (qs.grade_band = 'k_2' and (t.display_order <= 5 or t.display_order >= 11)) or
  (qs.grade_band = '3_5' and (t.display_order <= 8 or t.display_order >= 11)) or
  (qs.grade_band = '6_8')
where qs.program_key = 'caidens-courage' and qs.version = 1
on conflict (question_set_id, display_order) do nothing;
