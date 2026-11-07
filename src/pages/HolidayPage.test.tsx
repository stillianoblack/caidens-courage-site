import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PilotAccessProvider } from '../components/courage/PilotAccessProvider';
import HolidayPage from './HolidayPage';

describe('Season of Courage landing page', () => {
  it('shows the holiday collection, current prices, and keeps bundle checkout closed', () => {
    render(
      <MemoryRouter>
        <PilotAccessProvider>
          <HolidayPage />
        </PilotAccessProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Give the Gift of Courage This Holiday Season' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hardcover' })).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Paperback' })).toBeInTheDocument();
    expect(screen.getByText('$30')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Holiday Adventure Bundle' })).toBeInTheDocument();
    expect(screen.getByText('$59.99')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Holiday Signature Bundle' })).toBeInTheDocument();
    expect(screen.getByText('$75.99')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "Founder's Edition" })).toBeInTheDocument();
    expect(screen.getByText(/Sold out\. This edition cannot be purchased/)).toBeInTheDocument();
    expect(screen.getAllByText('Checkout is not open')).toHaveLength(2);
    expect(screen.getAllByText(/does not start Academy access/)).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Order the hardcover' })).toHaveAttribute('href', 'https://caidenvale.com/story/books');
    expect(screen.getByRole('link', { name: 'Order the paperback' })).toHaveAttribute('href', 'https://caidenvale.com/story/books');
    expect(screen.queryByRole('link', { name: /bundle/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/4gMaEW3DVcWkdAHebS3Ru07/)).not.toBeInTheDocument();
    expect(screen.queryByText(/holiday workbook/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Courage Companion Activity Workbook/)).toHaveLength(2);
  });
});
