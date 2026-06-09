import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { isIndependentFamilyProgram } from '../../lib/independentFamilyProgram';
import {
  createStudentFamilyLink,
  fetchStudentFamilyLinksByCampProgram,
  suggestFamilyProgramCode,
  type StudentFamilyLink,
} from '../../lib/studentFamilyLinkService';
import {
  fetchStudentParticipantsFromSupabase,
  type StudentParticipantRecord,
} from '../../lib/pilotTrackingService';

function childLabel(participant: StudentParticipantRecord): string {
  return participant.nickname?.trim() || participant.first_name?.trim() || 'Student';
}

export default function CampParentLinkCard() {
  const activeProgram = readActivePilotProgram();
  const campProgramCode = activeProgram?.programCode?.trim() ?? '';

  const [students, setStudents] = useState<StudentParticipantRecord[]>([]);
  const [links, setLinks] = useState<StudentFamilyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState('');
  const [familyProgramCode, setFamilyProgramCode] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [relationship, setRelationship] = useState('Parent/Guardian');

  const selectedStudent = useMemo(
    () => students.find((row) => row.id === studentId) ?? null,
    [studentId, students],
  );

  const refresh = useCallback(async () => {
    if (!campProgramCode || isIndependentFamilyProgram(activeProgram)) {
      setStudents([]);
      setLinks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const [studentsPayload, linksPayload] = await Promise.all([
      fetchStudentParticipantsFromSupabase(campProgramCode),
      fetchStudentFamilyLinksByCampProgram(campProgramCode),
    ]);
    setStudents(studentsPayload.participants);
    setLinks(linksPayload.links);
    setLoading(false);
  }, [activeProgram, campProgramCode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selectedStudent) return;
    setFamilyProgramCode(
      suggestFamilyProgramCode({
        parentLastName,
        studentFirstName: selectedStudent.first_name ?? selectedStudent.nickname ?? undefined,
      }),
    );
  }, [parentLastName, selectedStudent]);

  if (!campProgramCode || isIndependentFamilyProgram(activeProgram)) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentId || !familyProgramCode.trim()) return;

    setSubmitting(true);
    setMessage(null);
    setError(null);

    const result = await createStudentFamilyLink({
      studentId,
      campProgramCode,
      familyProgramCode: familyProgramCode.trim(),
      parentEmail: parentEmail.trim() || undefined,
      parentLastName: parentLastName.trim() || undefined,
      relationship: relationship.trim() || undefined,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Could not link family.');
      return;
    }

    setMessage(
      `Linked ${childLabel(selectedStudent ?? { id: studentId, nickname: null, first_name: null, role: 'student', program_code: campProgramCode, created_at: '' })} to ${familyProgramCode.trim()}. Share the family access code for that program with the parent.`,
    );
    setStudentId('');
    setParentEmail('');
    setParentLastName('');
    void refresh();
  };

  return (
    <section className="pilot-parentLinkCard" aria-labelledby="pilot-parent-link-title">
      <div className="pilot-parentLinkHead">
        <h3 id="pilot-parent-link-title" className="pilot-parentLinkTitle">
          Invite Parent/Guardian / Link Family
        </h3>
        <p className="pilot-parentLinkCopy">
          Connect a camp student to a family program so parents only see their own child&apos;s
          results. Parent/Guardian last name is optional verification only — not used for permissions.
        </p>
      </div>

      {loading ? <p className="pilot-parentLinkHelper">Loading camp students…</p> : null}

      {!loading && students.length === 0 ? (
        <p className="pilot-parentLinkHelper">
          No camp students found yet. Students appear after they complete a profile or check-in.
        </p>
      ) : null}

      {!loading && students.length > 0 ? (
        <form className="pilot-parentLinkForm" onSubmit={(event) => void handleSubmit(event)}>
          <label className="pilot-parentLinkField">
            <span className="pilot-parentLinkLabel">Camp student</span>
            <select
              className="pilot-parentLinkInput"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {childLabel(student)}
                </option>
              ))}
            </select>
          </label>

          <label className="pilot-parentLinkField">
            <span className="pilot-parentLinkLabel">Family program code</span>
            <input
              className="pilot-parentLinkInput"
              value={familyProgramCode}
              onChange={(event) => setFamilyProgramCode(event.target.value)}
              placeholder="FAMILY-SMITH-2026"
              required
            />
          </label>

          <label className="pilot-parentLinkField">
            <span className="pilot-parentLinkLabel">Parent/Guardian email (optional)</span>
            <input
              type="email"
              className="pilot-parentLinkInput"
              value={parentEmail}
              onChange={(event) => setParentEmail(event.target.value)}
              placeholder="parent@email.com"
            />
          </label>

          <label className="pilot-parentLinkField">
            <span className="pilot-parentLinkLabel">Parent/Guardian last name (optional)</span>
            <input
              className="pilot-parentLinkInput"
              value={parentLastName}
              onChange={(event) => setParentLastName(event.target.value)}
              placeholder="Smith"
            />
          </label>

          <label className="pilot-parentLinkField">
            <span className="pilot-parentLinkLabel">Relationship (optional)</span>
            <input
              className="pilot-parentLinkInput"
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
              placeholder="Parent/Guardian"
            />
          </label>

          {message ? (
            <p className="pilot-parentLinkMessage pilot-parentLinkMessage--success" role="status">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="pilot-parentLinkMessage pilot-parentLinkMessage--error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="pilot-parentLinkBtn" disabled={submitting || !studentId}>
            {submitting ? 'Linking…' : 'Link Family'}
          </button>
        </form>
      ) : null}

      {!loading && links.length > 0 ? (
        <div className="pilot-parentLinkExisting">
          <h4 className="pilot-parentLinkExistingTitle">Existing family links</h4>
          <ul className="pilot-parentLinkExistingList">
            {links.map((link) => {
              const student = students.find((row) => row.id === link.student_id);
              return (
                <li key={link.id} className="pilot-parentLinkExistingItem">
                  <strong>{student ? childLabel(student) : 'Unknown Student'}</strong>
                  <span>
                    → {link.family_program_code}
                    {link.parent_last_name ? ` (${link.parent_last_name})` : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
