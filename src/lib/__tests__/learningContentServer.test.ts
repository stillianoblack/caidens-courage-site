// eslint-disable-next-line @typescript-eslint/no-var-requires
const { gradeBand, safeQuestion, validateImport } = require('../../../netlify/functions/_lib/learningContent');
export {};
describe('learning content server safety',()=>{
  test('safe learner projection omits correct answers and explanations',()=>{const value=safeQuestion({id:'q',question_type:'multiple_choice',category:'recall',prompt:'Prompt',answer_options:['A'],correct_answer:'A',explanation:'secret',difficulty:'standard',display_order:1,points:1,metadata:{}});expect(value.correct_answer).toBeUndefined();expect(value.explanation).toBeUndefined();expect(value.prompt).toBe('Prompt');});
  test('validates import before writes',()=>{expect(validateImport([{title:'Week',grade_band:'3_5',module_key:'week-1',status:'draft',questions:[]}])).toEqual([]);expect(validateImport([{title:'',grade_band:'bad',questions:null}]).length).toBeGreaterThan(2);});
  test('server grade mapping matches client bands',()=>{expect(gradeBand('Kindergarten')).toBe('k_2');expect(gradeBand('Grade 5')).toBe('3_5');expect(gradeBand('7')).toBe('6_8');});
});
