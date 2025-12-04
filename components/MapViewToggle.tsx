import React, { useState, Suspense, lazy, useCallback } from 'react';
import { Map, Globe2, Loader2 } from 'lucide-react';
import MapPanel from './MapPanel';
import { LogEntry } from '../types';

// Lazy load the GlobePanel to avoid loading Three.js unless needed
const GlobePanel = lazy(() => import('./GlobePanel'));

type ViewMode = 'map' | 'globe';

interface MapViewToggleProps {
  entries: LogEntry[];
  selectedEntry: LogEntry | null;
  onMarkerSelect: (entry: LogEntry) => void;
  shouldCenter: boolean;
  customCenter?: [number, number];
  customZoom?: number;
}

// Loading component for the 3D globe
const GlobeLoadingFallback: React.FC = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-stone-900 to-stone-950">
    <div className="relative">
      {/* Animated loading globe */}
      <div className="w-24 h-24 rounded-full border-4 border-amber-700/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 to-amber-950/60 animate-pulse" />
        <div 
          className="absolute inset-0 border-r-4 border-amber-500/50 rounded-full animate-spin"
          style={{ animationDuration: '2s' }}
        />
      </div>
      
      {/* Globe icon in center */}
      <Globe2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-amber-600/70" />
    </div>
    
    <div className="mt-6 flex flex-col items-center">
      <div className="flex items-center gap-2 text-amber-500/80">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="font-typewriter text-sm uppercase tracking-wider">
          Initializing Globe
        </span>
      </div>
      <p className="text-stone-500 text-xs mt-2 font-typewriter">
        Loading 3D visualization...
      </p>
    </div>
  </div>
);

const MapViewToggle: React.FC<MapViewToggleProps> = ({
  entries,
  selectedEntry,
  onMarkerSelect,
  shouldCenter,
  customCenter,
  customZoom
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [hasLoadedGlobe, setHasLoadedGlobe] = useState(false);

  const handleViewChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'globe' && !hasLoadedGlobe) {
      setHasLoadedGlobe(true);
    }
  }, [hasLoadedGlobe]);

  return (
    <div className="h-full w-full relative">
      {/* View Toggle Controls */}
      <div className="absolute top-4 left-4 z-[500] flex">
        <div className="bg-stone-900/95 backdrop-blur-sm rounded-lg border-2 border-amber-700/40 shadow-xl overflow-hidden flex">
          {/* 2D Map Button */}
          <button
            onClick={() => handleViewChange('map')}
            className={`
              flex items-center gap-2 px-4 py-2.5 font-typewriter text-xs uppercase tracking-wider
              transition-all duration-200 border-r border-amber-700/30
              ${viewMode === 'map' 
                ? 'bg-amber-700/30 text-amber-200 shadow-inner' 
                : 'text-stone-400 hover:text-amber-300 hover:bg-amber-900/20'
              }
            `}
            title="Switch to 2D Map View"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Map (2D)</span>
          </button>
          
          {/* 3D Globe Button */}
          <button
            onClick={() => handleViewChange('globe')}
            className={`
              flex items-center gap-2 px-4 py-2.5 font-typewriter text-xs uppercase tracking-wider
              transition-all duration-200
              ${viewMode === 'globe' 
                ? 'bg-amber-700/30 text-amber-200 shadow-inner' 
                : 'text-stone-400 hover:text-amber-300 hover:bg-amber-900/20'
              }
            `}
            title="Switch to 3D Globe View"
          >
            <Globe2 className="w-4 h-4" />
            <span className="hidden sm:inline">Globe (3D)</span>
          </button>
        </div>
        
        {/* View indicator badge */}
        <div className="ml-2 flex items-center">
          <span className={`
            px-2 py-1 rounded text-[9px] font-typewriter uppercase tracking-wider
            transition-all duration-300
            ${viewMode === 'globe' 
              ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30' 
              : 'bg-stone-700/50 text-stone-400 border border-stone-600/30'
            }
          `}>
            {viewMode === 'globe' ? '✦ Interactive' : '⊡ Classic'}
          </span>
        </div>
      </div>

      {/* View Container */}
      <div className="h-full w-full">
        {/* 2D Map View */}
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${
            viewMode === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <MapPanel
            entries={entries}
            selectedEntry={selectedEntry}
            onMarkerSelect={onMarkerSelect}
            shouldCenter={shouldCenter}
            customCenter={customCenter}
            customZoom={customZoom}
          />
        </div>

        {/* 3D Globe View - Only render after first switch to globe */}
        {hasLoadedGlobe && (
          <div 
            className={`absolute inset-0 transition-opacity duration-500 ${
              viewMode === 'globe' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Suspense fallback={<GlobeLoadingFallback />}>
              <GlobePanel
                entries={entries}
                selectedEntry={selectedEntry}
                onMarkerSelect={onMarkerSelect}
                shouldCenter={shouldCenter}
              />
            </Suspense>
          </div>
        )}
        
        {/* Show loading state when first switching to globe */}
        {viewMode === 'globe' && !hasLoadedGlobe && (
          <div className="absolute inset-0 z-10">
            <GlobeLoadingFallback />
          </div>
        )}
      </div>

      {/* View-specific hints */}
      {viewMode === 'globe' && (
        <div className="absolute top-4 right-4 z-[500]">
          <div className="bg-amber-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-600/40 shadow-lg">
            <span className="text-amber-200/90 text-[10px] font-typewriter uppercase tracking-wider">
              ✦ 3D Globe Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapViewToggle;
