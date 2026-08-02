import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PortalAccessForm from './PortalAccessForm';

jest.mock('../../config/lastPilotProgram', () => ({
  readLastPilotProgram: () => null,
}));
jest.mock('../../lib/portalReturnRestore', () => ({
  dismissPortalWelcomeBack: jest.fn(),
  hasActivePortalProgramSession: () => false,
  hasSavedPortalReturnSession: () => false,
  restoreSavedPortalReturnSession: () => null,
}));
jest.mock('../../lib/rememberedProgramAccess', () => ({ switchRememberedProgram: jest.fn() }));

const renderGateway = (overrides: Partial<React.ComponentProps<typeof PortalAccessForm>> = {}) => {
  const onPortalIntentChange = jest.fn();
  const props: React.ComponentProps<typeof PortalAccessForm> = {
    variant: 'hero',
    accessCode: '',
    parentEmail: '',
    error: null,
    onAccessCodeChange: jest.fn(),
    onParentEmailChange: jest.fn(),
    onSubmit: jest.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault()),
    onPortalIntentChange,
    ...overrides,
  };
  const StatefulGateway = () => {
    const [intent, setIntent] = React.useState(props.portalIntent ?? 'student');
    return (
      <PortalAccessForm
        {...props}
        portalIntent={intent}
        onPortalIntentChange={(nextIntent) => {
          setIntent(nextIntent);
          onPortalIntentChange(nextIntent);
        }}
      />
    );
  };
  render(<MemoryRouter><StatefulGateway /></MemoryRouter>);
  props.onPortalIntentChange = onPortalIntentChange;
  return props;
};

describe('Enter the World role gateway', () => {
  it('renders role selection first without exposing authentication fields', () => {
    renderGateway();

    expect(screen.getByRole('heading', { name: 'How are you entering the world?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Student Continue your quests/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Parent \/ Guardian Access family tools/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Facilitator Manage students/i })).toBeInTheDocument();
    expect(screen.queryByLabelText('Access Code')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Student PIN')).not.toBeInTheDocument();
  });

  it.each([
    ['Student', 'Student Access', 'Student PIN', 'Enter the World'],
    ['Parent / Guardian', 'Parent / Guardian Access', 'Parent email or student PIN', 'Continue to Family Portal'],
    ['Facilitator', 'Facilitator Access', 'Facilitator email', 'Open Facilitator Portal'],
  ])('opens the %s form in the same card', (role, heading, credential, cta) => {
    const props = renderGateway();

    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${role}`) }));

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByLabelText('Access Code')).toBeInTheDocument();
    expect(screen.getByLabelText(credential)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cta })).toBeInTheDocument();
    expect(props.onPortalIntentChange).toHaveBeenCalledTimes(1);
  });

  it('returns to role selection without navigation or reload', () => {
    renderGateway();
    fireEvent.click(screen.getByRole('button', { name: /^Student/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose another path' }));

    expect(screen.getByRole('heading', { name: 'How are you entering the world?' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Access Code')).not.toBeInTheDocument();
  });

  it('preserves submit, loading, error, and recovery behavior inside the selected form', () => {
    const onSubmit = jest.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const { rerender } = render(
      <MemoryRouter><PortalAccessForm
        variant="hero"
        accessCode=""
        parentEmail=""
        error="That code did not match."
        submitting={false}
        onAccessCodeChange={jest.fn()}
        onParentEmailChange={jest.fn()}
        onSubmit={onSubmit}
        onPortalIntentChange={jest.fn()}
      /></MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /^Student/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('That code did not match.');
    expect(screen.getByRole('button', { name: 'Forgot your code?' })).toBeInTheDocument();
    fireEvent.submit(screen.getByRole('button', { name: 'Enter the World' }).closest('form')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    rerender(
      <MemoryRouter><PortalAccessForm
        variant="hero"
        accessCode=""
        parentEmail=""
        error={null}
        submitting
        onAccessCodeChange={jest.fn()}
        onParentEmailChange={jest.fn()}
        onSubmit={onSubmit}
        onPortalIntentChange={jest.fn()}
      /></MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Unlocking…' })).toBeDisabled();
  });
});
