import fs from 'fs';
import path from 'path';
import { render, screen } from '@testing-library/react';
import B4VariantSelector from '../../components/b4/B4VariantSelector';

jest.mock('../../hooks/useB4Variant', () => ({
  useB4Variant: () => ({
    variant: 'courage', loading: false, error: null, save: jest.fn(), refresh: jest.fn(),
  }),
}));

describe('family child linkage regressions', () => {
  test('shows an honest B-4 empty state and no save control without a participant', () => {
    render(<B4VariantSelector />);
    expect(screen.getByText('Add or recover a child profile before choosing and saving their B-4.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save B-4' })).not.toBeInTheDocument();
  });

  test('migration creates participant and family link atomically without placeholder names', () => {
    const sql = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20260715000200_independent_family_child_creation.sql'), 'utf8');
    expect(sql).toContain('create or replace function public.create_independent_family_child');
    expect(sql).toContain('insert into public.participants');
    expect(sql).toContain('insert into public.student_family_links');
    expect(sql).toContain('family_child_idempotency_key');
    expect(sql).not.toMatch(/['"]Student['"]/);
  });

  test('shared settings content controls top-level section spacing', () => {
    const css = fs.readFileSync(path.join(process.cwd(), 'src/components/family-portal/family-dashboard.css'), 'utf8');
    expect(css).toMatch(/\.family-settingsContent\s*{[^}]*display:\s*grid;[^}]*gap:\s*1\.75rem;/s);
  });
});
