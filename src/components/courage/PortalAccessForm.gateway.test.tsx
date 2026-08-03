import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

describe('Enter the World character gateway', () => {
  it('renders the three supplied character guides first without administrative role cards', () => {
    renderGateway();

    expect(screen.getByRole('button', { name: 'Caiden: Continue the Adventure' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Dr. Victoria: Support the Journey' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Uncle T: Guide the Program' })).toBeInTheDocument();
    expect(screen.getAllByRole('button').slice(0, 3).map((button) => button.getAttribute('aria-label'))).toEqual([
      'Caiden: Continue the Adventure',
      'Uncle T: Guide the Program',
      'Dr. Victoria: Support the Journey',
    ]);
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Facilitator')).toBeInTheDocument();
    expect(screen.getByText('Parents / Guardians')).toBeInTheDocument();
    expect(screen.getByText('Continue Your Adventure')).toBeInTheDocument();
    expect(screen.getByText('Help Young Heroes')).toBeInTheDocument();
    expect(screen.getByText('Teach the Academy')).toBeInTheDocument();
    expect(screen.getByText('Continue Your Quests, Games, And Weekly Adventures.')).toBeInTheDocument();
    expect(screen.getByText('Students, Activities, And Program Progress.')).toBeInTheDocument();
    expect(screen.getByText('Access Family Tools And View Your Child’s Experience.')).toBeInTheDocument();
    expect(screen.queryByText('For Students')).not.toBeInTheDocument();
    expect(screen.queryByText('For Parents / Guardians')).not.toBeInTheDocument();
    expect(screen.queryByText('For Facilitator / Teachers')).not.toBeInTheDocument();
    expect(screen.getByAltText('Student B-4 guide')).toHaveAttribute(
      'src',
      '/images/Choose-Your-Guide/B-4student.webp',
    );
    expect(screen.getByAltText('Parent and guardian B-4 guide')).toHaveAttribute(
      'src',
      '/images/Choose-Your-Guide/b-4facilitator.webp',
    );
    expect(screen.getByAltText('Facilitator B-4 guide')).toHaveAttribute('src', '/images/Choose-Your-Guide/B-4orange.webp');
    expect(document.querySelectorAll('.cc-portal-characterImage--default.b4-animatedHead')).toHaveLength(3);
    expect(document.querySelectorAll('.cc-portal-characterImage--default .b4-animatedHeadFrame--closed')).toHaveLength(3);
    const floatingGuides = Array.from(
      document.querySelectorAll<HTMLElement>('.cc-portal-characterImage--default .b4-animatedHeadFloat'),
    );
    expect(floatingGuides.map((guide) => [
      guide.style.getPropertyValue('--b4-float-travel'),
      guide.style.getPropertyValue('--b4-float-duration'),
      guide.style.getPropertyValue('--b4-float-delay'),
    ])).toEqual([
      ['8px', '6.2s', '-1.1s'],
      ['11px', '7.1s', '-3.4s'],
      ['7px', '5.4s', '-2.2s'],
    ]);
    expect(document.querySelectorAll('.cc-portal-characterImage--hover')).toHaveLength(3);
    expect(Array.from(document.querySelectorAll<HTMLImageElement>('.cc-portal-characterImage--hover')).map((image) => image.src)).toEqual([
      expect.stringContaining('/images/Choose-Your-Guide/B-4student-hover-bkgrd.webp'),
      expect.stringContaining('/images/Choose-Your-Guide/B-4orange-hover-bkgrd.webp'),
      expect.stringContaining('/images/Choose-Your-Guide/b-4facilitator-hover-bkgrd.webp'),
    ]);
    expect(screen.queryByLabelText('Access Code')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Student PIN')).not.toBeInTheDocument();
  });

  it.each([
    ['Caiden: Continue the Adventure', 'Continue Students', 'Student PIN', 'Enter the World', 'student'],
    ['Dr. Victoria: Support the Journey', 'Continue as Parent / Guardian', 'Parent email or student PIN', 'Continue to Family Portal', 'parent'],
    ['Uncle T: Guide the Program', 'Continue as Facilitator', 'Facilitator email', 'Open Facilitator Portal', 'facilitator'],
  ])('maps %s to the existing form in the same card', async (guide, heading, credential, cta, intent) => {
    const props = renderGateway();

    fireEvent.click(screen.getByRole('button', { name: guide }));

    expect(screen.getByRole('button', { name: guide })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByLabelText('Access Code')).toBeInTheDocument();
    expect(screen.getByLabelText(credential)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cta })).toBeInTheDocument();
    expect(props.onPortalIntentChange).toHaveBeenCalledWith(intent);
  });

  it('returns to character selection without navigation or reload', async () => {
    renderGateway();
    fireEvent.click(screen.getByRole('button', { name: 'Caiden: Continue the Adventure' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Choose another guide' }));

    expect(screen.getByRole('button', { name: 'Caiden: Continue the Adventure' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Access Code')).not.toBeInTheDocument();
  });

  it('preserves submit, loading, error, and recovery behavior inside the selected form', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Caiden: Continue the Adventure' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('That code did not match.');
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
    await waitFor(() => expect(screen.getByRole('button', { name: 'Unlocking…' })).toBeDisabled());
  });
});
