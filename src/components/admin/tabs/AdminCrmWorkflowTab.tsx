import React, { useEffect, useState } from 'react';
import { getCrmActivities, postCrmWorkflow } from '../../../lib/crmWorkflowApi';

type View = 'add-contact' | 'segments' | 'tasks' | 'activity';

export default function AdminCrmWorkflowTab({ view }: { view: View }) {
  const [message, setMessage] = useState<string | null>(null);
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [doNotEnroll, setDoNotEnroll] = useState(true);

  useEffect(() => {
    if (view !== 'activity') return;
    void getCrmActivities().then((result) => {
      if (result.ok) setItems((result.data?.items as Array<Record<string, unknown>>) || []);
      else setMessage(result.error || 'Activity unavailable.');
    });
  }, [view]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    const endpoint = view === 'add-contact' ? 'crm-create-contact' : view === 'segments' ? 'crm-evaluate-segments' : 'crm-task';
    const payload: Record<string, unknown> = { ...values };
    if (view === 'add-contact') payload.doNotEnroll = doNotEnroll;
    const result = await postCrmWorkflow(endpoint, payload);
    setMessage(result.ok ? 'Saved. No provider enrollment or email occurred.' : result.error || 'Request failed.');
  };

  if (view === 'activity') return (
    <section className="adminPortal-card"><h2 className="adminPortal-cardTitle">CRM Activity</h2><p className="adminPortal-cardSub">Append-only local CRM activity. No provider activity is triggered.</p>{message ? <p role="status">{message}</p> : null}<pre className="adminPortal-codeBlock">{JSON.stringify(items, null, 2)}</pre></section>
  );

  return (
    <section className="adminPortal-card">
      <h2 className="adminPortal-cardTitle">{view === 'add-contact' ? 'Add Adult Contact' : view === 'segments' ? 'Local Segment Preview' : 'Create CRM Task'}</h2>
      <p className="adminPortal-cardSub">Protected local CRM workflow. Never include child medical, assessment, grade, or access-code information.</p>
      <form className="adminPortal-form" onSubmit={submit}>
        {view === 'add-contact' ? <>
          <label className="adminPortal-field">First name<input name="firstName" /></label>
          <label className="adminPortal-field">Last name<input name="lastName" /></label>
          <label className="adminPortal-field">Adult email<input name="email" type="email" /></label>
          <label className="adminPortal-field">Role or title<input name="roleTitle" /></label>
          <label className="adminPortal-field">Audience type<input name="audienceType" /></label>
          <label className="adminPortal-field">Source<input name="source" required /></label>
          <label><input type="checkbox" checked={doNotEnroll} onChange={(event) => setDoNotEnroll(event.target.checked)} /> Do not enroll yet</label>
        </> : view === 'segments' ? <label className="adminPortal-field">Contact ID<input name="contactId" required /></label> : <>
          <label className="adminPortal-field">Task title<input name="title" required /></label>
          <label className="adminPortal-field">Contact ID<input name="contactId" /></label>
          <label className="adminPortal-field">Organization ID<input name="organizationId" /></label>
          <label className="adminPortal-field">Due date<input name="dueAt" type="datetime-local" /></label>
          <label className="adminPortal-field">Reminder date<input name="reminderAt" type="datetime-local" /></label>
        </>}
        <button type="submit" className="adminPortal-btn adminPortal-btn--primary">{view === 'segments' ? 'Evaluate locally' : 'Save'}</button>
      </form>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
}
