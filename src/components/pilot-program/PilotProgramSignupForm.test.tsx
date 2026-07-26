import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PilotProgramSignupForm from './PilotProgramSignupForm';

function renderForm(
  onSubmit = jest.fn().mockResolvedValue(undefined),
  error: { title: string; body: string } | null = null,
  onRetry = jest.fn().mockResolvedValue(undefined),
) {
  return {
    onSubmit,
    onRetry,
    ...render(
      <MemoryRouter>
        <PilotProgramSignupForm
          onSubmit={onSubmit}
          onRetry={onRetry}
          submitting={false}
          error={error}
        />
      </MemoryRouter>,
    ),
  };
}

function fillIndependentFamily(email: string) {
  fireEvent.change(screen.getByLabelText('Program Type'), {
    target: { value: 'Independent Family' },
  });
  fireEvent.change(screen.getByLabelText('Child First Name'), {
    target: { value: 'Avery' },
  });
  fireEvent.change(screen.getByLabelText('Parent / Guardian First Name'), {
    target: { value: 'Guardian' },
  });
  fireEvent.change(screen.getByLabelText('Family Display Name'), {
    target: { value: 'Avery Family' },
  });
  fireEvent.change(screen.getByLabelText('Parent / Guardian Email'), {
    target: { value: email },
  });
  fireEvent.click(screen.getByRole('checkbox'));
}

describe('PilotProgramSignupForm', () => {
  test('rejects an invalid email before requesting signup and preserves values', () => {
    const { onSubmit } = renderForm();
    fillIndependentFamily('not-an-email');

    fireEvent.click(screen.getByRole('button', { name: 'Create Family Access' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid parent or guardian email.');
    expect(screen.getByDisplayValue('not-an-email')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Avery Family')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('accepts a valid email and retains values when a server error is rendered', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const rendered = renderForm(onSubmit);
    fillIndependentFamily('guardian@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Create Family Access' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    rendered.rerender(
      <MemoryRouter>
        <PilotProgramSignupForm
          onSubmit={onSubmit}
          onRetry={rendered.onRetry}
          submitting={false}
          error={{
            title: "We couldn't create your program.",
            body: "Your information hasn't been lost. Please try again.",
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByDisplayValue('guardian@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Avery Family')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't create your program.");
    expect(screen.queryByText(/support code/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(rendered.onRetry).toHaveBeenCalledTimes(1);
  });
});
