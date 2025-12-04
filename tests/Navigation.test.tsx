import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  useMap: () => ({
    setView: vi.fn(),
    getZoom: () => 5,
  }),
}));

describe('NavBar', () => {
  it('renders all navigation links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.getByText('FLIGHT BOOK & MAP')).toBeInTheDocument();
    expect(screen.getByText("HERO'S JOURNEY")).toBeInTheDocument();
    expect(screen.getByText('GALLERY')).toBeInTheDocument();
  });

  it('renders navigation links as actual links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const flightBookLink = screen.getByText('FLIGHT BOOK & MAP');
    const heroJourneyLink = screen.getByText("HERO'S JOURNEY");
    const galleryLink = screen.getByText('GALLERY');

    expect(flightBookLink.closest('a')).toHaveAttribute('href', '/');
    expect(heroJourneyLink.closest('a')).toHaveAttribute('href', '/journey');
    expect(galleryLink.closest('a')).toHaveAttribute('href', '/gallery');
  });

  it('highlights the active link based on current route', () => {
    render(
      <MemoryRouter initialEntries={['/journey']}>
        <NavBar />
      </MemoryRouter>
    );

    const heroJourneyLink = screen.getByText("HERO'S JOURNEY");
    expect(heroJourneyLink).toHaveClass('text-amber-500');
  });

  it('highlights Flight Book link when on home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NavBar />
      </MemoryRouter>
    );

    const flightBookLink = screen.getByText('FLIGHT BOOK & MAP');
    expect(flightBookLink).toHaveClass('text-amber-500');
  });

  it('highlights Gallery link when on gallery route', () => {
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <NavBar />
      </MemoryRouter>
    );

    const galleryLink = screen.getByText('GALLERY');
    expect(galleryLink).toHaveClass('text-amber-500');
  });
});

describe('App Navigation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading screen initially', () => {
    render(<App />);
    
    // Loading screen should be visible
    expect(screen.getByText('Robin Glen')).toBeInTheDocument();
    expect(screen.getByText(/preparing aircraft/i)).toBeInTheDocument();
  });

  it('shows enter button after loading completes', async () => {
    render(<App />);
    
    // Advance timers to complete loading
    vi.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open logbook/i })).toBeInTheDocument();
    });
  });

  it('shows navigation bar after entering the app', async () => {
    render(<App />);
    
    // Wait for loading to complete
    vi.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open logbook/i })).toBeInTheDocument();
    });

    // Click the enter button
    fireEvent.click(screen.getByRole('button', { name: /open logbook/i }));
    
    // Navigation should now be visible
    await waitFor(() => {
      expect(screen.getByText('FLIGHT BOOK & MAP')).toBeInTheDocument();
      expect(screen.getByText("HERO'S JOURNEY")).toBeInTheDocument();
      expect(screen.getByText('GALLERY')).toBeInTheDocument();
    });
  });

  it('navigates to Hero Journey page when clicking the link', async () => {
    render(<App />);
    
    // Complete loading and enter
    vi.advanceTimersByTime(300);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open logbook/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /open logbook/i }));

    // Wait for navigation to be visible
    await waitFor(() => {
      expect(screen.getByText("HERO'S JOURNEY")).toBeInTheDocument();
    });

    // Click on Hero's Journey
    fireEvent.click(screen.getByText("HERO'S JOURNEY"));

    // Should show Hero Journey content
    await waitFor(() => {
      expect(screen.getByText("The Hero's Journey")).toBeInTheDocument();
      expect(screen.getByText(/Flight Lieutenant Robin A. Glen/i)).toBeInTheDocument();
    });
  });

  it('navigates to Gallery page when clicking the link', async () => {
    render(<App />);
    
    // Complete loading and enter
    vi.advanceTimersByTime(300);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open logbook/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /open logbook/i }));

    // Wait for navigation to be visible
    await waitFor(() => {
      expect(screen.getByText('GALLERY')).toBeInTheDocument();
    });

    // Click on Gallery
    fireEvent.click(screen.getByText('GALLERY'));

    // Should show Gallery content (grid layout)
    await waitFor(() => {
      // Gallery uses a grid to display items
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  it('navigates back to Flight Book from other pages', async () => {
    render(<App />);
    
    // Complete loading and enter
    vi.advanceTimersByTime(300);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open logbook/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /open logbook/i }));

    // Go to Hero Journey
    await waitFor(() => {
      expect(screen.getByText("HERO'S JOURNEY")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("HERO'S JOURNEY"));

    // Then navigate back to Flight Book
    await waitFor(() => {
      expect(screen.getByText('FLIGHT BOOK & MAP')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('FLIGHT BOOK & MAP'));

    // Should be back on the main page with logbook
    await waitFor(() => {
      expect(screen.getByText('RAF Flight Book')).toBeInTheDocument();
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
