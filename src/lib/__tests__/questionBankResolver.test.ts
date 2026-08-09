import { normalizeQuestionGradeBand, resolveQuestionSet, type QuestionSetCandidate } from '../questionBankResolver';

const base = (overrides: Partial<QuestionSetCandidate>): QuestionSetCandidate => ({ id:'set',programKey:'caidens-courage',moduleKey:'week-3',gradeBand:'general',status:'published',version:1,...overrides });
describe('question-bank grade resolution',()=>{
  test('normalizes supported grade labels',()=>{expect(normalizeQuestionGradeBand('Grade 2')).toBe('k_2');expect(normalizeQuestionGradeBand('4')).toBe('3_5');expect(normalizeQuestionGradeBand('Grades 6-8')).toBe('6_8');});
  test('uses exact, then program default, then general and newest published version',()=>{const candidates=[base({id:'general'}),base({id:'default',gradeBand:'3_5'}),base({id:'exact-old',gradeBand:'6_8'}),base({id:'exact-new',gradeBand:'6_8',version:2}),base({id:'draft',gradeBand:'6_8',version:9,status:'draft'})];expect(resolveQuestionSet(candidates,{programKey:'caidens-courage',moduleKey:'week-3',gradeBand:'7',programDefaultGradeBand:'4'})?.id).toBe('exact-new');expect(resolveQuestionSet(candidates,{programKey:'caidens-courage',moduleKey:'week-3',gradeBand:'2',programDefaultGradeBand:'4'})?.id).toBe('default');expect(resolveQuestionSet([candidates[0]],{programKey:'caidens-courage',moduleKey:'week-3',gradeBand:'2'})?.id).toBe('general');});
  test('never selects draft content',()=>{expect(resolveQuestionSet([base({status:'draft'})],{programKey:'caidens-courage',moduleKey:'week-3',gradeBand:'4'})).toBeNull();});
});
