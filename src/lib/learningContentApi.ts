import { isSupabaseConfigured, supabase } from './supabaseClient';

export type LearnerQuestion = { id: string; questionType: string; category: string; prompt: string; answerOptions: string[]; difficulty: string; displayOrder: number; points: number; metadata: Record<string, unknown> };
export type LearnerQuestionSet = { id: string; title: string; programKey: string; gradeBand: string; monthNumber: number; weekNumber: number; moduleKey: string; skill: string; version: number; resolution: string; questions: LearnerQuestion[] };

async function adminToken() { if (!isSupabaseConfigured() || !supabase) return null; const { data } = await supabase.auth.getSession(); return data.session?.access_token || null; }
export async function fetchLearnerQuestionSet(input: { programKey?: string; moduleKey: string; gradeBand?: string; programDefaultGradeBand?: string }) {
  const params = new URLSearchParams({ programKey: input.programKey || 'caidens-courage', moduleKey: input.moduleKey });
  if (input.gradeBand) params.set('gradeBand', input.gradeBand); if (input.programDefaultGradeBand) params.set('programDefaultGradeBand', input.programDefaultGradeBand);
  try { const response = await fetch(`/.netlify/functions/learning-content?${params}`); const data = await response.json(); return { ok: response.ok, ...data } as { ok: boolean; status?: string; questionSet?: LearnerQuestionSet; message?: string; error?: string }; }
  catch { return { ok: false, error: 'Learning content is temporarily unavailable.' }; }
}
export async function fetchAdminQuestionSets(filters: Record<string,string> = {}) {
  const token = await adminToken(); if (!token) return { ok:false, error:'Admin sign-in required.', items:[] };
  const params = new URLSearchParams(Object.entries(filters).filter(([,value]) => Boolean(value)));
  try { const response = await fetch(`/.netlify/functions/admin-learning-content?${params}`, { headers:{ Authorization:`Bearer ${token}` } }); const data = await response.json(); return { ok:response.ok, items:data.items || [], error:response.ok ? undefined : data.error }; }
  catch { return { ok:false, error:'Question bank service unavailable.', items:[] }; }
}
export async function postAdminQuestionAction(payload: Record<string,unknown>) {
  const token = await adminToken(); if (!token) return { ok:false, error:'Admin sign-in required.' };
  try { const response = await fetch('/.netlify/functions/admin-learning-content', { method:'POST', headers:{ Authorization:`Bearer ${token}`,'Content-Type':'application/json' }, body:JSON.stringify(payload) }); const data = await response.json(); return { ok:response.ok, data, error:response.ok ? undefined : data.error }; }
  catch { return { ok:false, error:'Question bank service unavailable.' }; }
}
