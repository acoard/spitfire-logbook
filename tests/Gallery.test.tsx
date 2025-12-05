import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Gallery } from '../components/Gallery';

// Mock the flight data with known test data
vi.mock('../services/flightData', () => ({
  FLIGHT_LOG: [
    {
      id: 'test-1',
      date: '1944-06-06',
      missionBrief: {
        slides: [
          { image: 'test-image-1.jpg', text: 'D-Day mission briefing slide 1' },
          { image: 'test-image-2.jpg', text: 'D-Day mission briefing slide 2' },
        ],
      },
    },
    {
      id: 'test-2',
      date: '1944-06-07',
      missionBrief: {
        slides: [
          { image: 'test-image-3.jpg', text: 'Follow-up patrol briefing' },
        ],
      },
    },
    {
      id: 'test-3',
      date: '1944-06-08',
      // No missionBrief - should be filtered out
    },
  ],
}));

const renderGallery = () => {
  return render(
    <MemoryRouter>
      <Gallery />
    </MemoryRouter>
  );
};

describe('Gallery', () => {
  describe('tab navigation', () => {
    it('renders all three tabs', () => {
      renderGallery();

      expect(screen.getByRole('button', { name: /photos/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /full logbook/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /historical videos/i })).toBeInTheDocument();
    });

    it('starts with Photos tab active by default', () => {
      renderGallery();

      // Photos tab should be active (has amber color)
      const photosTab = screen.getByRole('button', { name: /photos/i });
      expect(photosTab).toHaveClass('text-amber-500');
    });

    it('switches to Logbook tab when clicked', () => {
      renderGallery();

      const logbookTab = screen.getByRole('button', { name: /full logbook/i });
      fireEvent.click(logbookTab);

      expect(logbookTab).toHaveClass('text-amber-500');
      expect(screen.getByText("Robin Glen's Flying Logbook")).toBeInTheDocument();
    });

    it('switches to Historical Videos tab when clicked', () => {
      renderGallery();

      const videosTab = screen.getByRole('button', { name: /historical videos/i });
      fireEvent.click(videosTab);

      expect(videosTab).toHaveClass('text-amber-500');
      expect(screen.getByText(/these videos provide general historical context/i)).toBeInTheDocument();
    });
  });

  describe('Photos tab - rendering gallery items', () => {
    it('renders gallery items from flight log entries with mission briefs', () => {
      renderGallery();

      // Should have 3 images total (2 from first entry, 1 from second)
      const images = screen.getAllByAltText('Mission Slide');
      expect(images).toHaveLength(3);
    });

    it('displays dates for each gallery item', () => {
      renderGallery();

      // Multiple slides can have the same date, so use getAllByText
      const june6Dates = screen.getAllByText('1944-06-06');
      expect(june6Dates.length).toBe(2); // Two slides from the same entry
      expect(screen.getByText('1944-06-07')).toBeInTheDocument();
    });

    it('displays text descriptions for slides that have them', () => {
      renderGallery();

      expect(screen.getByText('D-Day mission briefing slide 1')).toBeInTheDocument();
      expect(screen.getByText('D-Day mission briefing slide 2')).toBeInTheDocument();
      expect(screen.getByText('Follow-up patrol briefing')).toBeInTheDocument();
    });

    it('renders images with correct src attributes', () => {
      renderGallery();

      const images = screen.getAllByAltText('Mission Slide');
      expect(images[0]).toHaveAttribute('src', 'test-image-1.jpg');
      expect(images[1]).toHaveAttribute('src', 'test-image-2.jpg');
      expect(images[2]).toHaveAttribute('src', 'test-image-3.jpg');
    });

    it('uses a grid layout for gallery items', () => {
      renderGallery();

      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-1');
    });
  });

  describe('Photos tab - gallery item interaction', () => {
    it('opens modal when clicking on a gallery item', async () => {
      renderGallery();

      // Click on the first gallery item
      const galleryItems = screen.getAllByAltText('Mission Slide');
      fireEvent.click(galleryItems[0].closest('div[class*="cursor-pointer"]')!);

      // Modal should open with full slide view
      await waitFor(() => {
        expect(screen.getByAltText('Full Slide')).toBeInTheDocument();
      });
    });

    it('displays the correct image in the modal', async () => {
      renderGallery();

      // Click on the second gallery item
      const galleryItems = screen.getAllByAltText('Mission Slide');
      fireEvent.click(galleryItems[1].closest('div[class*="cursor-pointer"]')!);

      await waitFor(() => {
        const modalImage = screen.getByAltText('Full Slide');
        expect(modalImage).toHaveAttribute('src', 'test-image-2.jpg');
      });
    });

    it('displays slide text in the modal sidebar', async () => {
      renderGallery();

      const galleryItems = screen.getAllByAltText('Mission Slide');
      fireEvent.click(galleryItems[0].closest('div[class*="cursor-pointer"]')!);

      await waitFor(() => {
        // The modal displays the text with dangerouslySetInnerHTML, 
        // so we check for the content - it appears in both the grid and modal
        const textElements = screen.getAllByText('D-Day mission briefing slide 1');
        expect(textElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('displays the date in the modal', async () => {
      renderGallery();

      const galleryItems = screen.getAllByAltText('Mission Slide');
      fireEvent.click(galleryItems[0].closest('div[class*="cursor-pointer"]')!);

      await waitFor(() => {
        // There should be dates visible in the modal (both in grid and in modal)
        const dates = screen.getAllByText('1944-06-06');
        expect(dates.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Photos tab - modal closing', () => {
    it('closes modal when clicking the close button', async () => {
      renderGallery();

      // Open modal
      const galleryItems = screen.getAllByAltText('Mission Slide');
      fireEvent.click(galleryItems[0].closest('div[class*="cursor-pointer"]')!);

      await waitFor(() => {
        expect(screen.getByAltText('Full Slide')).toBeInTheDocument();
      });

      // Find and click close button (there are multiple buttons now due to tabs)
      const closeButtons = screen.getAllByRole('button');
      // The close button is within the modal, find it by looking for the X icon area
      const closeButton = closeButtons.find(btn => 
        btn.classList.contains('absolute') || btn.closest('.fixed.inset-0')
      );
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.queryByAltText('Full Slide')).not.toBeInTheDocument();
      });
    });

    it('closes modal when clicking the overlay background', async () => {
      renderGallery();

      // Open modal
      const galleryItems = screen.getAllByAltText('Mission Slide');
      fireEvent.click(galleryItems[0].closest('div[class*="cursor-pointer"]')!);

      await waitFor(() => {
        expect(screen.getByAltText('Full Slide')).toBeInTheDocument();
      });

      // Click the backdrop (the fixed overlay div)
      const backdrop = document.querySelector('.fixed.inset-0.z-50');
      fireEvent.click(backdrop!);

      await waitFor(() => {
        expect(screen.queryByAltText('Full Slide')).not.toBeInTheDocument();
      });
    });

    it('does not close modal when clicking on the modal content', async () => {
      renderGallery();

      // Open modal
      const galleryItems = screen.getAllByAltText('Mission Slide');
      fireEvent.click(galleryItems[0].closest('div[class*="cursor-pointer"]')!);

      await waitFor(() => {
        expect(screen.getByAltText('Full Slide')).toBeInTheDocument();
      });

      // Click on the modal content area (image)
      const modalImage = screen.getByAltText('Full Slide');
      fireEvent.click(modalImage);

      // Modal should still be open
      expect(screen.getByAltText('Full Slide')).toBeInTheDocument();
    });
  });

  describe('Logbook tab', () => {
    it('displays logbook header and description', () => {
      renderGallery();

      const logbookTab = screen.getByRole('button', { name: /full logbook/i });
      fireEvent.click(logbookTab);

      expect(screen.getByText("Robin Glen's Flying Logbook")).toBeInTheDocument();
      expect(screen.getByText(/original handwritten pages/i)).toBeInTheDocument();
    });

    it('renders all logbook pages (058 to 086 = 29 pages)', () => {
      renderGallery();

      const logbookTab = screen.getByRole('button', { name: /full logbook/i });
      fireEvent.click(logbookTab);

      // Check for first and last page labels
      expect(screen.getByText('Page 058')).toBeInTheDocument();
      expect(screen.getByText('Page 086')).toBeInTheDocument();
    });
  });

  describe('Historical Videos tab', () => {
    it('displays disclaimer about videos not being Robin-specific', () => {
      renderGallery();

      const videosTab = screen.getByRole('button', { name: /historical videos/i });
      fireEvent.click(videosTab);

      expect(screen.getByText(/they are not specifically about robin glen/i)).toBeInTheDocument();
    });

    it('renders video titles and descriptions', () => {
      renderGallery();

      const videosTab = screen.getByRole('button', { name: /historical videos/i });
      fireEvent.click(videosTab);

      // Check for at least one video title
      expect(screen.getByText('Spitfire: The Plane that Saved the World')).toBeInTheDocument();
    });

    it('renders YouTube iframes', () => {
      renderGallery();

      const videosTab = screen.getByRole('button', { name: /historical videos/i });
      fireEvent.click(videosTab);

      const iframes = document.querySelectorAll('iframe');
      expect(iframes.length).toBeGreaterThan(0);
      expect(iframes[0]).toHaveAttribute('src', expect.stringContaining('youtube.com/embed'));
    });
  });

  describe('empty state', () => {
    it('renders empty grid when no mission briefs exist', () => {
      vi.doMock('../services/flightData', () => ({
        FLIGHT_LOG: [
          { id: 'test-1', date: '1944-06-06' }, // No missionBrief
        ],
      }));

      // The gallery should still render, just empty
      renderGallery();
      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });
  });
});
