export const MILESTONE_CELEBRATION_EVENT = 'caidens:milestone-celebration';
export type MilestoneCelebration = { title:string; awardType:string; quantity:number };
export function recordAchievementFromProof(sourceType:'module_results'|'assessment_results_v2'|'player_progress'|'player_badges',sourceId:string):void{
  void fetch('/.netlify/functions/learning-achievement-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sourceType,sourceId})}).then(async(response)=>{if(!response.ok)return;const data=await response.json();if(data.celebration&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent(MILESTONE_CELEBRATION_EVENT,{detail:data.celebration}));}).catch(()=>undefined);
}
