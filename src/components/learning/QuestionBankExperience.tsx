import React, { useEffect, useMemo, useState } from 'react';
import { fetchLearnerQuestionSet, type LearnerQuestionSet } from '../../lib/learningContentApi';
import './question-bank-experience.css';

type Props = { programKey?: string; moduleKey: string; gradeBand?: string; programDefaultGradeBand?: string };
export default function QuestionBankExperience(props: Props) {
  const { gradeBand, moduleKey, programDefaultGradeBand, programKey } = props;
  const [set, setSet] = useState<LearnerQuestionSet | null>(null); const [loading,setLoading] = useState(true); const [message,setMessage] = useState<string | null>(null); const [answers,setAnswers] = useState<Record<string,string>>({}); const [index,setIndex] = useState(0);
  useEffect(() => { let active=true; setLoading(true); void fetchLearnerQuestionSet({ gradeBand, moduleKey, programDefaultGradeBand, programKey }).then((result) => { if (!active) return; setSet(result.questionSet || null); setMessage(result.error || result.message || null); setLoading(false); }); return () => { active=false; }; }, [gradeBand,moduleKey,programDefaultGradeBand,programKey]);
  const question = set?.questions[index]; const progress = useMemo(() => set?.questions.length ? `${index+1} of ${set.questions.length}` : '', [index,set?.questions.length]);
  if (loading) return <section className="questionBankExperience" aria-busy="true"><p>Loading your learning check…</p></section>;
  if (!set || !question) return <section className="questionBankExperience"><h2>Learning check coming soon</h2><p>{message || 'This content is being prepared.'}</p></section>;
  const update = (value:string) => setAnswers((current) => ({ ...current, [question.id]:value }));
  return <section className="questionBankExperience" aria-labelledby="question-bank-title"><header><div><p className="questionBankExperience-eyebrow">Week {set.weekNumber} · {set.skill}</p><h2 id="question-bank-title">{set.title}</h2></div><span>{progress}</span></header><fieldset><legend>{question.prompt}</legend>{question.answerOptions.length ? <div className="questionBankExperience-options">{question.answerOptions.map((option) => <label key={option}><input type="radio" name={question.id} value={option} checked={answers[question.id]===option} onChange={() => update(option)} /><span>{option}</span></label>)}</div> : <label className="questionBankExperience-response"><span>Your response</span><textarea value={answers[question.id] || ''} onChange={(event) => update(event.target.value)} rows={5} /></label>}</fieldset><footer><button type="button" onClick={() => setIndex((value) => Math.max(0,value-1))} disabled={index===0}>Previous</button><button type="button" onClick={() => setIndex((value) => Math.min(set.questions.length-1,value+1))} disabled={index===set.questions.length-1}>Next</button></footer></section>;
}
