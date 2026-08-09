const { getServerSupabase, json, requireCrmRequest, writeAdminAuditEvent } = require('./crmAuth');

const STATUSES = new Set(['draft','internal_review','educator_review','published','archived']);
const BANDS = new Set(['k_2','3_5','6_8','general']);

function parseBody(event) { try { return JSON.parse(event.body || '{}'); } catch { return null; } }
function gradeBand(value) {
  if (/kindergarten/i.test(String(value || ''))) return 'k_2';
  const normalized = String(value || '').trim().toLowerCase().replace(/grades?|kindergarten|\s/g, '');
  if (['k','k-2','k_2','0','1','2'].includes(normalized)) return 'k_2';
  if (['3-5','3_5','3','4','5'].includes(normalized)) return '3_5';
  if (['6-8','6_8','6','7','8'].includes(normalized)) return '6_8';
  return BANDS.has(normalized) ? normalized : 'general';
}

function safeQuestion(row) {
  return { id: row.id, questionType: row.question_type, category: row.category, prompt: row.prompt,
    answerOptions: row.answer_options || [], difficulty: row.difficulty, readingStandard: row.reading_standard,
    selCompetency: row.sel_competency, displayOrder: row.display_order, points: row.points, metadata: row.metadata || {} };
}

async function resolvePublishedSet(supabase, input) {
  const requested = gradeBand(input.gradeBand);
  const bands = [requested, input.programDefaultGradeBand && gradeBand(input.programDefaultGradeBand), 'general'].filter(Boolean);
  for (const band of [...new Set(bands)]) {
    const result = await supabase.from('learning_question_sets')
      .select('id,title,program_key,grade_band,month_number,week_number,module_key,skill,story_scene,status,version,is_program_default,learning_questions(id,question_type,category,prompt,answer_options,difficulty,reading_standard,sel_competency,display_order,points,metadata,active)')
      .eq('program_key', input.programKey).eq('module_key', input.moduleKey).eq('grade_band', band)
      .eq('status', 'published').order('version', { ascending: false }).limit(1).maybeSingle();
    if (result.error) throw result.error;
    if (result.data) return { ...result.data, resolution: band === requested ? 'exact' : band === 'general' ? 'general' : 'program_default' };
  }
  return null;
}

async function publicContent(event) {
  const id = require('crypto').randomUUID();
  if (event.httpMethod !== 'GET' || process.env.REACT_APP_LEARNING_CONTENT_ENABLED !== 'true') return json(404, { error: 'Learning content unavailable.' }, id);
  const supabase = getServerSupabase(); if (!supabase) return json(503, { error: 'Learning content service is not configured.' }, id);
  const params = new URLSearchParams(
    event.rawQuery || new URLSearchParams(event.queryStringParameters || {}).toString(),
  );
  const programKey = String(params.get('programKey') || 'caidens-courage').slice(0, 80);
  const moduleKey = String(params.get('moduleKey') || '').slice(0, 80);
  if (!moduleKey) return json(422, { error: 'Module is required.' }, id);
  try {
    const set = await resolvePublishedSet(supabase, { programKey, moduleKey, gradeBand: params.get('gradeBand'), programDefaultGradeBand: params.get('programDefaultGradeBand') });
    if (!set) return json(200, { status: 'preparing', message: 'This learning check is being prepared.' }, id);
    return json(200, { status: 'ready', questionSet: { id: set.id, title: set.title, programKey: set.program_key, gradeBand: set.grade_band, monthNumber: set.month_number, weekNumber: set.week_number, moduleKey: set.module_key, skill: set.skill, storyScene: set.story_scene, version: set.version, resolution: set.resolution, questions: (set.learning_questions || []).filter((q) => q.active).sort((a,b) => a.display_order-b.display_order).map(safeQuestion) } }, id);
  } catch { return json(503, { error: 'Learning content could not be loaded.' }, id); }
}

function validateImport(items) {
  const errors = [];
  if (!Array.isArray(items)) return ['Import must be a JSON array of question sets.'];
  items.forEach((item, index) => {
    if (!item?.title) errors.push(`Set ${index + 1}: title is required.`);
    if (!BANDS.has(item?.grade_band)) errors.push(`Set ${index + 1}: invalid grade_band.`);
    if (!item?.module_key) errors.push(`Set ${index + 1}: module_key is required.`);
    if (!STATUSES.has(item?.status || 'draft')) errors.push(`Set ${index + 1}: invalid status.`);
    if (!Array.isArray(item?.questions)) errors.push(`Set ${index + 1}: questions must be an array.`);
  });
  return errors;
}

async function adminContent(event) {
  const permission = event.httpMethod === 'GET' ? 'content:read' : 'content:write';
  const auth = await requireCrmRequest(event, { flag: 'LEARNING_CONTENT_ADMIN_ENABLED', permission });
  if (auth.response) return auth.response;
  const { supabase, correlationId } = auth.context;
  if (event.httpMethod === 'GET') {
    const p = new URLSearchParams(event.rawQuery || new URLSearchParams(event.queryStringParameters || {}).toString());
    let query = supabase.from('learning_question_sets').select('*,learning_questions(*)').order('week_number').order('grade_band').limit(200);
    for (const [key, column] of [['gradeBand','grade_band'],['status','status'],['moduleKey','module_key'],['skill','skill']]) if (p.get(key)) query = query.eq(column, p.get(key));
    if (p.get('month')) query = query.eq('month_number', Number(p.get('month')));
    if (p.get('week')) query = query.eq('week_number', Number(p.get('week')));
    const result = await query;
    return result.error ? json(503, { error: 'Question bank unavailable.' }, correlationId) : json(200, { items: result.data || [] }, correlationId);
  }
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' }, correlationId);
  const input = parseBody(event); if (!input?.action) return json(422, { error: 'Action is required.' }, correlationId);
  let result;
  if (input.action === 'create_set') {
    if (!input.values?.title || !BANDS.has(input.values?.grade_band) || !input.values?.module_key) return json(422, { error:'Title, grade band, and module are required.' }, correlationId);
    result = await supabase.from('learning_question_sets').insert({ program_key:input.values.program_key || 'caidens-courage', title:input.values.title, grade_band:input.values.grade_band, month_number:Number(input.values.month_number)||1, week_number:Number(input.values.week_number)||1, module_key:input.values.module_key, skill:input.values.skill || 'Pending review', story_scene:input.values.story_scene || null, status:'draft', version:Number(input.values.version)||1, created_by:auth.context.user.id }).select('*').single();
  } else if (input.action === 'set_status' && STATUSES.has(input.status)) {
    result = await supabase.from('learning_question_sets').update({ status: input.status, published_at: input.status === 'published' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('id', input.id).select('id,status').single();
  } else if (input.action === 'duplicate') {
    if (!BANDS.has(input.gradeBand)) return json(422, { error: 'Valid destination grade band required.' }, correlationId);
    const source = await supabase.from('learning_question_sets').select('*,learning_questions(*)').eq('id', input.id).single();
    if (source.error) return json(404, { error: 'Source set not found.' }, correlationId);
    const row = source.data; const inserted = await supabase.from('learning_question_sets').insert({ program_key: row.program_key, title: `${row.title} (copy)`, grade_band: input.gradeBand, month_number: row.month_number, week_number: row.week_number, module_key: row.module_key, skill: row.skill, story_scene: row.story_scene, status: 'draft', version: Number(row.version) + 1, created_by: auth.context.user.id }).select('id').single();
    if (inserted.data) await supabase.from('learning_questions').insert((row.learning_questions || []).map((q) => ({ question_set_id: inserted.data.id, question_type: q.question_type, category: q.category, prompt: q.prompt, answer_options: q.answer_options, correct_answer: q.correct_answer, explanation: q.explanation, difficulty: q.difficulty, reading_standard: q.reading_standard, sel_competency: q.sel_competency, display_order: q.display_order, points: q.points, active: q.active, metadata: q.metadata })));
    result = inserted;
  } else if (input.action === 'bulk_active' && Array.isArray(input.questionIds)) {
    result = await supabase.from('learning_questions').update({ active: Boolean(input.active), updated_at: new Date().toISOString() }).in('id', input.questionIds).select('id,active');
  } else if (input.action === 'update_question') {
    const allowed = ['prompt','answer_options','correct_answer','explanation','difficulty','reading_standard','sel_competency','display_order','points','active']; const patch = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(input.values || {}, key)) patch[key] = input.values[key];
    result = await supabase.from('learning_questions').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', input.id).select('*').single();
  } else if (input.action === 'reorder' && Array.isArray(input.questionIds)) {
    for (let index=0; index<input.questionIds.length; index+=1) await supabase.from('learning_questions').update({display_order:1000+index}).eq('id',input.questionIds[index]).eq('question_set_id',input.id);
    for (let index=0; index<input.questionIds.length; index+=1) await supabase.from('learning_questions').update({display_order:index+1,updated_at:new Date().toISOString()}).eq('id',input.questionIds[index]).eq('question_set_id',input.id);
    result = { data:{id:input.id,reordered:input.questionIds.length}, error:null };
  } else if (input.action === 'validate_import') {
    const errors = validateImport(input.items); return json(200, { valid: errors.length === 0, errors }, correlationId);
  } else if (input.action === 'import_json') {
    const errors=validateImport(input.items); if(errors.length)return json(422,{error:'Import validation failed.',errors},correlationId);
    if(input.items.length>50)return json(422,{error:'Import is limited to 50 sets per request.'},correlationId);
    const created=[];
    for(const item of input.items){const setResult=await supabase.from('learning_question_sets').insert({program_key:item.program_key||'caidens-courage',title:item.title,grade_band:item.grade_band,month_number:Number(item.month_number)||1,week_number:Number(item.week_number)||1,module_key:item.module_key,skill:item.skill||'Pending review',story_scene:item.story_scene||null,status:'draft',version:Number(item.version)||1,created_by:auth.context.user.id}).select('id').single();if(setResult.error)return json(409,{error:'Import stopped before overwriting existing content.',created},correlationId);if(item.questions.length){const rows=item.questions.map((q,index)=>({question_set_id:setResult.data.id,question_type:q.question_type||'multiple_choice',category:q.category||'reading_comprehension',prompt:q.prompt,answer_options:q.answer_options||[],correct_answer:q.correct_answer??null,explanation:q.explanation||null,difficulty:q.difficulty||'standard',reading_standard:q.reading_standard||null,sel_competency:q.sel_competency||null,display_order:Number(q.display_order)||index+1,points:Number(q.points??1),active:q.active!==false,metadata:q.metadata||{}}));const questions=await supabase.from('learning_questions').insert(rows);if(questions.error)return json(409,{error:'Question import failed; review the newly created draft set.',created},correlationId);}created.push(setResult.data.id);}
    result={data:{created},error:null};
  } else return json(422, { error: 'Unsupported content action.' }, correlationId);
  if (result.error) return json(409, { error: 'Content change could not be saved.' }, correlationId);
  await writeAdminAuditEvent(supabase, auth.context, { action: `learning_content_${input.action}`, targetType: 'learning_question_set', targetId: input.id || result.data?.id, metadata: { status: input.status || null } });
  return json(200, { item: result.data }, correlationId);
}

module.exports = { adminContent, gradeBand, publicContent, resolvePublishedSet, safeQuestion, validateImport };
