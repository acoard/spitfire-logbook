import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode
} from 'react';
import { ArrowLeftRight, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

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

const layoutPresets: Record<'balanced' | 'sidebarMax' | 'sidebarMin', PresetConfig> = {
  balanced: { side: 560, ratio: 0.64 },
  sidebarMax: { sideFraction: 1 },
  sidebarMin: { sideFraction: 0, ratio: 0.3 }
};

type PresetKey = keyof typeof layoutPresets;
type LayoutPreset = PresetKey | 'custom';

const layoutMenuOptions: Array<{ key: PresetKey; label: string; helper: string }> = [
  { key: 'sidebarMax', label: 'Focus Sidebar', helper: 'Prioritize data' },
  { key: 'sidebarMin', label: 'Focus Main', helper: 'Maximize view' },
  { key: 'balanced', label: 'Focus Balanced', helper: 'Reset split' }
];

interface ResizableLayoutProps {
  sidebarTop: ReactNode;
  sidebarBottom: ReactNode;
  mainContent: (resizeSignal: number) => ReactNode;
  mobileConfig: {
    sidebarTopTitle: string;
    sidebarBottomTitle: string;
    mainTitle: string;
  };
  // Triggers to control mobile section expansion from parent
  expandSidebarBottomTrigger?: boolean; 
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  sidebarTop,
  sidebarBottom,
  mainContent,
  mobileConfig,
  expandSidebarBottomTrigger
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [sidePanelWidth, setSidePanelWidth] = useState(layoutPresets.balanced.side ?? 560);
  const [logbookHeightRatio, setLogbookHeightRatio] = useState(layoutPresets.balanced.ratio);
  const [activePreset, setActivePreset] = useState<LayoutPreset>('balanced');
  const [isDraggingSide, setIsDraggingSide] = useState(false);
  const [isDraggingStack, setIsDraggingStack] = useState(false);
  
  // Mobile section states
  const [isMobileSidebarTopOpen, setIsMobileSidebarTopOpen] = useState(true);
  const [isMobileSidebarBottomOpen, setIsMobileSidebarBottomOpen] = useState(false);
  const [isMobileMainOpen, setIsMobileMainOpen] = useState(true);
  
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const layoutShellRef = useRef<HTMLDivElement>(null);
  const layoutMenuRef = useRef<HTMLDivElement>(null);
  const layoutMenuButtonRef = useRef<HTMLButtonElement>(null);
  
  // Refs to track values without re-rendering during drag
  const horizontalDragData = useRef({
    startX: 0,
    initialWidth: layoutPresets.balanced.side ?? 560,
    maxWidth: MAX_SIDE,
    currentWidth: layoutPresets.balanced.side ?? 560
  });
  
  const verticalDragData = useRef({
    startY: 0,
    initialRatio: layoutPresets.balanced.ratio,
    containerHeight: 1,
    currentRatio: layoutPresets.balanced.ratio
  });

  const mobileSidebarBottomId = 'mobile-sidebar-bottom-panel';
  const mobileSidebarTopId = 'mobile-sidebar-top-panel';
  const mobileMainId = 'mobile-main-panel';

  // React to parent triggers for mobile
  useEffect(() => {
    if (expandSidebarBottomTrigger) {
      setIsMobileSidebarBottomOpen(true);
    }
  }, [expandSidebarBottomTrigger]);

  // Click outside listener for layout menu
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

  // Cursor updates during drag
  useEffect(() => {
    if (isDraggingSide || isDraggingStack) {
      document.body.style.cursor = isDraggingSide ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingSide, isDraggingStack]);

  const getMaxSideWidth = useCallback(() => {
    const containerWidth =
      layoutShellRef.current?.getBoundingClientRect().width ??
      (typeof window !== 'undefined' ? window.innerWidth : MAX_SIDE);
    const maxByContainer = Math.max(0, containerWidth - DRAG_HANDLE_WIDTH);
    return clamp(maxByContainer, MIN_SIDE, MAX_SIDE);
  }, []);

  // Horizontal Drag (Sidebar Width)
  useEffect(() => {
    if (!isDraggingSide) return;
    const handleMouseMove = (event: MouseEvent) => {
      // Use requestAnimationFrame for smoother updates if needed, but direct DOM update is usually fast enough
      const delta = event.clientX - horizontalDragData.current.startX;
      const maxWidth = Math.max(MIN_SIDE, horizontalDragData.current.maxWidth);
      const newWidth = clamp(horizontalDragData.current.initialWidth + delta, MIN_SIDE, maxWidth);
      
      horizontalDragData.current.currentWidth = newWidth;
      
      // Update CSS variable directly
      if (layoutShellRef.current) {
        layoutShellRef.current.style.setProperty('--side-width', `${newWidth}px`);
      }
    };
    const handleMouseUp = () => {
      setIsDraggingSide(false);
      // Commit the final width to state
      setSidePanelWidth(horizontalDragData.current.currentWidth);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSide]);

  // Vertical Drag (Sidebar Ratio)
  useEffect(() => {
    if (!isDraggingStack) return;
    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientY - verticalDragData.current.startY;
      const deltaRatio = delta / verticalDragData.current.containerHeight;
      const nextRatio = clamp(verticalDragData.current.initialRatio + deltaRatio, MIN_RATIO, MAX_RATIO);
      
      verticalDragData.current.currentRatio = nextRatio;

      // Update CSS variable directly
      if (layoutShellRef.current) {
        layoutShellRef.current.style.setProperty('--top-ratio', `${nextRatio}`);
      }
    };
    const handleMouseUp = () => {
      setIsDraggingStack(false);
      // Commit the final ratio to state
      setLogbookHeightRatio(verticalDragData.current.currentRatio);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingStack]);

  // Window resize handler
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const max = getMaxSideWidth();
      setSidePanelWidth((prev) => clamp(prev, MIN_SIDE, max));
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
      maxWidth,
      currentWidth: sidePanelWidth
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
      containerHeight: bounds.height || 1,
      currentRatio: logbookHeightRatio
    };
    setActivePreset('custom');
    setIsLayoutMenuOpen(false);
    setIsDraggingStack(true);
  };

  const desktopLayout = (
    <div 
      ref={layoutShellRef} 
      className="flex flex-1 overflow-hidden bg-stone-900/30"
      style={{
        '--side-width': `${sidePanelWidth}px`,
        '--top-ratio': `${logbookHeightRatio}`
      } as React.CSSProperties}
    >
      <div
        ref={leftPanelRef}
        className="flex flex-col h-full bg-[#f4f1ea] shadow-[10px_0_30px_rgba(0,0,0,0.25)] border-r-8 border-stone-900 ease-out"
        style={{
          width: 'var(--side-width)',
          minWidth: 0,
          flexBasis: 'var(--side-width)',
          transition: isDraggingSide ? 'none' : 'width 300ms'
        }}
      >
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            flexBasis: 'calc(var(--top-ratio) * 100%)',
            minHeight: '240px',
            transition: isDraggingStack ? 'none' : 'flex-basis 250ms ease'
          }}
        >
          {sidebarTop}
        </div>

        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize panels"
          onMouseDown={handleVerticalDragStart}
          onDoubleClick={() => {
            setLogbookHeightRatio(layoutPresets.balanced.ratio);
            setActivePreset('custom');
          }}
          className={`flex items-center justify-center h-6 cursor-row-resize border-y border-stone-900/70 bg-stone-900/70 text-stone-200 transition-colors ${
            isDraggingStack ? 'bg-amber-500/60 text-stone-900' : 'hover:bg-amber-500/30 hover:text-stone-900'
          }`}
          title="Drag to adjust the split"
        >
          <ArrowUpDown className="w-4 h-4" />
        </div>

        <div
          className="relative overflow-hidden flex-shrink-0 flex-1"
          style={{
            flexBasis: 'calc((1 - var(--top-ratio)) * 100%)',
            minHeight: '200px',
            transition: isDraggingStack ? 'none' : 'flex-basis 250ms ease'
          }}
        >
          {sidebarBottom}
        </div>
      </div>

      <div className="relative h-full">
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize main panel"
          onMouseDown={handleHorizontalDragStart}
          onDoubleClick={handleLayoutReset}
          className={`relative flex flex-col items-center justify-center gap-4 px-2 py-4 w-8 max-w-8 h-full cursor-col-resize bg-stone-900/80 text-stone-200 transition-colors ${
            isDraggingSide ? 'bg-amber-500/60 text-stone-900' : 'hover:bg-amber-500/30 hover:text-stone-900'
          }`}
          title="Drag to adjust width"
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
        {/* We no longer need to pass the width, but we keep the prop for compatibility/initial load if needed */}
        {mainContent(sidePanelWidth)}
      </div>
    </div>
  );

  const mobileLayout = (
    <div className="flex flex-col gap-4 p-4 pb-6 overflow-y-auto">
      {/* Sidebar Top (e.g. Logbook) */}
      <section className="rounded-xl border-4 border-stone-900 shadow-2xl overflow-hidden bg-[#f4f1ea]">
        <button
          type="button"
          aria-expanded={isMobileSidebarTopOpen}
          aria-controls={mobileSidebarTopId}
          onClick={() => setIsMobileSidebarTopOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-stone-100 font-typewriter text-xs uppercase tracking-[0.4em]"
        >
          <span>{mobileConfig.sidebarTopTitle}</span>
          {isMobileSidebarTopOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div
          id={mobileSidebarTopId}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileSidebarTopOpen ? 'max-h-[80vh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="h-[65vh]">
            {sidebarTop}
          </div>
        </div>
      </section>

      {/* Sidebar Bottom (e.g. Context/Details) */}
      <section className="rounded-xl border-4 border-stone-900 shadow-xl overflow-hidden bg-[#f4f1ea]">
        <button
          type="button"
          aria-expanded={isMobileSidebarBottomOpen}
          aria-controls={mobileSidebarBottomId}
          onClick={() => setIsMobileSidebarBottomOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-stone-100 font-typewriter text-xs uppercase tracking-[0.4em]"
        >
          <span>{mobileConfig.sidebarBottomTitle}</span>
          {isMobileSidebarBottomOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div
          id={mobileSidebarBottomId}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileSidebarBottomOpen ? 'max-h-[70vh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="h-[65vh]">
            {sidebarBottom}
          </div>
        </div>
      </section>

      {/* Main Content (e.g. Map) */}
      <section className="rounded-xl border-4 border-stone-900 shadow-2xl overflow-hidden bg-stone-800">
        <button
          type="button"
          aria-expanded={isMobileMainOpen}
          aria-controls={mobileMainId}
          onClick={() => setIsMobileMainOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-stone-100 font-typewriter text-xs uppercase tracking-[0.4em]"
        >
          <span>{mobileConfig.mainTitle}</span>
          {isMobileMainOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div
          id={mobileMainId}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileMainOpen ? 'max-h-[50vh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="relative h-[320px]">
            {/* Pass 1 as signal for mobile since width isn't dynamic in the same way, or just trigger resize */}
            {mainContent(isMobileMainOpen ? 1 : 0)}
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
