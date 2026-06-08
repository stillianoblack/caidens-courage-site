import React, { useState } from 'react';
import {
  generateParticipantReassignmentSql,
  previewParticipantReassignment,
  type ParticipantReassignmentPreview,
} from '../../lib/participantReassignmentService';

type AdminParticipantReassignmentProps = {
  onCopied?: (message: string) => void;
};

export default function AdminParticipantReassignment({ onCopied }: AdminParticipantReassignmentProps) {
  const [oldProgramCode, setOldProgramCode] = useState('');
  const [newProgramCode, setNewProgramCode] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [nickname, setNickname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [preview, setPreview] = useState<ParticipantReassignmentPreview | null>(null);
  const [sql, setSql] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const input = {
    oldProgramCode,
    newProgramCode,
    participantId: participantId.trim() || undefined,
    nickname: nickname.trim() || undefined,
    firstName: firstName.trim() || undefined,
  };

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    setSql('');
    const result = await previewParticipantReassignment(input);
    setPreview(result);
    if (result.error) setError(result.error);
    console.info('[participant_reassignment] preview', result.log);
    setLoading(false);
  };

  const handleGenerateSql = () => {
    setError(null);
    const result = generateParticipantReassignmentSql(input);
    if (result.error) {
      setError(result.error);
      setSql('');
      return;
    }
    setSql(result.sql);
    console.info('[participant_reassignment] sql_plan', result.log);
  };

  const handleCopySql = async () => {
    if (!sql) return;
    try {
      await navigator.clipboard.writeText(sql);
      onCopied?.('SQL copied');
    } catch {
      setError('Could not copy SQL to clipboard.');
    }
  };

  return (
    <section className="adminPortal-reassignCard">
      <h2 className="adminPortal-cardTitle">Participant Reassignment</h2>
      <p className="adminPortal-cardSub">
        Preview and generate SQL to move a child participant and related records from one program code to
        another. This does not run updates automatically — copy the SQL into Supabase SQL editor.
      </p>

      <div className="adminPortal-reassignGrid">
        <div className="adminPortal-field">
          <label htmlFor="reassign-old-code">Old Program Code</label>
          <input
            id="reassign-old-code"
            value={oldProgramCode}
            onChange={(event) => setOldProgramCode(event.target.value)}
            placeholder="FAMILY-XXXX-2026"
          />
        </div>
        <div className="adminPortal-field">
          <label htmlFor="reassign-new-code">New Program Code</label>
          <input
            id="reassign-new-code"
            value={newProgramCode}
            onChange={(event) => setNewProgramCode(event.target.value)}
            placeholder="FAMILY-YYYY-2026"
          />
        </div>
        <div className="adminPortal-field">
          <label htmlFor="reassign-participant-id">Participant ID (optional)</label>
          <input
            id="reassign-participant-id"
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            placeholder="uuid"
          />
        </div>
        <div className="adminPortal-field">
          <label htmlFor="reassign-nickname">Nickname (if no ID)</label>
          <input
            id="reassign-nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
        </div>
        <div className="adminPortal-field">
          <label htmlFor="reassign-first-name">First Name (if no ID)</label>
          <input
            id="reassign-first-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>
      </div>

      <div className="adminPortal-reassignActions">
        <button
          type="button"
          className="adminPortal-btn adminPortal-btn--primary"
          onClick={() => void handlePreview()}
          disabled={loading}
        >
          {loading ? 'Previewing…' : 'Preview Affected Rows'}
        </button>
        <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={handleGenerateSql}>
          Generate SQL
        </button>
        {sql ? (
          <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void handleCopySql()}>
            Copy SQL
          </button>
        ) : null}
      </div>

      {error ? <p className="adminPortal-error">{error}</p> : null}

      {preview && !preview.error ? (
        <div className="adminPortal-reassignPreview">
          <p className="adminPortal-reassignPreviewTitle">Preview log</p>
          <ul className="adminPortal-reassignLog">
            {preview.log.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <table className="adminPortal-reassignTable">
            <thead>
              <tr>
                <th>Table</th>
                <th>Rows</th>
              </tr>
            </thead>
            <tbody>
              {preview.tables.map((row) => (
                <tr key={row.table}>
                  <td>{row.table}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {sql ? (
        <div className="adminPortal-reassignSqlWrap">
          <p className="adminPortal-reassignPreviewTitle">Generated SQL (manual run only)</p>
          <textarea className="adminPortal-reassignSql" readOnly value={sql} rows={14} />
        </div>
      ) : null}
    </section>
  );
}
