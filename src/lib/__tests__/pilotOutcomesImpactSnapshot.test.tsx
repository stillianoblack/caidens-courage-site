import { render, screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { PilotImpactSnapshot } from '../../components/admin/tabs/AdminPilotOutcomesTab';
import type { PilotOutcomeProgram } from '../../types/pilotOutcomes';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildPilotOutcomes } = require('../../../netlify/functions/_lib/pilotOutcomes');

function program(): PilotOutcomeProgram {
  return buildPilotOutcomes({
    programs: [{
      id: 'program-1',
      program_name: 'Accessible Pilot',
      program_type: 'School',
      program_code: 'ACCESSIBLE',
      admin_first_name: 'Facilitator',
      pilot_status: 'active',
      start_date: '2026-01-01',
    }],
    participants: [{ id: 'p1', program_code: 'ACCESSIBLE', role: 'student', grade_level: '4' }],
    assessments: [
      { participant_id: 'p1', assessment_type: 'baseline', percent_score: 40, reading_score: 2, confidence_score: 20, focus_score: 2 },
      { participant_id: 'p1', assessment_type: 'post', percent_score: 60, reading_score: 4, confidence_score: 30, focus_score: 3 },
    ],
    weeks: [{ participant_id: 'p1', week_number: 1 }],
  }, { publishedWeeks: 2 }).programs[0];
}

describe('Pilot Impact Snapshot', () => {
  it('renders fixture-style impact cards with accessible summaries', () => {
    render(<PilotImpactSnapshot program={program()} />);
    expect(screen.getByRole('heading', { name: 'Pilot Impact Snapshot' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(6);
    expect(screen.getByRole('img', { name: /Reading comprehension/i })).toBeInTheDocument();
    expect(screen.getByText(/Current status:/i)).toBeInTheDocument();
    expect(screen.queryByText('View calculation details')).not.toBeInTheDocument();
  });

  it('renders missing mappings as Not enough data rather than zero percent', () => {
    const missing = program();
    missing.baseline = { count: 0, total: 1 };
    missing.post = { count: 0, total: 1 };
    missing.impactSnapshot.domains[0] = {
      ...missing.impactSnapshot.domains[0],
      baselinePercentage: null,
      postPercentage: null,
      deltaPercentagePoints: null,
      matchedStudentCount: 0,
      excludedRecordCount: 1,
      dataQualityStatus: 'Not enough data',
      displayStatus: 'Not enough data',
      missingReason: 'A mapped post domain score is missing.',
    };
    render(<PilotImpactSnapshot program={missing} />);
    const readingCard = screen.getByRole('heading', { name: 'Reading comprehension' }).closest('article');
    expect(readingCard).toHaveTextContent('Not enough data');
  });

  it('formats percentage presentation without changing the underlying values', () => {
    const repeating = program();
    repeating.impactSnapshot.participation.percentage = 33.333333333;
    render(<PilotImpactSnapshot program={repeating} />);
    const participationCard = screen.getByRole('heading', { name: 'Participation' }).closest('article');
    expect(participationCard).toHaveTextContent('33.3%');
    expect(participationCard).not.toHaveTextContent('33.333333333');
  });

  it('includes responsive fixture layouts without fixed card widths', () => {
    const css = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/admin/admin-program-health-visual.css'),
      'utf8',
    );
    expect(css).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(css).toContain('@media (max-width: 760px)');
    expect(css).toContain('minmax(0, 1fr)');
    expect(css).toContain('min-width: 0');
  });
});
