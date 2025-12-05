import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LogEntry, AircraftCategory } from '../types';

const getColor = (cat: AircraftCategory) => {
  switch (cat) {
    case AircraftCategory.TRAINING: return '#EAB308';
    case AircraftCategory.FIGHTER: return '#DC2626';
    case AircraftCategory.TRANSPORT: return '#3B82F6';
    default: return '#64748B';
  }
};

interface FlightInfoPanelProps {
  selectedEntry: LogEntry | null;
  variant?: 'dark' | 'light';
  className?: string;
  isTimelineCollapsed?: boolean;
}

// Timeline heights for positioning calculation
const TIMELINE_EXPANDED_HEIGHT = 140; // px - height of expanded timeline
const TIMELINE_COLLAPSED_HEIGHT = 44; // px - height of collapsed timeline bar on mobile

const FlightInfoPanel: React.FC<FlightInfoPanelProps> = ({ 
  selectedEntry, 
  variant = 'dark',
  className = '',
  isTimelineCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!selectedEntry) return null;
  
  const isDark = variant === 'dark';
  
  // Calculate bottom offset based on timeline state
  const bottomOffset = isTimelineCollapsed ? TIMELINE_COLLAPSED_HEIGHT : TIMELINE_EXPANDED_HEIGHT;
  
  // Mobile: Show above timeline scrubber with animated position
  if (isMobile) {
    return (
      <div 
        className={`
          fixed left-0 right-0 z-[600]
          transition-all duration-300 ease-out
          ${className}
        `}
        style={{ bottom: `${bottomOffset}px` }}
      >
        <div className={`
          ${isDark 
            ? 'bg-gradient-to-br from-stone-900/98 to-stone-950 border-amber-700/50' 
            : 'bg-[#f4f1ea]/98 border-stone-400'
          }
          backdrop-blur-md rounded-t-xl border-t-2 border-x shadow-2xl
          transition-all duration-300 ease-out overflow-hidden
          ${isCollapsed ? 'rounded-b-xl border-b-2 mx-2' : ''}
        `}>
          {/* Mobile header - always visible */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              w-full flex items-center justify-between px-3 py-2
              ${isDark ? 'bg-amber-900/40 border-amber-700/30' : 'bg-stone-200/80 border-stone-300'}
              ${isCollapsed ? '' : 'border-b'}
            `}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: getColor(selectedEntry.aircraftCategory) }}
              />
              <span className={`
                text-[10px] font-typewriter uppercase tracking-wider truncate
                ${isDark ? 'text-amber-300' : 'text-stone-700'}
              `}>
                {selectedEntry.phase} • {selectedEntry.date}
              </span>
              {isCollapsed && (
                <span className={`text-[10px] font-typewriter truncate ${isDark ? 'text-amber-100/70' : 'text-stone-600'}`}>
                  — {selectedEntry.duty}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[9px] font-typewriter ${isDark ? 'text-amber-400/60' : 'text-stone-500'}`}>
                {isCollapsed ? 'EXPAND' : 'HIDE'}
              </span>
              {isCollapsed 
                ? <ChevronUp className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-stone-600'}`} />
                : <ChevronDown className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-stone-600'}`} />
              }
            </div>
          </button>
          
          {/* Collapsible Content */}
          <div className={`
            transition-all duration-300 ease-out overflow-hidden
            ${isCollapsed ? 'max-h-0' : 'max-h-[40vh]'}
          `}>
            <div className="p-3 space-y-2.5 overflow-y-auto max-h-[calc(40vh-40px)]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className={`text-[9px] font-typewriter uppercase tracking-wider mb-0.5 ${isDark ? 'text-amber-400/80' : 'text-stone-500'}`}>
                    Aircraft
                  </div>
                  <div className={`text-sm font-typewriter ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                    {selectedEntry.aircraftType}
                  </div>
                </div>
                
                <div>
                  <div className={`text-[9px] font-typewriter uppercase tracking-wider mb-0.5 ${isDark ? 'text-amber-400/80' : 'text-stone-500'}`}>
                    From
                  </div>
                  <div className={`text-sm font-typewriter ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                    {selectedEntry.origin.name}
                  </div>
                </div>
              </div>
              
              <div>
                <div className={`text-[9px] font-typewriter uppercase tracking-wider mb-0.5 ${isDark ? 'text-amber-400/80' : 'text-stone-500'}`}>
                  Mission
                </div>
                <div className={`text-sm font-typewriter ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                  {selectedEntry.duty}
                </div>
              </div>
              
              {/* Route */}
              <div className={`pt-2 border-t ${isDark ? 'border-amber-700/20' : 'border-stone-300'}`}>
                <div className={`text-[9px] font-typewriter uppercase tracking-wider mb-1 ${isDark ? 'text-amber-400/80' : 'text-stone-500'}`}>
                  Route
                </div>
                <div className={`flex flex-wrap items-center gap-2 text-xs font-typewriter ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">●</span>
                    {selectedEntry.origin.name}
                  </span>
                  {selectedEntry.target && (
                    <>
                      <span className={isDark ? 'text-amber-600' : 'text-stone-400'}>→</span>
                      <span className="flex items-center gap-1">
                        <span className="text-red-500">◆</span>
                        {selectedEntry.target.name}
                      </span>
                    </>
                  )}
                  {selectedEntry.destination && selectedEntry.destination.name !== selectedEntry.origin.name && (
                    <>
                      <span className={isDark ? 'text-amber-600' : 'text-stone-400'}>→</span>
                      <span className="flex items-center gap-1">
                        <span className="text-blue-500">●</span>
                        {selectedEntry.destination.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {selectedEntry.isSignificant && (
                <div className={`
                  mt-1 px-2 py-1 rounded border
                  ${isDark ? 'bg-red-900/30 border-red-700/40' : 'bg-red-50 border-red-200'}
                `}>
                  <span className={`text-[9px] font-typewriter uppercase tracking-wider ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                    ★ Significant Event
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop: Show as floating panel at top-left
  return (
    <div className={`
      absolute left-4 top-16 z-[200] max-w-xs
      animate-in slide-in-from-left duration-300
      ${className}
    `}>
      <div className={`
        ${isDark 
          ? 'bg-gradient-to-br from-stone-900/95 to-stone-950/98 border-amber-700/50' 
          : 'bg-[#f4f1ea]/95 border-stone-400'
        }
        backdrop-blur-sm rounded-lg border-2 shadow-2xl overflow-hidden
      `}>
        {/* Header */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            w-full flex items-center justify-between px-4 py-2
            ${isDark ? 'bg-amber-900/40 border-amber-700/30' : 'bg-stone-200/80 border-stone-300'}
            border-b cursor-pointer hover:opacity-90 transition-opacity
          `}
        >
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full animate-pulse" 
              style={{ backgroundColor: getColor(selectedEntry.aircraftCategory) }}
            />
            <span className={`
              text-[10px] font-typewriter uppercase tracking-wider
              ${isDark ? 'text-amber-300' : 'text-stone-700'}
            `}>
              {selectedEntry.phase}
            </span>
          </div>
          {isCollapsed 
            ? <ChevronDown className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-stone-600'}`} />
            : <ChevronUp className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-stone-600'}`} />
          }
        </button>
        
        {/* Collapsible Content */}
        <div className={`
          transition-all duration-300 ease-out overflow-hidden
          ${isCollapsed ? 'max-h-0' : 'max-h-[500px]'}
        `}>
          <div className="p-4 space-y-3">
            <div>
              <div className={`text-[9px] font-typewriter uppercase tracking-wider mb-0.5 ${isDark ? 'text-amber-400/80' : 'text-stone-500'}`}>
                Date
              </div>
              <div className={`text-sm font-typewriter ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                {selectedEntry.date}
              </div>
            </div>
            
            <div>
              <div className={`text-[9px] font-typewriter uppercase tracking-wider mb-0.5 ${isDark ? 'text-amber-400/80' : 'text-stone-500'}`}>
                Aircraft
              </div>
              <div className={`text-sm font-typewriter ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                {selectedEntry.aircraftType}
              </div>
            </div>
            
            <div>
              <div className={`text-[9px] font-typewriter uppercase tracking-wider mb-0.5 ${isDark ? 'text-amber-400/80' : 'text-stone-500'}`}>
                Mission
              </div>
              <div className={`text-sm font-typewriter ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                {selectedEntry.duty}
              </div>
            </div>
            
            <div className={`pt-2 border-t ${isDark ? 'border-amber-700/20' : 'border-stone-300'}`}>
              <div className={`text-[9px] font-typewriter uppercase tracking-wider mb-0.5 ${isDark ? 'text-amber-400/80' : 'text-stone-500'}`}>
                Route
              </div>
              <div className={`text-xs font-typewriter space-y-1 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  <span>{selectedEntry.origin.name}</span>
                </div>
                {selectedEntry.target && (
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">◆</span>
                    <span>{selectedEntry.target.name}</span>
                  </div>
                )}
                {selectedEntry.destination && selectedEntry.destination.name !== selectedEntry.origin.name && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">●</span>
                    <span>{selectedEntry.destination.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            {selectedEntry.isSignificant && (
              <div className={`
                mt-2 px-2 py-1.5 rounded border
                ${isDark ? 'bg-red-900/30 border-red-700/40' : 'bg-red-50 border-red-200'}
              `}>
                <span className={`text-[9px] font-typewriter uppercase tracking-wider ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                  ★ Significant Event
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightInfoPanel;
