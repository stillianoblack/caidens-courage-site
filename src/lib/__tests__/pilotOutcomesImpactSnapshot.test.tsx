import { render, screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import {
  LiveLearningSignalsPanel,
  VerifiedGrowthPanel,
} from '../../components/admin/AdminPilotEvidencePanels';
import type { PilotOutcomeProgram } from '../../types/pilotOutcomes';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildPilotOutcomes } = require('../../../netlify/functions/_lib/pilotOutcomes');

function baselineOnlyProgram(): PilotOutcomeProgram {
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
    participants: [
      { id: 'p1', program_code: 'ACCESSIBLE', role: 'student', grade_level: '4' },
      { id: 'p2', program_code: 'ACCESSIBLE', role: 'student', grade_level: '5' },
    ],
    assessments: [
      { participant_id: 'p1', assessment_type: 'baseline', percent_score: 40, reading_score: 2, confidence_score: 20, focus_score: 2 },
      { participant_id: 'p2', assessment_type: 'baseline', percent_score: 45, reading_score: 3, confidence_score: 22, focus_score: 2 },
    ],
    modules: [
      { participant_id: 'p1', program_code: 'ACCESSIBLE', character: 'zeke', percent_score: 72, module_id: 'm1', answers_json: { _attempts: { q1: { correct: true } } } },
      { participant_id: 'p2', program_code: 'ACCESSIBLE', character: 'miranda', skill_area: 'SEL', percent_score: 68, module_id: 'm2' },
      { participant_id: 'p1', program_code: 'ACCESSIBLE', character: 'b4', percent_score: 61, module_id: 'm3' },
    ],
    weeks: [{ participant_id: 'p1', week_id: 'w1' }, { participant_id: 'p2', week_id: 'w1' }],
  }, { publishedWeeks: 2 }).programs[0];
}

describe('Pilot outcomes evidence panels', () => {
  it('renders live learning signals without post-assessments', () => {
    const program = baselineOnlyProgram();
    expect(program.post.count).toBe(0);
    render(<LiveLearningSignalsPanel program={program} />);
    expect(screen.getByRole('heading', { name: 'Live Student Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Reading comprehension signal/i })).toBeInTheDocument();
    expect(screen.getAllByText('Directional').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Overall live learning signal/i })).toBeInTheDocument();
    expect(screen.queryByText(/Overall Growth/i)).not.toBeInTheDocument();
  });

  it('shows verified growth pending instead of live growth labels', () => {
    render(<VerifiedGrowthPanel program={baselineOnlyProgram()} />);
    expect(screen.getByRole('heading', { name: 'Verified Outcomes' })).toBeInTheDocument();
    expect(screen.getByText(/Verified growth will appear after matched post-assessments/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Verified growth pending/i).length).toBeGreaterThan(0);
  });

  it('includes expandable calculation details for every live circle', () => {
    render(<LiveLearningSignalsPanel program={baselineOnlyProgram()} />);
    expect(screen.getAllByText('View calculation details')).toHaveLength(6);
  });

  it('includes responsive fixture layouts without fixed card widths', () => {
    const css = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/admin/admin-program-health-visual.css'),
      'utf8',
    );
    expect(css).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(css).toContain('@media (max-width: 760px)');
    expect(css).toContain('phVisual-evidenceBadge');
  });
});
