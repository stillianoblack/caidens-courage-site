import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import FamilyCharactersHubPanel from '../../components/family-portal/panels/FamilyCharactersHubPanel';
import FamilyParentsCornerHubPanel from '../../components/family-portal/panels/FamilyParentsCornerHubPanel';

jest.mock('../../components/family-portal/panels/FamilyCharactersPanel', () => () => <p>Character directory</p>);
jest.mock('../../components/family-portal/panels/FamilyInventoryPanel', () => () => <p>Collection shelf</p>);
jest.mock('../../components/family-portal/panels/FamilyGuidePanel', () => () => <p>At home guide</p>);
jest.mock('../../components/family-portal/panels/FamilyDownloadsPanel', () => () => <p>Printable library</p>);
jest.mock('../../components/family-portal/panels/FamilyGalleryPanel', () => () => <p>Family gallery</p>);
jest.mock('../../components/family-portal/panels/FamilyCertificatesPanel', () => () => <p>Certificate shelf</p>);

function HistoryControls() {
  const navigate = useNavigate();
  const location = useLocation();
  return <><output>{location.pathname}{location.search}</output><button onClick={() => navigate(-1)}>Back</button></>;
}

describe('family hub query tabs', () => {
  test('Characters deep links render immediately and preserve browser history', () => {
    render(
      <MemoryRouter initialEntries={['/family-hub/characters']}>
        <HistoryControls />
        <Routes><Route path="/family-hub/characters" element={<FamilyCharactersHubPanel />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Character directory')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Collections' }));
    expect(screen.getByText('Collection shelf')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('/family-hub/characters?tab=collections');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Character directory')).toBeInTheDocument();
  });

  test('Parents Corner deep links and tab clicks render without a reload', () => {
    render(
      <MemoryRouter initialEntries={['/family-hub/parents-corner?tab=gallery']}>
        <HistoryControls />
        <Routes><Route path="/family-hub/parents-corner" element={<FamilyParentsCornerHubPanel />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Family gallery')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Certificates' }));
    expect(screen.getByText('Certificate shelf')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Family gallery')).toBeInTheDocument();
  });
});
