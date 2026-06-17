import fs from 'fs';
import path from 'path';
import '../../data/caiden/index';
import { CAIDEN_ADAPTIVE_QUEST_REGISTRY, buildCaidenAdaptiveConfig } from '../../data/caiden/caidenAdaptiveBuilder';
import { finalizeAdaptiveQuestions } from '../adaptiveQuestionSelection';
import { resolveBaseGradeBand } from '../getGradeBand';
import { passesReasoningDepthCheck } from '../reasoningDepthFilter';
import { resolveQuestionSourceBand } from '../gradeBandQuestionSelection';
import {
  auditMissionRouting,
  GRADE_SCENARIOS,
} from '../gradeQuestionRoutingAudit';

describe('resolveBaseGradeBand', () => {
  test('resolveBaseGradeBand("4") returns "4-5"', () => {
    expect(resolveBaseGradeBand({ gradeLevel: '4' })).toBe('4-5');
  });

  test('missing grade_level falls back to grade_band', () => {
    expect(
      resolveBaseGradeBand({
        gradeLevel: null,
        gradeBand: '4-5',
      }),
    ).toBe('4-5');
  });

  test('missing grade_level and grade_band uses safe default 2-3', () => {
    expect(
      resolveBaseGradeBand({
        gradeLevel: null,
        gradeBand: null,
      }),
    ).toBe('2-3');
  });
});

describe('grade 4 stretch routing', () => {
  const quest2 = CAIDEN_ADAPTIVE_QUEST_REGISTRY['quest-2'];

  test('grade 4 + stretch off never returns 6-8', () => {
    const result = finalizeAdaptiveQuestions(quest2.gradeContent, {
      missionId: 'quest-2',
      gradeLevel: '4',
      gradeBand: '4-5',
      allowStretch: false,
    });

    expect(result.usedStretch).toBe(false);
    for (const question of result.questions) {
      const sourceBand = resolveQuestionSourceBand(quest2.gradeContent, question.id);
      expect(sourceBand).not.toBe('6-8');
    }
  });

  test('grade 4 + stretch on may serve stretch-band inventory when present', () => {
    const result = finalizeAdaptiveQuestions(quest2.gradeContent, {
      missionId: 'quest-2',
      gradeLevel: '4',
      gradeBand: '4-5',
      allowStretch: true,
    });

    if (result.usedStretch) {
      for (const question of result.questions) {
        const sourceBand = resolveQuestionSourceBand(quest2.gradeContent, question.id);
        expect(sourceBand).toBe('6-8');
      }
    } else {
      for (const question of result.questions) {
        const sourceBand = resolveQuestionSourceBand(quest2.gradeContent, question.id);
        expect(sourceBand).not.toBe('6-8');
      }
    }
  });
});

describe('contentVersion in selected question payload', () => {
  test('buildCaidenAdaptiveConfig includes diagnostic content metadata', () => {
    const quest2 = CAIDEN_ADAPTIVE_QUEST_REGISTRY['quest-2'];
    const config = buildCaidenAdaptiveConfig(quest2, '4-5', {
      gradeLevel: '4',
      allowStretch: false,
    });

    expect(config.questions.length).toBeGreaterThan(0);
    expect(config.questions[0]?.diagnosticMeta?.contentBand).toBe('4-5');
    expect(config.questions[0]?.diagnosticMeta?.contentVersion).toBeTruthy();
  });
});

describe('mission flows use async Supabase grade settings', () => {
  const adaptiveFlowFiles = [
    'src/components/caiden/CaidenQuestFlow.tsx',
    'src/components/miranda/MirandaMissionFlow.tsx',
    'src/components/zeke/ZekeMissionFlow.tsx',
    'src/components/charlie/CharlieMissionFlow.tsx',
  ];

  test.each(adaptiveFlowFiles)('%s delegates to shared adaptive mission shell', (relativePath) => {
    const source = fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
    expect(source).toMatch(/AdaptiveMissionGameFlow/);
    expect(source).toMatch(/resolveConfig=/);
    expect(source).not.toMatch(/readParticipantGradeSettings\(\)/);
  });

  test('AdaptiveMissionGameFlow waits on async grade resolution + frozen config', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/mission-game/AdaptiveMissionGameFlow.tsx'),
      'utf8',
    );
    expect(source).toMatch(/useAdaptiveMissionFlowConfig/);
    expect(source).toMatch(/GradeResolutionLoading/);
    expect(source).toMatch(/missionCharacterId=/);
  });

  test('useAdaptiveMissionFlowConfig latches grade + freezes mission config', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/hooks/useAdaptiveMissionFlowConfig.ts'),
      'utf8',
    );
    expect(source).toMatch(/useAdaptiveMissionGrade/);
    expect(source).toMatch(/useStableAdaptiveMissionConfig/);
    expect(source).toMatch(/gradeDiagnostics/);
  });

  test('B4MissionFlow loads grade settings from Supabase async and freezes config', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/b4/B4MissionFlow.tsx'),
      'utf8',
    );
    expect(source).toMatch(/useB4GradeBand/);
    expect(source).toMatch(/readParticipantGradeSettingsAsync/);
    expect(source).toMatch(/useStableAdaptiveMissionConfig/);
    expect(source).toMatch(/gradeDiagnostics/);
    expect(source).toMatch(/missionCharacterId="b4"/);
  });

  test('useMirandaGradeBand fetches grade settings asynchronously', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/hooks/useMirandaGradeBand.ts'),
      'utf8',
    );
    expect(source).toMatch(/readParticipantGradeSettingsAsync/);
  });

  test('useAdaptiveMissionGrade delegates to async Miranda grade hook', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/hooks/useAdaptiveMissionGrade.ts'),
      'utf8',
    );
    expect(source).toMatch(/useMirandaGradeBand/);
  });
});

describe('grade routing audit scenarios', () => {
  test('missing grade scenario flags warning in audit row', () => {
    const quest2 = CAIDEN_ADAPTIVE_QUEST_REGISTRY['quest-2'];
    const scenario = GRADE_SCENARIOS.find((row) => row.id === 'missing-grade');
    expect(scenario).toBeDefined();

    const config = buildCaidenAdaptiveConfig(quest2, '2-3', {
      gradeLevel: null,
      allowStretch: false,
    });

    const row = auditMissionRouting({
      character: 'caiden',
      missionId: 'quest-2',
      gradeContent: quest2.gradeContent,
      scenario: scenario!,
      config,
    });

    expect(row.resolvedBaseBand).toBe('2-3');
    expect(row.warnings.some((warning) => warning.includes('Missing grade_level'))).toBe(true);
  });
});
