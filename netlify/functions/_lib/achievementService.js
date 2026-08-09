const crypto = require('crypto');
const { getServerSupabase, json } = require('./crmAuth');

const SOURCES = {
  module_results: { table:'module_results', columns:'id,participant_id,module_id,module_title,skill_area,percent_score,completed_at', event:'weekly_module_completed' },
  assessment_results_v2: { table:'assessment_results_v2', columns:'id,participant_id,assessment_type,percent_score,completed_at', event:(row) => String(row.assessment_type).includes('baseline') ? 'baseline_completed' : 'assessment_completed' },
  player_progress: { table:'player_progress', columns:'id,participant_id,mission_id,mission_title,coins_earned,badge_unlocked,completed_at', event:'first_mission_completed' },
  player_badges: { table:'player_badges', columns:'id,participant_id,badge_name,earned_at', event:'badge_earned' },
};
const AWARDS = {
  baseline_completed:[{awardType:'badge',awardKey:'baseline-complete',quantity:1,label:'Baseline complete'}],
  first_mission_completed:[{awardType:'focus_flame_progress',awardKey:'first-mission',quantity:1,label:'First mission complete'}],
  weekly_module_completed:[{awardType:'b4_progress',awardKey:'weekly-module',quantity:1,label:'Weekly module complete'}],
  badge_earned:[], assessment_completed:[],
};
function eventKey(sourceType,sourceId,eventType){return crypto.createHash('sha256').update(`${sourceType}:${sourceId}:${eventType}`).digest('hex');}
async function recordVerifiedEvent(supabase,input){
  const config=SOURCES[input.sourceType]; if(!config) return {error:'unsupported_source'};
  const source=await supabase.from(config.table).select(config.columns).eq('id',input.sourceId).maybeSingle(); if(source.error||!source.data?.participant_id) return {error:'source_not_verified'};
  const eventType=typeof config.event==='function'?config.event(source.data):config.event; const key=eventKey(input.sourceType,input.sourceId,eventType);
  const inserted=await supabase.from('achievement_events').insert({participant_id:source.data.participant_id,event_type:eventType,source_record_type:input.sourceType,source_record_id:input.sourceId,event_key:key,reason:`Verified ${input.sourceType} completion`,metadata:{source_type:input.sourceType}}).select('id,status').single();
  if(inserted.error?.code==='23505'){const existing=await supabase.from('achievement_events').select('id,status').eq('event_key',key).single();return {status:'duplicate',event:existing.data,celebration:null};}
  if(inserted.error) return {error:'event_write_failed'};
  const awards=AWARDS[eventType]||[];
  if(awards.length) await supabase.from('achievement_awards').insert(awards.map((award)=>({achievement_event_id:inserted.data.id,participant_id:source.data.participant_id,award_type:award.awardType,award_key:award.awardKey,quantity:award.quantity,reason:award.label})));
  await supabase.from('achievement_events').update({status:awards.length?'awarded':'recorded',processed_at:new Date().toISOString()}).eq('id',inserted.data.id);
  return {status:'recorded',eventType,celebration:awards[0]?{title:awards[0].label,awardType:awards[0].awardType,quantity:awards[0].quantity}:null};
}
async function handler(event){const id=crypto.randomUUID();if(event.httpMethod!=='POST'||process.env.ACHIEVEMENT_EVENTS_ENABLED!=='true')return json(404,{error:'Achievement events unavailable.'},id);let input;try{input=JSON.parse(event.body||'{}');}catch{return json(400,{error:'Invalid request.'},id);}const supabase=getServerSupabase();if(!supabase)return json(503,{error:'Achievement service unavailable.'},id);const result=await recordVerifiedEvent(supabase,input);return result.error?json(result.error==='source_not_verified'?422:503,{error:'Achievement proof could not be verified.'},id):json(200,result,id);}
module.exports={AWARDS,SOURCES,eventKey,handler,recordVerifiedEvent};
