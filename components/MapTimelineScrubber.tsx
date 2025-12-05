import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { LogEntry, Phase } from '../types';

// ============================================================================
// Types - Map Agnostic Interface
// ============================================================================

export interface TimelineMarker {
  id: string;
  date: Date;
  dateDisplay: string;
  title: string;
  subtitle?: string;
  significance: 'milestone' | 'major' | 'minor';
  phase: Phase;
  location?: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  originalEntry: LogEntry;
}

export interface TimelineChapter {
  id: string;
  name: string;
  phase: Phase;
  startDate: Date;
  endDate: Date;
}

export interface MapTimelineScrubberProps {
  // Data - receives LogEntries and transforms them internally
  entries: LogEntry[];
  
  // Current State (controlled component)
  selectedEntryId?: string | null;
  
  // Callbacks - map-agnostic, parent handles map-specific actions
  onEntrySelect: (entry: LogEntry) => void;
  
  // Display options
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  
  // Styling
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const parseDate = (dateStr: string): Date => {
  return new Date(dateStr);
};

const formatDateDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Get chapter info from phase
const getChapterFromPhase = (phase: Phase): { name: string; color: string } => {
  switch (phase) {
    case Phase.TRAINING:
      return { name: 'Training', color: '#EAB308' }; // yellow
    case Phase.COMBAT:
      return { name: 'Combat', color: '#DC2626' }; // red
    case Phase.FERRY:
      return { name: 'Ferry', color: '#3B82F6' }; // blue
    default:
      return { name: 'Unknown', color: '#64748B' };
  }
};

// Calculate position along timeline (0-1) for a given date
const calculateTimelinePosition = (date: Date, startDate: Date, endDate: Date): number => {
  const total = endDate.getTime() - startDate.getTime();
  const current = date.getTime() - startDate.getTime();
  return Math.max(0, Math.min(1, current / total));
};

// ============================================================================
// Sub-components
// ============================================================================

interface TimelineMarkerDotProps {
  marker: TimelineMarker;
  position: number;
  isSelected: boolean;
  onClick: () => void;
}

const TimelineMarkerDot: React.FC<TimelineMarkerDotProps> = ({ 
  marker, 
  position, 
  isSelected, 
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const chapterInfo = getChapterFromPhase(marker.phase);
  
  // Size based on significance
  const sizeClasses = {
    milestone: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    major: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
    minor: 'w-2 h-2 sm:w-2.5 sm:h-2.5',
  };
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10
        rounded-full transition-all duration-200 cursor-pointer
        ${sizeClasses[marker.significance]}
        ${isSelected 
          ? 'ring-2 ring-amber-200 ring-offset-1 ring-offset-amber-900/80 scale-125 z-20' 
          : isHovered 
            ? 'scale-110 z-15' 
            : ''
        }
      `}
      style={{ 
        left: `${position * 100}%`,
        backgroundColor: chapterInfo.color,
        boxShadow: isSelected 
          ? `0 0 8px ${chapterInfo.color}, 0 0 16px ${chapterInfo.color}40` 
          : marker.significance === 'milestone' 
            ? `0 0 4px ${chapterInfo.color}60` 
            : 'none',
      }}
      title={`${marker.dateDisplay}: ${marker.title}`}
      aria-label={`${marker.dateDisplay}: ${marker.title}`}
    >
      {/* Tooltip on hover */}
      {isHovered && !isSelected && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-30">
          <div className="bg-amber-950/95 text-amber-100 px-2 py-1 rounded shadow-lg whitespace-nowrap text-[10px] sm:text-xs font-typewriter border border-amber-800/50">
            <div className="font-semibold">{marker.dateDisplay}</div>
            <div className="text-amber-300/80 truncate max-w-32">{marker.title}</div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-950/95" />
        </div>
      )}
    </button>
  );
};

interface ChapterRegionProps {
  phase: Phase;
  startPosition: number;
  endPosition: number;
}

const ChapterRegion: React.FC<ChapterRegionProps> = ({ phase, startPosition, endPosition }) => {
  const chapterInfo = getChapterFromPhase(phase);
  
  return (
    <div
      className="absolute top-0 bottom-0 opacity-20"
      style={{
        left: `${startPosition * 100}%`,
        width: `${(endPosition - startPosition) * 100}%`,
        backgroundColor: chapterInfo.color,
      }}
    />
  );
};

interface PositionIndicatorProps {
  position: number;
}

const PositionIndicator: React.FC<PositionIndicatorProps> = ({ position }) => {
  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-amber-300 z-20 pointer-events-none"
      style={{ left: `${position * 100}%` }}
    >
      {/* Plane/needle at top */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-amber-300">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current transform rotate-90">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
      {/* Glow effect */}
      <div 
        className="absolute inset-0 w-1 -translate-x-1/4 bg-amber-300/30 blur-sm"
      />
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const MapTimelineScrubber: React.FC<MapTimelineScrubberProps> = ({
  entries,
  selectedEntryId,
  onEntrySelect,
  collapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track container width to hide legend when too narrow
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Hide chapter legend when container is narrower than 300px
        setIsNarrow(entry.contentRect.width < 300);
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  
  // Transform entries to timeline markers
  const markers: TimelineMarker[] = useMemo(() => {
    return entries.map(entry => ({
      id: entry.id,
      date: parseDate(entry.date),
      dateDisplay: formatDateDisplay(entry.date),
      title: entry.duty,
      subtitle: entry.remarks,
      significance: entry.isSignificant ? 'milestone' : (entry.historicalNote ? 'major' : 'minor'),
      phase: entry.phase,
      location: entry.origin ? {
        name: entry.origin.name,
        coordinates: { lat: entry.origin.lat, lng: entry.origin.lng },
      } : undefined,
      originalEntry: entry,
    }));
  }, [entries]);
  
  // Calculate timeline range (with padding)
  const { startDate, endDate } = useMemo(() => {
    if (markers.length === 0) {
      return { 
        startDate: new Date('1944-01-01'), 
        endDate: new Date('1946-12-31') 
      };
    }
    
    const dates = markers.map(m => m.date.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Add padding of 30 days on each side
    const paddingMs = 30 * 24 * 60 * 60 * 1000;
    return {
      startDate: new Date(minDate.getTime() - paddingMs),
      endDate: new Date(maxDate.getTime() + paddingMs),
    };
  }, [markers]);
  
  // Calculate chapter regions
  const chapterRegions = useMemo(() => {
    const phases = [Phase.TRAINING, Phase.COMBAT, Phase.FERRY];
    const regions: { phase: Phase; start: number; end: number }[] = [];
    
    phases.forEach(phase => {
      const phaseMarkers = markers.filter(m => m.phase === phase);
      if (phaseMarkers.length > 0) {
        const phaseDates = phaseMarkers.map(m => m.date.getTime());
        const phaseStart = new Date(Math.min(...phaseDates));
        const phaseEnd = new Date(Math.max(...phaseDates));
        
        regions.push({
          phase,
          start: calculateTimelinePosition(phaseStart, startDate, endDate),
          end: calculateTimelinePosition(phaseEnd, startDate, endDate),
        });
      }
    });
    
    return regions;
  }, [markers, startDate, endDate]);
  
  // Find current selection
  const selectedIndex = useMemo(() => {
    if (!selectedEntryId) return -1;
    return markers.findIndex(m => m.id === selectedEntryId);
  }, [markers, selectedEntryId]);
  
  const selectedMarker = selectedIndex >= 0 ? markers[selectedIndex] : null;
  
  // Calculate selected position
  const selectedPosition = useMemo(() => {
    if (!selectedMarker) return 0.5;
    return calculateTimelinePosition(selectedMarker.date, startDate, endDate);
  }, [selectedMarker, startDate, endDate]);
  
  // Navigation functions
  const navigateToIndex = useCallback((index: number) => {
    if (index >= 0 && index < markers.length) {
      onEntrySelect(markers[index].originalEntry);
    }
  }, [markers, onEntrySelect]);
  
  const navigatePrev = useCallback(() => {
    if (selectedIndex > 0) {
      navigateToIndex(selectedIndex - 1);
    } else if (selectedIndex === -1 && markers.length > 0) {
      navigateToIndex(markers.length - 1);
    }
  }, [selectedIndex, markers.length, navigateToIndex]);
  
  const navigateNext = useCallback(() => {
    if (selectedIndex < markers.length - 1) {
      navigateToIndex(selectedIndex + 1);
    } else if (selectedIndex === -1 && markers.length > 0) {
      navigateToIndex(0);
    }
  }, [selectedIndex, markers.length, navigateToIndex]);
  
  const navigateFirst = useCallback(() => {
    if (markers.length > 0) {
      navigateToIndex(0);
    }
  }, [markers.length, navigateToIndex]);
  
  const navigateLast = useCallback(() => {
    if (markers.length > 0) {
      navigateToIndex(markers.length - 1);
    }
  }, [markers.length, navigateToIndex]);
  
  // Playback controls
  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        if (selectedIndex >= markers.length - 1) {
          setIsPlaying(false);
        } else {
          navigateNext();
        }
      }, 8000); // 9 seconds per entry - allows the animated plane to complete its 8-second journey
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, selectedIndex, markers.length, navigateNext]);
  
  // Handle track click/drag for seeking
  const handleTrackInteraction = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    const clampedPosition = Math.max(0, Math.min(1, position));
    
    // Find the nearest marker
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    markers.forEach((marker, index) => {
      const markerPosition = calculateTimelinePosition(marker.date, startDate, endDate);
      const distance = Math.abs(markerPosition - clampedPosition);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    
    navigateToIndex(nearestIndex);
  }, [markers, startDate, endDate, navigateToIndex]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleTrackInteraction(e.clientX);
  }, [handleTrackInteraction]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleTrackInteraction(e.clientX);
    }
  }, [isDragging, handleTrackInteraction]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Global mouse up listener for drag release
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          navigatePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateNext();
          break;
        case 'Home':
          e.preventDefault();
          navigateFirst();
          break;
        case 'End':
          e.preventDefault();
          navigateLast();
          break;
        case ' ':
          e.preventDefault();
          togglePlayback();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigatePrev, navigateNext, navigateFirst, navigateLast, togglePlayback]);
  
  // Year markers for the timeline
  const yearMarkers = useMemo(() => {
    const years: { year: number; position: number }[] = [];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const earliestYear = Math.min(startYear, 1944);
    
    for (let year = earliestYear; year <= endYear; year++) {
      const yearDate = new Date(year, 0, 1);
      years.push({
        year,
        position: calculateTimelinePosition(yearDate, startDate, endDate),
      });
    }
    
    return years;
  }, [startDate, endDate]);
  
  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className={`
          absolute z-[500]
          bg-amber-950/90 hover:bg-amber-900/95 text-amber-200
          shadow-lg font-typewriter text-xs tracking-wider
          border border-amber-800/50
          transition-all duration-300
          flex items-center gap-2
          
          /* Mobile: full width bar at bottom */
          bottom-0 left-0 right-0
          px-4 py-2.5
          justify-center
          rounded-t-lg border-b-0
          
          /* Desktop/tablet: centered pill, higher to avoid Leaflet attribution */
          sm:bottom-10 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto
          sm:px-4 sm:py-2
          sm:rounded-lg sm:border-b
          sm:hover:translate-y-[-2px]
          
          ${className}
        `}
        aria-label="Show Timeline"
      >
        <ChevronUp className="w-4 h-4" />
        <span>TIMELINE</span>
        <span className="text-amber-400/80">{selectedMarker?.dateDisplay || '1944-1946'}</span>
      </button>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={`
        absolute bottom-0 left-0 right-0 z-[500]
        bg-gradient-to-t from-amber-950/95 via-amber-900/90 to-amber-900/85
        backdrop-blur-sm
        border-t-2 border-amber-700/50
        shadow-[0_-4px_20px_rgba(0,0,0,0.3)]
        transition-all duration-300
        ${className}
      `}
      role="region"
      aria-label="Timeline Navigator"
    >
      {/* Leather texture overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} 
      />
      
      {/* Main content container */}
      <div className="relative px-2 sm:px-4 pt-2 pb-3">
        {/* Top row: Info and controls */}
        <div className="flex items-center justify-between mb-2 gap-2">
          {/* Left: Current selection info */}
          <div className="flex-1 min-w-0">
            {selectedMarker ? (
              <div className="flex flex-col">
                <span className="font-typewriter text-amber-300 text-[10px] sm:text-xs tracking-wider">
                  {selectedMarker.dateDisplay}
                </span>
                <span className="font-old-print text-amber-100 text-sm sm:text-base font-medium truncate">
                  {selectedMarker.title}
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="font-typewriter text-amber-400/70 text-[10px] sm:text-xs tracking-wider">
                  ROBIN GLEN'S RAF JOURNEY
                </span>
                <span className="font-old-print text-amber-200/80 text-sm sm:text-base italic">
                  Select an entry to explore
                </span>
              </div>
            )}
          </div>
          
          {/* Center: Playback controls */}
          <div className="flex items-center gap-1 bg-amber-950/50 rounded-full px-2 py-1 border border-amber-700/30">
            <button
              onClick={navigateFirst}
              className="p-1 text-amber-300 hover:text-amber-100 transition-colors disabled:opacity-30"
              disabled={selectedIndex <= 0}
              aria-label="First entry"
              title="First (Home)"
            >
              <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={navigatePrev}
              className="p-1 text-amber-300 hover:text-amber-100 transition-colors disabled:opacity-30"
              disabled={selectedIndex <= 0}
              aria-label="Previous entry"
              title="Previous (←)"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={togglePlayback}
              className={`
                p-1.5 rounded-full transition-colors
                ${isPlaying 
                  ? 'bg-amber-600 text-amber-950' 
                  : 'text-amber-300 hover:text-amber-100 hover:bg-amber-800/50'
                }
              `}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
            <button
              onClick={navigateNext}
              className="p-1 text-amber-300 hover:text-amber-100 transition-colors disabled:opacity-30"
              disabled={selectedIndex >= markers.length - 1}
              aria-label="Next entry"
              title="Next (→)"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={navigateLast}
              className="p-1 text-amber-300 hover:text-amber-100 transition-colors disabled:opacity-30"
              disabled={selectedIndex >= markers.length - 1}
              aria-label="Last entry"
              title="Last (End)"
            >
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          {/* Right: Entry counter and collapse button */}
          <div className="flex items-center gap-2">
            <span className="font-typewriter text-amber-400/70 text-[10px] sm:text-xs hidden sm:block">
              {selectedIndex >= 0 ? `${selectedIndex + 1}` : '-'}/{markers.length}
            </span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 text-amber-400/70 hover:text-amber-200 transition-colors"
                aria-label="Hide timeline"
                title="Hide Timeline"
              >
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Timeline Track */}
        <div 
          ref={trackRef}
          className={`
            relative h-6 sm:h-8 mx-8 sm:mx-12
            bg-amber-950/60 rounded-full
            border border-amber-700/40
            cursor-pointer
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          `}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          role="slider"
          aria-label="Timeline scrubber"
          aria-valuemin={0}
          aria-valuemax={markers.length - 1}
          aria-valuenow={selectedIndex >= 0 ? selectedIndex : 0}
          tabIndex={0}
        >
          {/* Chapter background regions */}
          <div className="absolute inset-1 rounded-full overflow-hidden">
            {chapterRegions.map((region, idx) => (
              <ChapterRegion
                key={idx}
                phase={region.phase}
                startPosition={region.start}
                endPosition={region.end}
              />
            ))}
          </div>
          
          {/* Track line */}
          <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-amber-700/50 rounded-full" />
          
          {/* Progress fill */}
          {selectedMarker && (
            <div 
              className="absolute left-2 top-1/2 -translate-y-1/2 h-0.5 bg-amber-500/60 rounded-full transition-all duration-200"
              style={{ width: `calc(${selectedPosition * 100}% - 8px)` }}
            />
          )}
          
          {/* Markers */}
          <div className="absolute left-2 right-2 top-0 bottom-0">
            {markers.map((marker) => {
              const position = calculateTimelinePosition(marker.date, startDate, endDate);
              return (
                <TimelineMarkerDot
                  key={marker.id}
                  marker={marker}
                  position={position}
                  isSelected={marker.id === selectedEntryId}
                  onClick={() => onEntrySelect(marker.originalEntry)}
                />
              );
            })}
          </div>
          
          {/* Position indicator */}
          {selectedMarker && (
            <div className="absolute left-2 right-2 top-0 bottom-0 pointer-events-none">
              <PositionIndicator position={selectedPosition} />
            </div>
          )}
        </div>
        
        {/* Year labels */}
        <div className="relative mx-8 sm:mx-12 mt-1 h-4">
          {yearMarkers.map(({ year, position }) => (
            <div
              key={year}
              className="absolute -translate-x-1/2 font-typewriter text-[9px] sm:text-[10px] text-amber-500/70"
              style={{ left: `${position * 100}%` }}
            >
              {year}
            </div>
          ))}
        </div>
        
        {/* Chapter legend - hidden when panel is too narrow */}
        {!isNarrow && (
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-1">
            {[Phase.TRAINING, Phase.COMBAT, Phase.FERRY].map(phase => {
              const info = getChapterFromPhase(phase);
              const count = markers.filter(m => m.phase === phase).length;
              return (
                <div key={phase} className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                  <span className="font-typewriter text-[8px] sm:text-[10px] text-amber-400/70 tracking-wider">
                    {info.name.toUpperCase()} ({count})
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapTimelineScrubber;

