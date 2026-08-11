import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import FamilyCharactersHubPanel from '../../components/family-portal/panels/FamilyCharactersHubPanel';
import FamilyParentsCornerHubPanel from '../../components/family-portal/panels/FamilyParentsCornerHubPanel';

jest.mock('../../components/family-portal/panels/FamilyCharactersPanel', () => () => <p>Character directory</p>);
jest.mock('../../components/family-portal/panels/FamilyInventoryPanel', () => {
  const React = require('react');
  return React.lazy(() => Promise.resolve({ default: () => <p>Collection shelf</p> }));
});
jest.mock('../../components/family-portal/panels/FamilyGuidePanel', () => () => <p>At home guide</p>);
jest.mock('../../components/family-portal/panels/FamilyDownloadsPanel', () => () => <p>Printable library</p>);
jest.mock('../../components/family-portal/panels/FamilyGalleryPanel', () => {
  const React = require('react');
  return React.lazy(() => Promise.resolve({ default: () => <p>Family gallery</p> }));
});
jest.mock('../../components/family-portal/panels/FamilyCertificatesPanel', () => {
  const React = require('react');
  return React.lazy(() => Promise.resolve({ default: () => <p>Certificate shelf</p> }));
});

function HistoryControls() {
  const navigate = useNavigate();
  const location = useLocation();
  return <><output>{location.pathname}{location.search}</output><button onClick={() => navigate(-1)}>Back</button><button onClick={() => navigate(1)}>Forward</button></>;
}

describe('family hub query tabs', () => {
  test('Characters deep links render immediately and preserve browser history', async () => {
    render(
      <MemoryRouter initialEntries={['/family-hub/characters']}>
        <HistoryControls />
        <Routes><Route path="/family-hub/characters" element={<FamilyCharactersHubPanel />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Character directory')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Collections' }));
    expect(await screen.findByText('Collection shelf')).toBeInTheDocument();
    expect(screen.queryByText('Character directory')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('/family-hub/characters?tab=collections');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Character directory')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Forward' }));
    expect(await screen.findByText('Collection shelf')).toBeInTheDocument();
  });

  test('Parents Corner deep links and tab clicks render without a reload', async () => {
    render(
      <MemoryRouter initialEntries={['/family-hub/parents-corner?tab=gallery']}>
        <HistoryControls />
        <Routes><Route path="/family-hub/parents-corner" element={<FamilyParentsCornerHubPanel />} /></Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText('Family gallery')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Certificates' }));
    expect(await screen.findByText('Certificate shelf')).toBeInTheDocument();
    expect(screen.queryByText('Family gallery')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Family gallery')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Forward' }));
    expect(await screen.findByText('Certificate shelf')).toBeInTheDocument();
  });
});
