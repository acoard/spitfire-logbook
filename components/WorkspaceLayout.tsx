import React, {
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react';
import { ArrowLeftRight, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import LogbookPanel from './LogbookPanel';
import ContextPanel from './ContextPanel';
import MapPanel from './MapPanel';
import { LogEntry, Phase } from '../types';

const MIN_SIDE = 0;
const MAX_SIDE = 4000;
const MIN_RATIO = 0.3;
const MAX_RATIO = 1;
const DRAG_HANDLE_WIDTH = 32; // corresponds to w-8

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return;
    }
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    setMatches(mediaQuery.matches);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
};

type PresetConfig = {
  ratio?: number;
  side?: number;
  sideFraction?: number;
};

const layoutPresets: Record<'balanced' | 'logbook' | 'map', PresetConfig> = {
  balanced: { side: 560, ratio: 0.64 },
  logbook: { sideFraction: 1 },
  map: { sideFraction: 0, ratio: 0.3 }
};

type PresetKey = keyof typeof layoutPresets;
type LayoutPreset = PresetKey | 'custom';

const layoutMenuOptions: Array<{ key: PresetKey; label: string; helper: string }> = [
  { key: 'logbook', label: 'Focus Logbook', helper: 'Prioritize entries' },
  { key: 'map', label: 'Focus Map', helper: 'Mission-first' },
  { key: 'balanced', label: 'Focus Balanced', helper: 'Reset split' }
];

interface WorkspaceLayoutProps {
  entries: LogEntry[];
  selectedEntry: LogEntry | null;
  selectedId: string | null;
  filterPhase: Phase | 'ALL';
  setFilterPhase: (phase: Phase | 'ALL') => void;
  onLogbookSelect: (entry: LogEntry) => void;
  onMarkerSelect: (entry: LogEntry) => void;
  shouldCenterMap: boolean;
  onOpenProfile: () => void;
  showSignificantOnly: boolean;
  setShowSignificantOnly: (show: boolean) => void;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  entries,
  selectedEntry,
  selectedId,
  filterPhase,
  setFilterPhase,
  onLogbookSelect,
  onMarkerSelect,
  shouldCenterMap,
  onOpenProfile,
  showSignificantOnly,
  setShowSignificantOnly
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [sidePanelWidth, setSidePanelWidth] = useState(layoutPresets.balanced.side ?? 0);
  const [logbookHeightRatio, setLogbookHeightRatio] = useState(layoutPresets.balanced.ratio);
  const [activePreset, setActivePreset] = useState<LayoutPreset>('balanced');
  const [isDraggingSide, setIsDraggingSide] = useState(false);
  const [isDraggingStack, setIsDraggingStack] = useState(false);
  const [isMobileContextOpen, setIsMobileContextOpen] = useState(false);
  const [isMobileLogbookOpen, setIsMobileLogbookOpen] = useState(true);
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(true);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const layoutShellRef = useRef<HTMLDivElement>(null);
  const layoutMenuRef = useRef<HTMLDivElement>(null);
  const layoutMenuButtonRef = useRef<HTMLButtonElement>(null);
  const horizontalDragData = useRef({
    startX: 0,
    initialWidth: layoutPresets.balanced.side ?? 0,
    maxWidth: MAX_SIDE
  });
  const verticalDragData = useRef({
    startY: 0,
    initialRatio: layoutPresets.balanced.ratio,
    containerHeight: 1
  });

  const mobileContextPanelId = 'mobile-context-panel';
  const mobileLogbookPanelId = 'mobile-logbook-panel';
  const mobileMapPanelId = 'mobile-map-panel';

  useEffect(() => {
    if (selectedId) {
      setIsMobileContextOpen(true);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!isLayoutMenuOpen) return;
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        layoutMenuRef.current?.contains(target) ||
        layoutMenuButtonRef.current?.contains(target)
      ) {
        return;
      }
      setIsLayoutMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLayoutMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointer);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isLayoutMenuOpen]);

  useEffect(() => {
    if (isDraggingSide || isDraggingStack) {
      document.body.style.cursor = isDraggingSide ? 'col-resize' : 'row-resize';
    } else {
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.cursor = '';
    };
  }, [isDraggingSide, isDraggingStack]);

  const getMaxSideWidth = useCallback(() => {
    const containerWidth =
      layoutShellRef.current?.getBoundingClientRect().width ??
      (typeof window !== 'undefined' ? window.innerWidth : MAX_SIDE);
    const maxByContainer = Math.max(0, containerWidth - DRAG_HANDLE_WIDTH);
    return clamp(maxByContainer, MIN_SIDE, MAX_SIDE);
  }, []);

  useEffect(() => {
    if (!isDraggingSide) return;
    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientX - horizontalDragData.current.startX;
      const maxWidth = Math.max(MIN_SIDE, horizontalDragData.current.maxWidth);
      const newWidth = clamp(horizontalDragData.current.initialWidth + delta, MIN_SIDE, maxWidth);
      setSidePanelWidth(newWidth);
    };
    const handleMouseUp = () => setIsDraggingSide(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSide]);

  useEffect(() => {
    if (!isDraggingStack) return;
    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientY - verticalDragData.current.startY;
      const deltaRatio = delta / verticalDragData.current.containerHeight;
      const nextRatio = clamp(verticalDragData.current.initialRatio + deltaRatio, MIN_RATIO, MAX_RATIO);
      setLogbookHeightRatio(nextRatio);
    };
    const handleMouseUp = () => setIsDraggingStack(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingStack]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setSidePanelWidth((prev) => clamp(prev, MIN_SIDE, getMaxSideWidth()));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [getMaxSideWidth, isDesktop]);

  const handlePresetApply = (preset: PresetKey) => {
    const config = layoutPresets[preset];
    const maxWidth = getMaxSideWidth();
    const targetWidth =
      typeof config.sideFraction === 'number'
        ? config.sideFraction * maxWidth
        : clamp(config.side ?? maxWidth, MIN_SIDE, maxWidth);
    setSidePanelWidth(targetWidth);
    if (config.ratio !== undefined) {
      setLogbookHeightRatio(config.ratio);
    }
    setActivePreset(preset);
  };

  const handleLayoutReset = () => handlePresetApply('balanced');

  const handleMenuSelect = (preset: PresetKey) => {
    handlePresetApply(preset);
    setIsLayoutMenuOpen(false);
  };

  const handleHorizontalDragStart = (event: React.MouseEvent) => {
    event.preventDefault();
    setActivePreset('custom');
    setIsLayoutMenuOpen(false);
    const maxWidth = getMaxSideWidth();
    horizontalDragData.current = {
      startX: event.clientX,
      initialWidth: sidePanelWidth,
      maxWidth
    };
    setIsDraggingSide(true);
  };

  const handleVerticalDragStart = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!leftPanelRef.current) return;
    const bounds = leftPanelRef.current.getBoundingClientRect();
    verticalDragData.current = {
      startY: event.clientY,
      initialRatio: logbookHeightRatio,
      containerHeight: bounds.height || 1
    };
    setActivePreset('custom');
    setIsLayoutMenuOpen(false);
    setIsDraggingStack(true);
  };

  const desktopLayout = (
    <div ref={layoutShellRef} className="flex flex-1 overflow-hidden bg-stone-900/30">
      <div
        ref={leftPanelRef}
        className="flex flex-col h-full bg-[#f4f1ea] shadow-[10px_0_30px_rgba(0,0,0,0.25)] border-r-8 border-stone-900 transition-[width] duration-300 ease-out"
        style={{
          width: `${sidePanelWidth}px`,
          minWidth: 0,
          flexBasis: `${sidePanelWidth}px`
        }}
      >
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            flexBasis: `${logbookHeightRatio * 100}%`,
            minHeight: '240px',
            transition: isDraggingStack ? 'none' : 'flex-basis 250ms ease'
          }}
        >
          <LogbookPanel
            entries={entries}
            selectedId={selectedId}
            onSelect={onLogbookSelect}
            filterPhase={filterPhase}
            setFilterPhase={setFilterPhase}
            onOpenProfile={onOpenProfile}
            showSignificantOnly={showSignificantOnly}
            setShowSignificantOnly={setShowSignificantOnly}
          />
        </div>

        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize logbook and context panels"
          onMouseDown={handleVerticalDragStart}
          onDoubleClick={() => {
            setLogbookHeightRatio(layoutPresets.balanced.ratio);
            setActivePreset('custom');
          }}
          className={`flex items-center justify-center h-6 cursor-row-resize border-y border-stone-900/70 bg-stone-900/70 text-stone-200 transition-colors ${
            isDraggingStack ? 'bg-amber-500/60 text-stone-900' : 'hover:bg-amber-500/30 hover:text-stone-900'
          }`}
          title="Drag to adjust the logbook/context split"
        >
          <ArrowUpDown className="w-4 h-4" />
        </div>

        <div
          className="relative overflow-hidden flex-shrink-0 flex-1"
          style={{
            flexBasis: `${(1 - logbookHeightRatio) * 100}%`,
            minHeight: '200px',
            transition: isDraggingStack ? 'none' : 'flex-basis 250ms ease'
          }}
        >
          <ContextPanel selectedEntry={selectedEntry} />
        </div>
      </div>

      <div className="relative h-full">
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize map panel"
          onMouseDown={handleHorizontalDragStart}
          onDoubleClick={handleLayoutReset}
          className={`relative flex flex-col items-center justify-center gap-4 px-2 py-4 w-8 max-w-8 h-full cursor-col-resize bg-stone-900/80 text-stone-200 transition-colors ${
            isDraggingSide ? 'bg-amber-500/60 text-stone-900' : 'hover:bg-amber-500/30 hover:text-stone-900'
          }`}
          title="Drag to adjust map width"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <button
            type="button"
            ref={layoutMenuButtonRef}
            aria-haspopup="menu"
            aria-expanded={isLayoutMenuOpen}
            aria-controls="layout-menu"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setIsLayoutMenuOpen((prev) => !prev);
            }}
            className="flex items-center justify-center w-6 h-6 rounded-full border border-current text-xs leading-none font-mono hover:bg-amber-500/20"
            title="Layout presets"
          >
            ...
          </button>
        </div>

        {isLayoutMenuOpen && (
          <div
            id="layout-menu"
            ref={layoutMenuRef}
            role="menu"
            className="absolute right-12 top-1/2 -translate-y-1/2 bg-stone-950 text-stone-100 border border-amber-500/40 rounded-md shadow-2xl w-48 z-50 py-2"
          >
            {layoutMenuOptions.map(({ key, label, helper }) => {
              const isActive = activePreset === key;
              return (
                <button
                  key={key}
                  role="menuitem"
                  onClick={() => handleMenuSelect(key)}
                  className={`w-full text-left px-4 py-2 text-[11px] font-typewriter uppercase tracking-[0.35em] flex flex-col gap-1 border-l-4 transition ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'border-transparent hover:border-amber-300 hover:bg-stone-900'
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[9px] text-stone-400 tracking-[0.4em]">{helper}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 relative bg-stone-800 border-l-8 border-stone-900 shadow-inner transition-all duration-300 ease-out">
        <MapPanel
          entries={entries}
          selectedEntry={selectedEntry}
          onMarkerSelect={onMarkerSelect}
          shouldCenter={shouldCenterMap}
          resizeSignal={sidePanelWidth}
        />
      </div>
    </div>
  );

  const mobileLayout = (
    <div className="flex flex-col gap-4 p-4 pb-6 overflow-y-auto">
      <section className="rounded-xl border-4 border-stone-900 shadow-2xl overflow-hidden bg-[#f4f1ea]">
        <button
          type="button"
          aria-expanded={isMobileLogbookOpen}
          aria-controls={mobileLogbookPanelId}
          onClick={() => setIsMobileLogbookOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-stone-100 font-typewriter text-xs uppercase tracking-[0.4em]"
        >
          <span>Flight Logbook</span>
          {isMobileLogbookOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div
          id={mobileLogbookPanelId}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileLogbookOpen ? 'max-h-[80vh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="h-[65vh]">
            <LogbookPanel
              entries={entries}
              selectedId={selectedId}
              onSelect={onLogbookSelect}
              filterPhase={filterPhase}
              setFilterPhase={setFilterPhase}
              onOpenProfile={onOpenProfile}
              showSignificantOnly={showSignificantOnly}
              setShowSignificantOnly={setShowSignificantOnly}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border-4 border-stone-900 shadow-xl overflow-hidden bg-[#f4f1ea]">
        <button
          type="button"
          aria-expanded={isMobileContextOpen}
          aria-controls={mobileContextPanelId}
          onClick={() => setIsMobileContextOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-stone-100 font-typewriter text-xs uppercase tracking-[0.4em]"
        >
          <span>Mission Details</span>
          {isMobileContextOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div
          id={mobileContextPanelId}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileContextOpen ? 'max-h-[70vh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="h-[65vh]">
            <ContextPanel selectedEntry={selectedEntry} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border-4 border-stone-900 shadow-2xl overflow-hidden bg-stone-800">
        <button
          type="button"
          aria-expanded={isMobileMapOpen}
          aria-controls={mobileMapPanelId}
          onClick={() => setIsMobileMapOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-stone-100 font-typewriter text-xs uppercase tracking-[0.4em]"
        >
          <span>Map Overview</span>
          {isMobileMapOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div
          id={mobileMapPanelId}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileMapOpen ? 'max-h-[50vh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="relative h-[320px]">
            <MapPanel
              entries={entries}
              selectedEntry={selectedEntry}
              onMarkerSelect={onMarkerSelect}
              shouldCenter={shouldCenterMap}
              resizeSignal={isMobileMapOpen ? 1 : 0}
            />
            <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-typewriter uppercase tracking-[0.4em] px-3 py-1 rounded-full shadow">
              Drag to Explore
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {isDesktop ? desktopLayout : mobileLayout}
    </div>
  );
};

export default WorkspaceLayout;

