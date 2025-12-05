import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import App from '../App';

// Mock the map components since they have complex dependencies
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  ZoomControl: () => <div data-testid="zoom-control" />,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: () => 5,
    flyTo: vi.fn(),
    getContainer: () => document.createElement('div'),
    invalidateSize: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
  }),
}));

describe('NavBar', () => {
  it('renders all navigation links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    // Both mobile and desktop navs render links, so use getAllByText
    expect(screen.getAllByText('FLIGHT BOOK & MAP').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("HERO'S JOURNEY").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('GALLERY').length).toBeGreaterThanOrEqual(1);
  });

  it('renders navigation links as actual links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    // Get all links and verify at least one of each has correct href
    const flightBookLinks = screen.getAllByText('FLIGHT BOOK & MAP');
    const heroJourneyLinks = screen.getAllByText("HERO'S JOURNEY");
    const galleryLinks = screen.getAllByText('GALLERY');

    expect(flightBookLinks[0].closest('a')).toHaveAttribute('href', '/');
    expect(heroJourneyLinks[0].closest('a')).toHaveAttribute('href', '/journey');
    expect(galleryLinks[0].closest('a')).toHaveAttribute('href', '/gallery');
  });

  it('highlights the active link based on current route', () => {
    render(
      <MemoryRouter initialEntries={['/journey']}>
        <NavBar />
      </MemoryRouter>
    );

    const heroJourneyLinks = screen.getAllByText("HERO'S JOURNEY");
    // At least one link should have the active style
    expect(heroJourneyLinks.some(link => link.className.includes('text-amber-500'))).toBe(true);
  });

  it('highlights Flight Book link when on home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NavBar />
      </MemoryRouter>
    );

    const flightBookLinks = screen.getAllByText('FLIGHT BOOK & MAP');
    expect(flightBookLinks.some(link => link.className.includes('text-amber-500'))).toBe(true);
  });

  it('highlights Gallery link when on gallery route', () => {
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <NavBar />
      </MemoryRouter>
    );

    const galleryLinks = screen.getAllByText('GALLERY');
    expect(galleryLinks.some(link => link.className.includes('text-amber-500'))).toBe(true);
  });
});

describe('App Navigation', () => {
  it('shows loading screen initially', () => {
    render(<App />);
    
    // Loading screen should be visible
    expect(screen.getByText('Robin Glen')).toBeInTheDocument();
  });

  it('shows enter button after loading completes', async () => {
    render(<App />);
    
    // Wait for loading to complete (250ms timeout in App)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open logbook/i })).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('shows navigation bar after entering the app', async () => {
    render(<App />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open logbook/i })).toBeInTheDocument();
    }, { timeout: 1000 });

    // Click the enter button
    fireEvent.click(screen.getByRole('button', { name: /open logbook/i }));
    
    // Navigation should now be visible (both mobile and desktop versions)
    await waitFor(() => {
      expect(screen.getAllByText('FLIGHT BOOK & MAP').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("HERO'S JOURNEY").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('GALLERY').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('navigates to Hero Journey page when clicking the link', async () => {
    render(<App />);
    
    // Wait for loading and enter
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open logbook/i })).toBeInTheDocument();
    }, { timeout: 1000 });
    fireEvent.click(screen.getByRole('button', { name: /open logbook/i }));

    // Wait for navigation to be visible
    await waitFor(() => {
      expect(screen.getAllByText("HERO'S JOURNEY").length).toBeGreaterThanOrEqual(1);
    });

    // Click on Hero's Journey (get the first one)
    fireEvent.click(screen.getAllByText("HERO'S JOURNEY")[0]);

    // Should show Hero Journey content
    await waitFor(() => {
      expect(screen.getByText("The Hero's Journey")).toBeInTheDocument();
    });
  });

  it('navigates to Gallery page when clicking the link', async () => {
    render(<App />);
    
    // Wait for loading and enter
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open logbook/i })).toBeInTheDocument();
    }, { timeout: 1000 });
    fireEvent.click(screen.getByRole('button', { name: /open logbook/i }));

    // Wait for navigation to be visible
    await waitFor(() => {
      expect(screen.getAllByText('GALLERY').length).toBeGreaterThanOrEqual(1);
    });

    // Click on Gallery (get the first one)
    fireEvent.click(screen.getAllByText('GALLERY')[0]);

    // Should show Gallery content (grid layout)
    await waitFor(() => {
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  it('navigates back to Flight Book from other pages', async () => {
    render(<App />);
    
    // Wait for loading and enter
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open logbook/i })).toBeInTheDocument();
    }, { timeout: 1000 });
    fireEvent.click(screen.getByRole('button', { name: /open logbook/i }));

    // Go to Hero Journey
    await waitFor(() => {
      expect(screen.getAllByText("HERO'S JOURNEY").length).toBeGreaterThanOrEqual(1);
    });
    fireEvent.click(screen.getAllByText("HERO'S JOURNEY")[0]);

    // Then navigate back to Flight Book
    await waitFor(() => {
      expect(screen.getAllByText('FLIGHT BOOK & MAP').length).toBeGreaterThanOrEqual(1);
    });
    fireEvent.click(screen.getAllByText('FLIGHT BOOK & MAP')[0]);

    // Should be back on the main page with logbook (both mobile and desktop render the title)
    await waitFor(() => {
      expect(screen.getAllByText('RAF Flight Book').length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Route Handling', () => {
  const TestRoutes = () => (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/journey" element={<div>Journey Page</div>} />
      <Route path="/gallery" element={<div>Gallery Page</div>} />
      <Route path="*" element={<div>Not Found - Redirected</div>} />
    </Routes>
  );

  it('renders home page for root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders journey page for /journey route', () => {
    render(
      <MemoryRouter initialEntries={['/journey']}>
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Journey Page')).toBeInTheDocument();
  });

  it('renders gallery page for /gallery route', () => {
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Gallery Page')).toBeInTheDocument();
  });
});
