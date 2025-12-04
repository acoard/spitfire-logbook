import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from './test-utils';
import LoadingScreen from '../components/LoadingScreen';

describe('LoadingScreen', () => {
  describe('when assets are loading', () => {
    it('displays the loading indicator', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={false} onEnter={onEnter} />);

      expect(screen.getByText(/preparing aircraft/i)).toBeInTheDocument();
    });

    it('does not show the enter button while loading', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={false} onEnter={onEnter} />);

      expect(screen.queryByRole('button', { name: /open logbook/i })).not.toBeInTheDocument();
    });

    it('displays the pilot name "Robin Glen"', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={false} onEnter={onEnter} />);

      expect(screen.getByText('Robin Glen')).toBeInTheDocument();
    });

    it('displays "Royal Air Force" header', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={false} onEnter={onEnter} />);

      expect(screen.getByText('Royal Air Force')).toBeInTheDocument();
    });

    it('displays the date range 1944 - 1945', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={false} onEnter={onEnter} />);

      expect(screen.getByText('1944 - 1945')).toBeInTheDocument();
    });

    it('displays the logbook title', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={false} onEnter={onEnter} />);

      expect(screen.getByText("Pilot's Flying Log Book")).toBeInTheDocument();
    });
  });

  describe('when assets are loaded', () => {
    it('shows the "OPEN LOGBOOK" button', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={true} onEnter={onEnter} />);

      const button = screen.getByRole('button', { name: /open logbook/i });
      expect(button).toBeInTheDocument();
    });

    it('does not show loading text when loaded', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={true} onEnter={onEnter} />);

      expect(screen.queryByText(/preparing aircraft/i)).not.toBeInTheDocument();
    });

    it('calls onEnter when button is clicked', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={true} onEnter={onEnter} />);

      const button = screen.getByRole('button', { name: /open logbook/i });
      fireEvent.click(button);

      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it('displays a cleared for takeoff message when loaded', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={true} onEnter={onEnter} />);

      // The handwritten note changes based on loaded state
      expect(screen.getByText(/"cleared for takeoff\."/i)).toBeInTheDocument();
    });
  });

  describe('images', () => {
    it('renders the Spitfire image with proper alt text', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={true} onEnter={onEnter} />);

      const spitfireImg = screen.getByAltText('Spitfire Sketch');
      expect(spitfireImg).toBeInTheDocument();
      expect(spitfireImg).toHaveAttribute('src', 'Spitfire-MkIX.jpg');
    });

    it('renders the pilot photo with proper alt text', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={true} onEnter={onEnter} />);

      const pilotImg = screen.getByAltText('Pilot');
      expect(pilotImg).toBeInTheDocument();
      expect(pilotImg).toHaveAttribute('src', 'standing-by-spitfire.png');
    });
  });

  describe('construction notice', () => {
    it('displays the under construction notice', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={true} onEnter={onEnter} />);

      expect(screen.getByText(/under active construction/i)).toBeInTheDocument();
    });
  });

  describe('quote section', () => {
    it('displays the D-Day quote from Robin Glen', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={true} onEnter={onEnter} />);

      // Check for part of the quote
      expect(screen.getByText(/30 months elapsed/i)).toBeInTheDocument();
    });

    it('has the D-Day signature', () => {
      const onEnter = vi.fn();
      render(<LoadingScreen isLoaded={true} onEnter={onEnter} />);

      expect(screen.getByText('Robin Glen, D-Day')).toBeInTheDocument();
    });
  });
});
