import { exportQuestionSetsCsv, parseQuestionImport } from '../questionImport';
describe('question-bank import/export',()=>{
  test('parses CSV rows into sets and nested questions',()=>{const csv='title,grade_band,month_number,week_number,module_key,skill,status,version,question_type,category,prompt,answer_options,correct_answer\n"Week 3","3_5",1,3,"week-3","Teamwork","draft",1,"multiple_choice","recall","Work together?","[""Yes"",""No""]","""Yes"""';const items=parseQuestionImport(csv);expect(items).toHaveLength(1);expect(items[0].questions).toHaveLength(1);expect(items[0].questions[0].answer_options).toEqual(['Yes','No']);});
  test('exports quoted CSV without dropping question fields',()=>{const csv=exportQuestionSetsCsv([{title:'Week, 3',grade_band:'3_5',questions:[{prompt:'A "quoted" prompt',answer_options:['A','B']}]}]);expect(csv).toContain('"Week, 3"');expect(csv).toContain('"A ""quoted"" prompt"');});
});
