import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminPilotProgramsTab from '../../components/admin/tabs/AdminPilotProgramsTab';

describe('AdminPilotProgramsTab', () => {
  it('shows a load error message when programs cannot be fetched', () => {
    render(
      <AdminPilotProgramsTab
        programs={[]}
        loading={false}
        loadError="We couldn’t load your programs."
        onCopied={jest.fn()}
        onChanged={jest.fn()}
      />,
    );
    expect(screen.getByText('We couldn’t load your programs.')).toBeInTheDocument();
  });
});
