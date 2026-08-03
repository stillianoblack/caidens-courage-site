import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from '../portal-design-system/ToastProvider';
import PilotAddStudentDrawer from './PilotAddStudentDrawer';
import { createCampChildWithOptionalParent } from '../../lib/campChildOnboardingService';

jest.mock('../../lib/campChildOnboardingService', () => ({
  createCampChildWithOptionalParent: jest.fn(),
}));

const createStudent = createCampChildWithOptionalParent as jest.MockedFunction<
  typeof createCampChildWithOptionalParent
>;

describe('Add Student deterministic acceptance interaction', () => {
  test('reads stable fields back, enables submit, and submits exactly once', async () => {
    createStudent.mockResolvedValue({
      success: true,
      participantId: '00000000-0000-4000-8000-000000000001',
      linkId: '00000000-0000-4000-8000-000000000002',
      displayName: 'Acceptance',
      message: 'Student added.',
      studentPin: '1234',
      familyClaimCode: 'CLAIM-CODE',
      parentConnectionStatus: 'unclaimed',
    });
    const onSuccess = jest.fn();

    render(
      <ToastProvider>
        <PilotAddStudentDrawer
          open
          onClose={jest.fn()}
          programCode="PROGRAM"
          programName="Program"
          onSuccess={onSuccess}
        />
      </ToastProvider>,
    );

    const firstName = await screen.findByTestId('add-student-first-name');
    const lastName = screen.getByTestId('add-student-last-name');
    const nickname = screen.getByTestId('add-student-nickname');
    const grade = screen.getByTestId('add-student-grade-level');
    const submit = screen.getByTestId('add-student-submit');

    fireEvent.change(firstName, { target: { value: 'Release' } });
    fireEvent.change(lastName, { target: { value: 'Acceptance' } });
    fireEvent.change(nickname, { target: { value: 'Acceptance' } });
    fireEvent.change(grade, { target: { value: '5' } });

    expect(firstName).toHaveValue('Release');
    expect(lastName).toHaveValue('Acceptance');
    expect(nickname).toHaveValue('Acceptance');
    expect(grade).toHaveValue('5');
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    await waitFor(() => expect(createStudent).toHaveBeenCalledTimes(1));
    expect(createStudent).toHaveBeenCalledWith(expect.objectContaining({
      childFirstName: 'Release',
      childLastName: 'Acceptance',
      childNickname: 'Acceptance',
      gradeLevel: '5',
      campProgramCode: 'PROGRAM',
    }));
    expect(await screen.findByText('Student ready')).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
