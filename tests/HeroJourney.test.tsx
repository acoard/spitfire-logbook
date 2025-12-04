import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroJourney } from '../components/HeroJourney';

// Mock flightData for LOCATIONS
vi.mock('../services/flightData', () => ({
  LOCATIONS: {
    APPLEDRAM: { lat: 50.817, lng: -0.817, name: 'RAF Appledram' },
    NORMANDY_BEACH: { lat: 49.369, lng: -0.871, name: 'Normandy Beach Head' },
    V1_SITE: { lat: 50.0, lng: 1.5, name: 'V1 Launch Site' },
    B10_PLUMETOT: { lat: 49.283, lng: -0.366, name: 'B.10 Plumetot' },
    CAEN: { lat: 49.182, lng: -0.370, name: 'Caen' },
    BRADWELL_BAY: { lat: 51.733, lng: 0.883, name: 'RAF Bradwell Bay' },
    HELIGOLAND: { lat: 54.180, lng: 7.890, name: 'Heligoland' },
    KARACHI: { lat: 24.860, lng: 67.001, name: 'Karachi' },
    CALCUTTA: { lat: 22.572, lng: 88.363, name: 'Calcutta' },
    RANCHI: { lat: 23.314, lng: 85.322, name: 'Ranchi' },
    ALLAHABAD: { lat: 25.435, lng: 81.846, name: 'Allahabad' },
    BANGKOK: { lat: 13.913, lng: 100.607, name: 'Bangkok' },
    KOHAT: { lat: 33.565, lng: 71.442, name: 'Kohat' },
    BOMBAY: { lat: 19.090, lng: 72.868, name: 'Bombay' },
  },
}));

const renderHeroJourney = () => {
  return render(
    <MemoryRouter>
      <HeroJourney />
    </MemoryRouter>
  );
};

describe('HeroJourney', () => {
  describe('hero section', () => {
    it('displays the main title', () => {
      renderHeroJourney();
      expect(screen.getByText("The Hero's Journey")).toBeInTheDocument();
    });

    it('displays the pilot name', () => {
      renderHeroJourney();
      expect(screen.getByText('Flight Lieutenant Robin A. Glen')).toBeInTheDocument();
    });

    it('displays RAF service years', () => {
      renderHeroJourney();
      expect(screen.getByText(/royal air force.*1940-1946/i)).toBeInTheDocument();
    });

    it('displays the hero stats', () => {
      renderHeroJourney();
      
      // Stats may appear multiple times, so use getAllByText
      expect(screen.getAllByText('6+').length).toBeGreaterThan(0);
      expect(screen.getAllByText('51+').length).toBeGreaterThan(0);
      expect(screen.getAllByText('697+').length).toBeGreaterThan(0);
      
      // The "3" appears multiple times, so verify it exists
      const threeElements = screen.getAllByText('3');
      expect(threeElements.length).toBeGreaterThan(0);

      expect(screen.getByText('YEARS')).toBeInTheDocument();
      expect(screen.getByText('MISSIONS')).toBeInTheDocument();
      expect(screen.getByText('HOURS')).toBeInTheDocument();
      expect(screen.getByText('CONTINENTS')).toBeInTheDocument();
    });

    it('renders the squadron insignia image', () => {
      renderHeroJourney();
      const insignia = screen.getByAltText('313 Squadron Insignia');
      expect(insignia).toBeInTheDocument();
      expect(insignia).toHaveAttribute('src', './robin-insignia.png');
    });
  });

  describe('chapter tabs', () => {
    it('displays all chapter tabs', () => {
      renderHeroJourney();

      // Chapter tabs show icon + title, find by partial text
      const buttons = screen.getAllByRole('button');
      const tabTexts = ['Training', 'Trial by Fire', 'Long Fight', 'Royal Recognition', 'Eastern Adventure', 'Return'];
      
      tabTexts.forEach(text => {
        const matchingButtons = buttons.filter(btn => btn.textContent?.includes(text));
        expect(matchingButtons.length).toBeGreaterThan(0);
      });
    });

    it('clicking a tab expands that chapter', async () => {
      renderHeroJourney();

      // Find and click the Training chapter tab (contains "Training" text)
      const buttons = screen.getAllByRole('button');
      const trainingTab = buttons.find(btn => 
        btn.textContent?.includes('Training') && 
        !btn.textContent?.includes('Forging') // Exclude the chapter card button
      );
      
      if (trainingTab) {
        fireEvent.click(trainingTab);
      }

      await waitFor(() => {
        expect(screen.getByText('The Stolen Logbook')).toBeInTheDocument();
      });
    });

    it('Trial by Fire (D-Day) chapter is expanded by default', () => {
      renderHeroJourney();

      // D-Day content should be visible by default
      expect(screen.getByText('Joining 313 Squadron')).toBeInTheDocument();
      expect(screen.getByText('D-Day: Beach Head Patrol')).toBeInTheDocument();
    });
  });

  describe('chapter cards', () => {
    it('displays chapter titles', () => {
      renderHeroJourney();

      // Chapter titles may appear multiple times (in tabs and cards)
      expect(screen.getAllByText('The Training').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Trial by Fire').length).toBeGreaterThan(0);
      expect(screen.getAllByText('The Long Fight').length).toBeGreaterThan(0);
    });

    it('displays chapter subtitles', () => {
      renderHeroJourney();

      expect(screen.getByText('Forging a Fighter Pilot')).toBeInTheDocument();
      expect(screen.getByText('D-Day and the Normandy Campaign')).toBeInTheDocument();
    });

    it('displays chapter date ranges', () => {
      renderHeroJourney();

      expect(screen.getByText('1940 - May 1944')).toBeInTheDocument();
      expect(screen.getByText('May 30 - June 1944')).toBeInTheDocument();
    });

    it('displays chapter stamps', () => {
      renderHeroJourney();

      expect(screen.getByText('QUALIFIED')).toBeInTheDocument();
      expect(screen.getByText('OPERATIONAL')).toBeInTheDocument();
      expect(screen.getByText('COMBAT')).toBeInTheDocument();
    });
  });

  describe('chapter expansion', () => {
    it('clicking a collapsed chapter expands it', async () => {
      renderHeroJourney();

      // The Training chapter card (click the header to expand)
      const trainingChapter = screen.getByText('Forging a Fighter Pilot').closest('button');
      fireEvent.click(trainingChapter!);

      await waitFor(() => {
        expect(screen.getByText('The Stolen Logbook')).toBeInTheDocument();
        expect(screen.getByText('Advanced Training at Tealing')).toBeInTheDocument();
      });
    });

    it('clicking an expanded chapter collapses it', async () => {
      renderHeroJourney();

      // D-Day chapter is expanded by default - find its toggle button
      const ddayHeader = screen.getByText('D-Day and the Normandy Campaign').closest('button');
      
      // Verify it's expanded
      expect(screen.getByText('Joining 313 Squadron')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(ddayHeader!);

      // Wait for collapse animation
      await waitFor(() => {
        // The content should still be in DOM but hidden via max-height: 0
        const momentsContainer = document.querySelector('.max-h-0');
        expect(momentsContainer).toBeInTheDocument();
      });
    });
  });

  describe('moment cards (when expanded)', () => {
    it('displays moment titles in expanded chapter', () => {
      renderHeroJourney();

      // D-Day chapter is expanded by default
      expect(screen.getByText('Joining 313 Squadron')).toBeInTheDocument();
      expect(screen.getByText('The Invasion Fleet')).toBeInTheDocument();
      expect(screen.getByText('D-Day: Beach Head Patrol')).toBeInTheDocument();
    });

    it('displays moment dates', () => {
      renderHeroJourney();

      expect(screen.getByText('May 30, 1944')).toBeInTheDocument();
      expect(screen.getByText('June 6, 1944')).toBeInTheDocument();
    });

    it('displays KEY MOMENT badge for milestone moments', () => {
      renderHeroJourney();

      const keyMomentBadges = screen.getAllByText('KEY MOMENT');
      expect(keyMomentBadges.length).toBeGreaterThan(0);
    });

    it('displays quotes from the pilot', () => {
      renderHeroJourney();

      // Look for part of the D-Day quote in the expanded chapter
      expect(screen.getByText(/pilot's wings for 30 months/i)).toBeInTheDocument();
    });

    it('displays location labels for moments with locations', () => {
      renderHeroJourney();

      expect(screen.getByText('Appledram, Sussex')).toBeInTheDocument();
      expect(screen.getByText('English Channel')).toBeInTheDocument();
    });

    it('displays stats for moments that have them', () => {
      renderHeroJourney();

      // D-Day mission stats - look for the stat labels
      const missionDuration = screen.getAllByText(/Mission Duration/i);
      expect(missionDuration.length).toBeGreaterThan(0);
      
      // Duration value
      const twoHours = screen.getAllByText(/2 hours/i);
      expect(twoHours.length).toBeGreaterThan(0);
    });
  });

  describe('View Entry buttons', () => {
    it('displays View Entry buttons for moments with logbook entry IDs', () => {
      renderHeroJourney();

      const viewEntryButtons = screen.getAllByRole('button', { name: /view entry/i });
      expect(viewEntryButtons.length).toBeGreaterThan(0);
    });
  });

  describe('footer', () => {
    it('displays the final quote', () => {
      renderHeroJourney();

      // The footer quote mentions Durham Castle - use getAllByText since it may appear multiple times
      const quotes = screen.getAllByText(/Durham Castle/i);
      expect(quotes.length).toBeGreaterThan(0);
    });

    it('displays SERVICE COMPLETE stamp', () => {
      renderHeroJourney();

      expect(screen.getByText('SERVICE COMPLETE')).toBeInTheDocument();
    });

    it('attributes the quote to Robin Glen', () => {
      renderHeroJourney();

      expect(screen.getByText(/robin glen's final logbook entry/i)).toBeInTheDocument();
    });
  });

  describe('scrolling behavior', () => {
    it('chapter tabs container is sticky for navigation', () => {
      renderHeroJourney();

      const stickyContainer = document.querySelector('.sticky.top-0');
      expect(stickyContainer).toBeInTheDocument();
    });
  });

  describe('navigation from moments', () => {
    it('location buttons are clickable when coordinates exist', () => {
      renderHeroJourney();

      // Find a location button - Appledram has coordinates
      const locationButton = screen.getByText('Appledram, Sussex').closest('button');
      expect(locationButton).not.toBeDisabled();
      expect(locationButton).toHaveClass('cursor-pointer');
    });

    it('location without coordinates shows as disabled', () => {
      renderHeroJourney();

      // English Channel doesn't have coordinates in the mock
      const locationButton = screen.getByText('English Channel').closest('button');
      expect(locationButton).toHaveClass('cursor-default');
    });
  });

  describe('responsive design classes', () => {
    it('has responsive padding classes', () => {
      renderHeroJourney();

      const container = document.querySelector('.max-w-4xl');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('p-4', 'sm:p-6', 'md:p-8');
    });

    it('chapter tabs are horizontally scrollable', () => {
      renderHeroJourney();

      const tabsContainer = document.querySelector('.overflow-x-auto');
      expect(tabsContainer).toBeInTheDocument();
    });
  });
});
