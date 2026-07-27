import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminPilotProgramsTab from '../../components/admin/tabs/AdminPilotProgramsTab';

describe('AdminPilotProgramsTab', () => {
  it('shows friendly copy and retries in place', () => {
    const onRetry = jest.fn();
    render(
      <AdminPilotProgramsTab
        programs={[]}
        loading={false}
        loadError
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText('We couldn’t load your programs.')).toBeInTheDocument();
    expect(screen.getByText('Please try again in a moment.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
