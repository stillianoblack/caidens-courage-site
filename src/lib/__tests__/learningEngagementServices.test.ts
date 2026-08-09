// eslint-disable-next-line @typescript-eslint/no-var-requires
const { eventKey } = require('../../../netlify/functions/_lib/achievementService');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { buildWeeklySummary, reportingPeriod } = require('../../../netlify/functions/_lib/weeklyLearningSummary');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { safeQuestion } = require('../../../netlify/functions/_lib/learningContent');
export {};
describe('learning engagement services',()=>{
  test('achievement keys deduplicate the same verified source',()=>{expect(eventKey('module_results','1','weekly_module_completed')).toBe(eventKey('module_results','1','weekly_module_completed'));expect(eventKey('module_results','1','weekly_module_completed')).not.toBe(eventKey('module_results','2','weekly_module_completed'));});
  test('weekly summary includes only the approved summary shape',()=>{const value=buildWeeklySummary({studentFirstName:'Jordan',programName:'Test Program',modules:[{module_id:'week-3',skill_area:'Teamwork',percent_score:80,completed_at:'2026-07-10'}],priorPercent:70,dashboardUrl:'/family-hub'});expect(value.modules_completed).toBe(1);expect(value.improvement).toBe(10);expect(value.weekly_skill).toBe('Teamwork');expect(value).not.toHaveProperty('email');});
  test('reporting periods are stable seven-day windows',()=>{expect(reportingPeriod(new Date('2026-07-13T20:00:00Z'))).toEqual({start:'2026-07-06',end:'2026-07-13'});});
  test('correct answers remain private before submission',()=>{expect(safeQuestion({id:'q',correct_answer:'secret'})).not.toHaveProperty('correct_answer');});
});
