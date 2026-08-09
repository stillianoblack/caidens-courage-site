// Existing production naming is preserved where known. Null mappings require manual Kit review.
const KIT_EVENT_MAP = Object.freeze({
  account_created:{tag:null,todo:'Approve an account-created tag or welcome sequence in Kit.'},
  facilitator_registered:{tag:'Facilitator'}, family_registered:{tag:'Parent'},
  pilot_enrolled:{tag:null,todo:'Confirm the existing pilot-enrollment tag.'}, purchase_completed:{tag:null,todo:'Confirm Stripe/product-specific tags.'},
  student_added:{tag:null,todo:'Child data must not be sent; use an adult-account lifecycle tag only.'},
  baseline_completed:{tag:null,todo:'Do not send child assessment data. Approve an adult-safe milestone tag.'},
  first_module_started:{tag:null}, first_module_completed:{tag:'Completed Week 1'},
  weekly_module_completed:{tag:null,todo:'Resolve week number to an existing Completed Week 1–4 tag.'},
  badge_earned:{tag:null,todo:'Do not send badge/child detail until an adult-safe mapping is approved.'},
  certificate_earned:{tag:'Month 1 Graduate'}, inactive_user_followup:{tag:null,todo:'Approve inactive-user automation and consent purpose.'},
  weekly_summary_ready:{tag:null,todo:'Create and verify a Weekly Summary Ready tag/sequence in Kit.'},
});
const KIT_CUSTOM_FIELDS = Object.freeze({ first_name:'first_name', student_first_name:null, program_name:null, weekly_skill:null, modules_completed:null, badge_earned:null, weekly_discussion_prompt:null, dashboard_url:null });
module.exports={KIT_CUSTOM_FIELDS,KIT_EVENT_MAP};
