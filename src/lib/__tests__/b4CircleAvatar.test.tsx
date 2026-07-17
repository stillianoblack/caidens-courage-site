import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import B4CircleAvatar from '../../components/b4/B4CircleAvatar';

describe('B4CircleAvatar', () => {
  test('uses the requested participant variant without substituting Courage', () => {
    render(<B4CircleAvatar variant="pattern" alt="Pattern companion" />);
    expect(screen.getByRole('img', { name: 'Pattern companion' })).toHaveAttribute(
      'src',
      '/assets/b4/pattern/idle/b4-pattern-idle.png',
    );
  });

  test('shows a neutral placeholder while loading and when an asset fails', () => {
    const { rerender } = render(<B4CircleAvatar variant="fusion" loading alt="Fusion companion" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    rerender(<B4CircleAvatar variant="fusion" alt="Fusion companion" />);
    fireEvent.error(screen.getByRole('img', { name: 'Fusion companion' }));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('B-4')).toBeInTheDocument();
  });

  test('does not attach an invalid variant to a child', () => {
    render(<B4CircleAvatar variant="not-a-unit" alt="Invalid unit" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('B-4')).toBeInTheDocument();
  });

  test('preserves legacy spark compatibility as Courage', () => {
    render(<B4CircleAvatar variant="spark" alt="Legacy companion" />);
    expect(screen.getByRole('img', { name: 'Legacy companion' })).toHaveAttribute(
      'src',
      '/assets/b4/courage/idle/b4-courage-idle.png',
    );
  });

  test('uses the same full-fit image stage for every canonical variant', () => {
    const variants = ['courage', 'pattern', 'shield', 'anchor', 'fusion'];
    const { container } = render(
      <>
        {variants.map((variant) => (
          <B4CircleAvatar key={variant} variant={variant} alt={`${variant} companion`} />
        ))}
      </>,
    );

    expect(container.querySelectorAll('.b4CircleAvatar__imageStage')).toHaveLength(5);
    expect(container.querySelectorAll('.b4CircleAvatar__image')).toHaveLength(5);
  });
});
