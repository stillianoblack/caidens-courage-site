-- Read-only diagnostic for family-signup, placeholder-student, and progress ownership issues.
-- Replace the two values in target; do not commit real email addresses.
select private.assert_staging_safety(true);

with target as (
  select
    lower('replace-with-test-email@example.invalid')::text as admin_email,
    'replace-with-family-program-code'::text as family_program_code
), programs as (
  select p.*
  from public.pilot_programs p, target t
  where lower(btrim(p.admin_email)) = t.admin_email
     or p.program_code = t.family_program_code
), students as (
  select s.*
  from public.participants s
  where s.role = 'student'
    and s.program_code in (select program_code from programs)
), links as (
  select l.*
  from public.student_family_links l, target t
  where l.family_program_code = t.family_program_code
     or l.student_id in (select id from students)
)
select
  'program' as finding_type,
  p.id as record_id,
  p.program_code,
  null::uuid as student_id,
  p.created_at,
  jsonb_build_object('program_type', p.program_type, 'pilot_status', p.pilot_status) as details
from programs p
union all
select
  case
    when lower(btrim(coalesce(s.nickname, s.first_name, ''))) in ('student', 'child', 'player')
      then 'placeholder_student'
    else 'student'
  end,
  s.id,
  s.program_code,
  s.id,
  s.created_at,
  jsonb_build_object(
    'has_first_name', btrim(coalesce(s.first_name, '')) <> '',
    'has_nickname', btrim(coalesce(s.nickname, '')) <> ''
  )
from students s
union all
select
  case when s.id is null then 'orphaned_family_link' else 'family_link' end,
  l.id,
  l.family_program_code,
  l.student_id,
  l.created_at,
  jsonb_build_object('camp_program_code', l.camp_program_code, 'parent_claimed', l.parent_claimed)
from links l
left join public.participants s on s.id = l.student_id
order by created_at;

-- Progress ownership summary; no mutation.
select
  s.id as student_id,
  s.program_code,
  count(distinct ar.id) filter (where ar.completed_at is not null) as completed_assessments,
  count(distinct mr.id) as module_results,
  count(distinct pp.id) as player_progress_rows,
  bool_or(ar.assessment_type in ('baseline', 'b4_baseline') and ar.completed_at is not null)
    as b4_check_in_complete
from public.participants s
left join public.assessment_results_v2 ar on ar.participant_id = s.id
left join public.module_results mr on mr.participant_id = s.id
left join public.player_progress pp on pp.participant_id = s.id
where s.id in (
  select id from public.participants
  where role = 'student'
    and program_code = 'replace-with-family-program-code'
)
group by s.id, s.program_code;
