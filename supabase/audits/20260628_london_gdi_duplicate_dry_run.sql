-- DRY-RUN ONLY: London / GDI duplicate participant audit.
--
-- Purpose:
-- - Find London participant records connected to Breonna's GDI Camp rename scope.
-- - Identify which record is visible in the current GDI roster.
-- - Identify which record has real progress/rewards/PIN/family-link data.
-- - Produce a review-only merge recommendation without updating any data.
--
-- Safety:
-- - SELECT statements only.
-- - No UPDATE / INSERT / DELETE / MERGE.
-- - Horace / Blue Ribbon Results Academy is excluded by code and program name.

with scope_codes as (
  select unnest(array[
    'CAMP-GDI-2026',
    'CAMP-BLUERIBBON-2026',
    'FAMILY-STILLS-2026'
  ]) as code
),
gdi_program as (
  select p.*
  from public.pilot_programs p
  where lower(p.admin_email) = 'breonna.stills@yahoo.com'
    and p.program_name = 'GDI Camp'
    and p.program_code = 'CAMP-GDI-2026'
    and p.program_code <> 'CAMP-BLUERIBBONRESULTSACADEMY-2026'
    and p.program_name <> 'Blue Ribbon Results Academy'
),
london_participants as (
  select distinct p.*
  from public.participants p
  left join public.student_family_links sfl
    on sfl.student_id = p.id
  where (
      lower(coalesce(p.nickname, '')) like '%london%'
      or lower(coalesce(p.first_name, '')) like '%london%'
      or lower(coalesce(p.last_name, '')) like '%london%'
    )
    and (
      p.program_code in (select code from scope_codes)
      or sfl.camp_program_code in (select code from scope_codes)
      or sfl.family_program_code in (select code from scope_codes)
    )
    and p.program_code <> 'CAMP-BLUERIBBONRESULTSACADEMY-2026'
),
participant_rollup as (
  select
    p.id as participant_id,
    p.program_code,
    p.nickname,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at,
    p.parent_connection_status,
    p.guardian_email,
    (p.student_pin_enabled is true) as student_pin_enabled,
    (nullif(p.student_pin_hash, '') is not null or nullif(p.student_pin_fingerprint, '') is not null) as has_student_pin,
    p.student_pin_last_rotated_at,
    count(distinct sfl.id) as family_link_count,
    count(distinct sfl.id) filter (where sfl.camp_program_code = 'CAMP-GDI-2026') as current_gdi_family_link_count,
    count(distinct sfl.id) filter (where sfl.camp_program_code = 'CAMP-BLUERIBBON-2026') as old_code_family_link_count,
    count(distinct sfl.id) filter (where sfl.family_program_code = 'FAMILY-STILLS-2026') as family_stills_link_count,
    count(distinct ar2.id) filter (where ar2.assessment_type ilike '%baseline%') as baseline_v2_count,
    max(ar2.completed_at) filter (where ar2.assessment_type ilike '%baseline%') as latest_baseline_v2_at,
    count(distinct ar2.id) filter (where ar2.assessment_type ilike '%check%') as check_in_v2_count,
    max(ar2.completed_at) filter (where ar2.assessment_type ilike '%check%') as latest_check_in_v2_at,
    count(distinct ar.id) as legacy_assessment_count,
    max(ar.completed_at) as latest_legacy_assessment_at,
    count(distinct mr.id) as module_results_count,
    max(mr.completed_at) as latest_module_result_at,
    count(distinct pp.id) as player_progress_count,
    max(pp.completed_at) as latest_player_progress_at,
    count(distinct pb.id) as player_badges_count,
    max(pb.earned_at) as latest_badge_at,
    count(distinct prc.id) as reward_claims_count,
    max(prc.claimed_at) as latest_reward_claim_at,
    count(distinct pw.participant_id) as wallet_count,
    max(pw.total_coins) as wallet_total_coins,
    count(distinct sui.id) as participant_ui_state_count,
    count(distinct sgi.id) as gallery_items_count,
    max(sgi.created_at) as latest_gallery_item_at
  from london_participants p
  left join public.student_family_links sfl
    on sfl.student_id = p.id
  left join public.assessment_results_v2 ar2
    on ar2.participant_id = p.id
  left join public.assessment_results ar
    on ar.student_id = p.id
       or lower(coalesce(ar.nickname, '')) = lower(coalesce(p.nickname, ''))
  left join public.module_results mr
    on mr.participant_id = p.id
  left join public.player_progress pp
    on pp.participant_id = p.id
  left join public.player_badges pb
    on pb.participant_id = p.id
  left join public.player_reward_claims prc
    on prc.participant_id = p.id::text
  left join public.player_wallets pw
    on pw.participant_id = p.id
  left join public.participant_ui_state sui
    on sui.participant_id = p.id
  left join public.student_gallery_items sgi
    on lower(coalesce(sgi.student_nickname, '')) = lower(coalesce(p.nickname, ''))
       and sgi.program_code in (select code from scope_codes)
  group by p.id, p.program_code, p.nickname, p.first_name, p.last_name, p.role, p.created_at,
    p.parent_connection_status, p.guardian_email, p.student_pin_enabled, p.student_pin_hash,
    p.student_pin_fingerprint, p.student_pin_last_rotated_at
),
ranked as (
  select
    r.*,
    (
      r.baseline_v2_count +
      r.check_in_v2_count +
      r.legacy_assessment_count +
      r.module_results_count +
      r.player_progress_count +
      r.player_badges_count +
      r.reward_claims_count +
      coalesce(r.wallet_total_coins, 0)
    ) as progress_weight,
    case
      when r.program_code = 'CAMP-GDI-2026' or r.current_gdi_family_link_count > 0
        then true
      else false
    end as current_visible_roster_child
  from participant_rollup r
)
select
  'LONDON_PARTICIPANT_AUDIT' as report,
  ranked.*,
  case
    when current_visible_roster_child then 'CURRENT_VISIBLE_ROSTER_CHILD'
    when progress_weight > 0 then 'HAS_PROGRESS_REVIEW_BEFORE_MERGE'
    else 'NO_PROGRESS_FOUND'
  end as audit_classification
from ranked
order by current_visible_roster_child desc, progress_weight desc, created_at asc;

with london_summary as (
  select *
  from (
    select
      p.id as participant_id,
      p.program_code,
      p.nickname,
      p.first_name,
      p.created_at,
      (
        (select count(*) from public.module_results x where x.participant_id = p.id) +
        (select count(*) from public.assessment_results_v2 x where x.participant_id = p.id) +
        (select count(*) from public.player_progress x where x.participant_id = p.id) +
        (select count(*) from public.player_badges x where x.participant_id = p.id) +
        (select count(*) from public.player_reward_claims x where x.participant_id = p.id::text) +
        coalesce((select max(total_coins) from public.player_wallets x where x.participant_id = p.id), 0)
      ) as progress_weight,
      exists (
        select 1
        from public.student_family_links sfl
        where sfl.student_id = p.id
          and sfl.camp_program_code = 'CAMP-GDI-2026'
      ) or p.program_code = 'CAMP-GDI-2026' as current_visible_roster_child
    from public.participants p
    where (
        lower(coalesce(p.nickname, '')) like '%london%'
        or lower(coalesce(p.first_name, '')) like '%london%'
      )
      and p.program_code in ('CAMP-GDI-2026', 'CAMP-BLUERIBBON-2026', 'FAMILY-STILLS-2026')
  ) scoped
)
select
  'REVIEW_ONLY_MERGE_PLAN' as report,
  (select participant_id from london_summary where current_visible_roster_child order by created_at asc limit 1) as suggested_surviving_visible_participant_id,
  (select participant_id from london_summary order by progress_weight desc, current_visible_roster_child desc limit 1) as participant_with_most_progress_id,
  case
    when (select count(*) from london_summary) <= 1 then 'No merge needed: only one London candidate in scope.'
    when (select participant_id from london_summary where current_visible_roster_child order by created_at asc limit 1)
       = (select participant_id from london_summary order by progress_weight desc, current_visible_roster_child desc limit 1)
      then 'Merge may be safe after review: visible child also has the most progress.'
    else 'Do not merge automatically: visible child differs from progress-bearing child. Review detailed rows first.'
  end as recommendation,
  'If merge is approved later, preserve survivor participant id if it is the visible roster child; move progress, badges, rewards, wallet, assessments, gallery ownership, PIN, and family links from duplicate to survivor in one transaction.' as review_only_plan;
