import type { BankAuditSummary } from './types';
import { PRODUCTION_DUPLICATE_REGISTRY } from '../../src/data/shared/productionDuplicateRegistry';

export function generateDuplicateActionPlanMarkdown(bankAudit: BankAuditSummary): string {
  const lines: string[] = [];
  lines.push('# Question Duplicates — Action Plan');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`Total duplicate question groups: ${bankAudit.duplicateActionPlan.length}`);
  lines.push('');

  const byAction = {
    safe_to_merge: bankAudit.duplicateActionPlan.filter((g) => g.action === 'safe_to_merge'),
    staging_duplicate_only: bankAudit.duplicateActionPlan.filter((g) => g.action === 'staging_duplicate_only'),
    needs_human_review: bankAudit.duplicateActionPlan.filter((g) => g.action === 'needs_human_review'),
    keep_different_context: bankAudit.duplicateActionPlan.filter((g) => g.action === 'keep_different_context'),
  };

  for (const [action, groups] of Object.entries(byAction)) {
    lines.push(`## ${action.replace(/_/g, ' ').toUpperCase()} (${groups.length})`);
    lines.push('');
    for (const group of groups.slice(0, 40)) {
      lines.push(`### "${group.sampleText.slice(0, 90)}${group.sampleText.length > 90 ? '…' : ''}"`);
      lines.push('');
      lines.push(`- **Action:** ${group.action}`);
      lines.push(`- **Rationale:** ${group.rationale}`);
      lines.push(`- **Sources:** ${group.sources.join(', ')}`);
      lines.push(`- **Characters:** ${group.characters.join(', ')}`);
      lines.push(`- **Grade bands:** ${group.gradeBands.join(', ')}`);
      lines.push(`- **Question IDs:** ${group.questionIds.join(', ')}`);
      lines.push('');
    }
    if (groups.length > 40) {
      lines.push(`_…and ${groups.length - 40} more groups_`);
      lines.push('');
    }
  }

  lines.push('## Production Duplicate Registry');
  lines.push('');
  lines.push('No production questions are deleted automatically. Review entries below before merging.');
  lines.push('');
  for (const entry of PRODUCTION_DUPLICATE_REGISTRY) {
    lines.push(`- **${entry.action}** — ${entry.questionIds.join(', ')}`);
    lines.push(`  - ${entry.note}`);
  }
  lines.push('');

  return lines.join('\n');
}
