import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode
} from 'react';
import { ArrowLeftRight, ArrowUpDown, PanelLeft, PanelRight, Columns2 } from 'lucide-react';

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
  balanced: { sideFraction: 0.4, ratio: 0.64 },
  sidebarMax: { sideFraction: 1 },
  sidebarMin: { sideFraction: 0, ratio: 0.3 }
};

// Maximum default width for logbook panel on large monitors
const MAX_DEFAULT_LOGBOOK_WIDTH = 650;

type PresetKey = keyof typeof layoutPresets;
type LayoutPreset = PresetKey | 'custom';

const layoutPresetConfig: Array<{ key: PresetKey; label: string; shortcut: string }> = [
  { key: 'sidebarMax', label: 'Focus Logbook', shortcut: '[' },
  { key: 'balanced', label: 'Balanced', shortcut: '\\' },
  { key: 'sidebarMin', label: 'Focus Map', shortcut: ']' }
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

// Calculate smart default width: 40% of viewport, capped at MAX_DEFAULT_LOGBOOK_WIDTH
const getDefaultSideWidth = () => {
  if (typeof window === 'undefined') return 560;
  const viewportWidth = window.innerWidth;
  const targetWidth = viewportWidth * 0.4;
  return Math.min(targetWidth, MAX_DEFAULT_LOGBOOK_WIDTH);
};

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  sidebarTop,
  sidebarBottom,
  mainContent,
  mobileConfig,
  expandSidebarBottomTrigger
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [sidePanelWidth, setSidePanelWidth] = useState(getDefaultSideWidth);
  const [logbookHeightRatio, setLogbookHeightRatio] = useState(layoutPresets.balanced.ratio);
  const [activePreset, setActivePreset] = useState<LayoutPreset>('balanced');
  const [isDraggingSide, setIsDraggingSide] = useState(false);
  const [isDraggingStack, setIsDraggingStack] = useState(false);
  
  // Mobile section states (keeping for backwards compatibility but primarily using tab system)
  const [isMobileSidebarTopOpen, setIsMobileSidebarTopOpen] = useState(true);
  const [isMobileSidebarBottomOpen, setIsMobileSidebarBottomOpen] = useState(false);
  const [isMobileMainOpen, setIsMobileMainOpen] = useState(true);
  
  // Mobile tab state for cleaner tab-based interface
  const [mobileActiveTab, setMobileActiveTab] = useState<'logbook' | 'details' | 'map'>('logbook');

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const layoutShellRef = useRef<HTMLDivElement>(null);
  
  // Refs to track values without re-rendering during drag
  const horizontalDragData = useRef({
    startX: 0,
    initialWidth: getDefaultSideWidth(),
    maxWidth: MAX_SIDE,
    currentWidth: getDefaultSideWidth()
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

  // React to parent triggers for mobile - switch to details tab when entry selected
  useEffect(() => {
    if (expandSidebarBottomTrigger && !isDesktop) {
      setMobileActiveTab('details');
    }
  }, [expandSidebarBottomTrigger, isDesktop]);

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

  const handlePresetApply = useCallback((preset: PresetKey) => {
    const config = layoutPresets[preset];
    const maxWidth = getMaxSideWidth();
    
    let targetWidth: number;
    if (typeof config.sideFraction === 'number') {
      // For balanced preset, apply max cap
      if (preset === 'balanced') {
        targetWidth = Math.min(config.sideFraction * maxWidth, MAX_DEFAULT_LOGBOOK_WIDTH);
      } else {
        targetWidth = config.sideFraction * maxWidth;
      }
    } else {
      targetWidth = clamp(config.side ?? maxWidth, MIN_SIDE, maxWidth);
    }
    
    setSidePanelWidth(targetWidth);
    
    if (config.ratio !== undefined) {
      setLogbookHeightRatio(config.ratio);
    }
    setActivePreset(preset);
  }, [getMaxSideWidth]);

  const handleLayoutReset = () => handlePresetApply('balanced');

  // Keyboard shortcuts for layout presets
  useEffect(() => {
    if (!isDesktop) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (event.key) {
        case '[':
          handlePresetApply('sidebarMax');
          break;
        case ']':
          handlePresetApply('sidebarMin');
          break;
        case '\\':
          handlePresetApply('balanced');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDesktop, handlePresetApply]);

  const handleHorizontalDragStart = (event: React.MouseEvent) => {
    event.preventDefault();
    setActivePreset('custom');
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

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize main panel"
        onMouseDown={handleHorizontalDragStart}
        onDoubleClick={handleLayoutReset}
        className={`relative flex flex-col items-center justify-center gap-1 px-1 py-4 w-8 max-w-8 h-full cursor-col-resize bg-stone-900/80 text-stone-200 transition-colors ${
          isDraggingSide ? 'bg-amber-500/60 text-stone-900' : ''
        }`}
        title="Drag anywhere on this bar to resize"
      >
        {/* Drag indicator with hint */}
        <div className="flex flex-col items-center gap-1 mb-1">
          <ArrowLeftRight className="w-3.5 h-3.5 opacity-60" />
          <span className="text-[7px] uppercase tracking-wide opacity-50 font-typewriter">Drag</span>
        </div>
        
        {/* Layout preset buttons */}
        <div className="flex flex-col gap-1">
          {layoutPresetConfig.map(({ key, label, shortcut }) => {
            const isActive = activePreset === key;
            const Icon = key === 'sidebarMax' ? PanelLeft : key === 'sidebarMin' ? PanelRight : Columns2;
            
            // Determine tooltip position based on available space
            // When sidebar is maximized (bar at right edge), show tooltip on left
            // When sidebar is minimized (bar at left edge), show tooltip on right
            // Otherwise default to right
            const tooltipOnLeft = activePreset === 'sidebarMax' || sidePanelWidth > (typeof window !== 'undefined' ? window.innerWidth * 0.6 : 800);
            
            return (
              <button
                key={key}
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePresetApply(key);
                }}
                className={`group relative flex items-center justify-center w-6 h-6 rounded transition-all ${
                  isActive
                    ? 'bg-amber-500/80 text-stone-900 shadow-sm'
                    : 'hover:bg-amber-500/30 hover:text-stone-100 text-stone-400'
                }`}
                title={`${label} (${shortcut})`}
              >
                <Icon className="w-4 h-4" />
                
                {/* Tooltip on hover - position adapts based on sidebar width */}
                <span className={`absolute px-2 py-1 bg-stone-950 text-stone-100 text-[10px] font-typewriter uppercase tracking-wider whitespace-nowrap rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg border border-stone-700 z-50 ${
                  tooltipOnLeft 
                    ? 'right-full mr-2' 
                    : 'left-full ml-2'
                }`}>
                  {label}
                  <span className="ml-1.5 text-amber-400">{shortcut}</span>
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Visual drag handle dots */}
        <div className="flex flex-col gap-0.5 mt-2 opacity-40">
          <div className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-current" />
            <div className="w-1 h-1 rounded-full bg-current" />
          </div>
          <div className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-current" />
            <div className="w-1 h-1 rounded-full bg-current" />
          </div>
          <div className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-current" />
            <div className="w-1 h-1 rounded-full bg-current" />
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 relative bg-stone-800 border-l-8 border-stone-900 shadow-inner transition-all duration-300 ease-out">
        {/* We no longer need to pass the width, but we keep the prop for compatibility/initial load if needed */}
        {mainContent(sidePanelWidth)}
      </div>
    </div>
  );

  const mobileLayout = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile Tab Bar */}
      <div className="flex bg-stone-900 border-b-2 border-stone-800 shrink-0">
        <button
          type="button"
          onClick={() => setMobileActiveTab('logbook')}
          className={`flex-1 py-3 px-2 font-typewriter text-[10px] uppercase tracking-[0.15em] transition-colors relative ${
            mobileActiveTab === 'logbook'
              ? 'text-amber-500 bg-stone-800'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          {mobileConfig.sidebarTopTitle}
          {mobileActiveTab === 'logbook' && (
            <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('details')}
          className={`flex-1 py-3 px-2 font-typewriter text-[10px] uppercase tracking-[0.15em] transition-colors relative ${
            mobileActiveTab === 'details'
              ? 'text-amber-500 bg-stone-800'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          {mobileConfig.sidebarBottomTitle}
          {mobileActiveTab === 'details' && (
            <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('map')}
          className={`flex-1 py-3 px-2 font-typewriter text-[10px] uppercase tracking-[0.15em] transition-colors relative ${
            mobileActiveTab === 'map'
              ? 'text-amber-500 bg-stone-800'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          {mobileConfig.mainTitle}
          {mobileActiveTab === 'map' && (
            <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500" />
          )}
        </button>
      </div>

      {/* Mobile Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Logbook Tab */}
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            mobileActiveTab === 'logbook'
              ? 'opacity-100 pointer-events-auto z-10'
              : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <div className="h-full bg-[#f4f1ea]">
            {sidebarTop}
          </div>
        </div>

        {/* Details Tab */}
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            mobileActiveTab === 'details'
              ? 'opacity-100 pointer-events-auto z-10'
              : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <div className="h-full bg-[#f4f1ea]">
            {sidebarBottom}
          </div>
        </div>

        {/* Map Tab */}
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            mobileActiveTab === 'map'
              ? 'opacity-100 pointer-events-auto z-10'
              : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <div className="h-full bg-stone-800 relative">
            {mainContent(mobileActiveTab === 'map' ? 1 : 0)}
            <div className="absolute top-3 left-3 bg-black/70 text-white text-[9px] font-typewriter uppercase tracking-[0.3em] px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
              Pinch & Drag
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {isDesktop ? desktopLayout : mobileLayout}
    </div>
  );
};
