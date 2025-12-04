import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LogbookPanel from '../components/LogbookPanel';
import { Phase, AircraftCategory, LogEntry } from '../types';

const createMockEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  id: 'test-1',
  date: '1944-06-06',
  phase: Phase.COMBAT,
  aircraftType: 'Spitfire IX',
  aircraftCategory: AircraftCategory.FIGHTER,
  duty: 'Beach Head Patrol',
  time: '2:00',
  remarks: 'D-Day operations over Normandy',
  origin: { lat: 50.817, lng: -0.817, name: 'RAF Appledram' },
  isSignificant: true,
  historicalNote: 'First combat mission on D-Day',
  ...overrides,
});

const mockEntries: LogEntry[] = [
  createMockEntry({ id: '1', date: '1944-06-06', phase: Phase.COMBAT, isSignificant: true }),
  createMockEntry({ id: '2', date: '1944-06-07', phase: Phase.COMBAT, duty: 'Convoy Patrol', isSignificant: false, historicalNote: undefined }),
  createMockEntry({ id: '3', date: '1944-05-01', phase: Phase.TRAINING, aircraftType: 'Master II', duty: 'Formation Flying', isSignificant: false, historicalNote: undefined }),
  createMockEntry({ id: '4', date: '1945-08-01', phase: Phase.FERRY, aircraftType: 'Spitfire XIV', duty: 'Ferry to Karachi', isSignificant: false, historicalNote: undefined }),
];

const defaultProps = {
  entries: mockEntries,
  selectedId: null,
  onSelect: vi.fn(),
  filterPhase: 'ALL' as Phase | 'ALL',
  setFilterPhase: vi.fn(),
  onOpenProfile: vi.fn(),
  showSignificantOnly: false,
  setShowSignificantOnly: vi.fn(),
};

const renderLogbookPanel = (props = {}) => {
  return render(
    <MemoryRouter>
      <LogbookPanel {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

describe('LogbookPanel', () => {
  describe('header rendering', () => {
    it('displays the RAF Flight Book title', () => {
      renderLogbookPanel();
      expect(screen.getByText('RAF Flight Book')).toBeInTheDocument();
    });

    it('displays the squadron name', () => {
      renderLogbookPanel();
      expect(screen.getByText('313 Czech Squadron')).toBeInTheDocument();
    });

    it('displays the pilot name', () => {
      renderLogbookPanel();
      expect(screen.getByText('Robin Glen')).toBeInTheDocument();
    });

    it('renders the View Service Record button', () => {
      renderLogbookPanel();
      expect(screen.getByText('View Service Record')).toBeInTheDocument();
    });

    it('calls onOpenProfile when View Service Record is clicked', () => {
      const onOpenProfile = vi.fn();
      renderLogbookPanel({ onOpenProfile });

      fireEvent.click(screen.getByText('View Service Record'));
      expect(onOpenProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('phase filter tabs', () => {
    it('renders all phase filter tabs', () => {
      renderLogbookPanel();

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /training/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ops/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /post-war ferry/i })).toBeInTheDocument();
    });

    it('highlights the active filter tab', () => {
      renderLogbookPanel({ filterPhase: Phase.COMBAT });

      const opsButton = screen.getByRole('button', { name: /ops/i });
      expect(opsButton).toHaveClass('text-amber-500');
    });

    it('calls setFilterPhase when clicking a filter tab', () => {
      const setFilterPhase = vi.fn();
      renderLogbookPanel({ setFilterPhase });

      fireEvent.click(screen.getByRole('button', { name: /training/i }));
      expect(setFilterPhase).toHaveBeenCalledWith(Phase.TRAINING);
    });

    it('calls setFilterPhase with ALL when clicking All tab', () => {
      const setFilterPhase = vi.fn();
      renderLogbookPanel({ setFilterPhase, filterPhase: Phase.COMBAT });

      fireEvent.click(screen.getByRole('button', { name: /all/i }));
      expect(setFilterPhase).toHaveBeenCalledWith('ALL');
    });
  });

  describe('significant only checkbox', () => {
    it('renders the exclude routine operations checkbox', () => {
      renderLogbookPanel();

      expect(screen.getByLabelText(/exclude routine operations/i)).toBeInTheDocument();
    });

    it('checkbox reflects showSignificantOnly state', () => {
      renderLogbookPanel({ showSignificantOnly: true });

      const checkbox = screen.getByLabelText(/exclude routine operations/i);
      expect(checkbox).toBeChecked();
    });

    it('calls setShowSignificantOnly when checkbox is toggled', () => {
      const setShowSignificantOnly = vi.fn();
      renderLogbookPanel({ setShowSignificantOnly });

      const checkbox = screen.getByLabelText(/exclude routine operations/i);
      fireEvent.click(checkbox);
      expect(setShowSignificantOnly).toHaveBeenCalledWith(true);
    });
  });

  describe('table rendering', () => {
    it('renders table headers', () => {
      renderLogbookPanel();

      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Aircraft')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Duty & Remarks')).toBeInTheDocument();
    });

    it('renders all entries in the table', () => {
      renderLogbookPanel();

      expect(screen.getByText('1944-06-06')).toBeInTheDocument();
      expect(screen.getByText('1944-06-07')).toBeInTheDocument();
      expect(screen.getByText('1944-05-01')).toBeInTheDocument();
      expect(screen.getByText('1945-08-01')).toBeInTheDocument();
    });

    it('displays aircraft types for each entry', () => {
      renderLogbookPanel();

      expect(screen.getAllByText('Spitfire IX').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Master II')).toBeInTheDocument();
      expect(screen.getByText('Spitfire XIV')).toBeInTheDocument();
    });

    it('displays duty descriptions', () => {
      renderLogbookPanel();

      expect(screen.getByText('Beach Head Patrol')).toBeInTheDocument();
      expect(screen.getByText('Convoy Patrol')).toBeInTheDocument();
      expect(screen.getByText('Formation Flying')).toBeInTheDocument();
      expect(screen.getByText('Ferry to Karachi')).toBeInTheDocument();
    });

    it('displays flight times', () => {
      renderLogbookPanel();

      expect(screen.getAllByText('2:00').length).toBe(4);
    });
  });

  describe('entry selection', () => {
    it('calls onSelect when clicking an entry row', () => {
      const onSelect = vi.fn();
      renderLogbookPanel({ onSelect });

      // Click on a row (find by date text and click its row)
      const row = screen.getByText('1944-06-06').closest('tr');
      fireEvent.click(row!);

      expect(onSelect).toHaveBeenCalledWith(mockEntries[0]);
    });

    it('highlights the selected entry row', () => {
      renderLogbookPanel({ selectedId: '1' });

      const selectedRow = screen.getByText('1944-06-06').closest('tr');
      expect(selectedRow).toHaveClass('bg-amber-100/60');
    });

    it('shows selection indicator bar on selected entry', () => {
      renderLogbookPanel({ selectedId: '1' });

      // The selection bar is a div with bg-amber-600
      const selectionBar = document.querySelector('.bg-amber-600');
      expect(selectionBar).toBeInTheDocument();
    });
  });

  describe('D-Day special styling', () => {
    it('applies special styling to D-Day entries', () => {
      renderLogbookPanel();

      const ddayRow = screen.getByText('1944-06-06').closest('tr');
      expect(ddayRow).toHaveClass('bg-red-50/50');
    });

    it('shows Overlord stamp on D-Day entries', () => {
      renderLogbookPanel();

      expect(screen.getByText('Overlord')).toBeInTheDocument();
    });
  });

  describe('historical notes indicator', () => {
    it('shows "See Notes" indicator for entries with historical notes', () => {
      renderLogbookPanel();

      expect(screen.getByText('See Notes')).toBeInTheDocument();
    });

    it('shows paperclip icon for entries with historical notes when not selected', () => {
      renderLogbookPanel({ selectedId: '2' }); // Select a different entry

      // The entry with id '1' has a historical note
      const paperclipIcons = document.querySelectorAll('[aria-label="View Notes"]');
      expect(paperclipIcons.length).toBeGreaterThan(0);
    });
  });

  describe('empty state', () => {
    it('displays empty message when no entries match filter', () => {
      renderLogbookPanel({ entries: [], showSignificantOnly: true });

      expect(screen.getByText('No significant events in this phase.')).toBeInTheDocument();
    });

    it('displays different message for non-significant filter', () => {
      renderLogbookPanel({ entries: [], showSignificantOnly: false });

      expect(screen.getByText('No entries recorded for this period.')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('table rows are clickable (have cursor-pointer class)', () => {
      renderLogbookPanel();

      const rows = document.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).toHaveClass('cursor-pointer');
      });
    });
  });
});
