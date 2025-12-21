import React, { useRef, useEffect, useState } from 'react';
import { LogEntry, Phase } from '../types';
import { Star, Paperclip, UserCircle } from 'lucide-react';

interface LogbookPanelProps {
  entries: LogEntry[];
  selectedId: string | null;
  onSelect: (entry: LogEntry) => void;
  filterPhase: Phase | 'ALL';
  setFilterPhase: (phase: Phase | 'ALL') => void;
  onOpenProfile: () => void;
  showSignificantOnly: boolean;
  setShowSignificantOnly: (show: boolean) => void;
}

const LogbookPanel: React.FC<LogbookPanelProps> = React.memo(({
  entries,
  selectedId,
  onSelect,
  filterPhase,
  setFilterPhase,
  onOpenProfile,
  showSignificantOnly,
  setShowSignificantOnly
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLTableRowElement>(null);

  // Auto-scroll to selected item
  useEffect(() => {
    if (selectedId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId]);

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] border-r-4 border-stone-800 shadow-2xl z-10 font-old-print relative">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] z-0"></div>

      {/* Header / Binding */}
      <div className="px-2 md:px-4 py-2 md:py-3 bg-stone-800 text-stone-200 shadow-md sticky top-0 z-20 border-b-4 border-stone-900">
        {/* Mobile: Compact single-row header */}
        <div className="md:hidden flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-typewriter tracking-wider text-amber-500 uppercase leading-none truncate">
              RAF Flight Book
            </h2>
          </div>
          <button 
            onClick={onOpenProfile}
            className="flex-shrink-0 flex items-center gap-1.5 bg-stone-700 hover:bg-stone-600 border border-stone-600 text-amber-500 px-2 py-1.5 rounded-sm transition-all shadow-sm"
            aria-label="View Service Record"
          >
            <UserCircle className="w-4 h-4" />
            <span className="font-typewriter text-[9px] uppercase tracking-wider font-bold hidden xs:inline">Profile</span>
          </button>
        </div>

        {/* Desktop: Responsive header that adapts to panel width */}
        <div className="hidden md:flex items-center justify-between gap-2 mb-2">
            <div className="min-w-0 flex-shrink">
                <h2 className="text-lg lg:text-2xl font-typewriter tracking-widest text-amber-500 uppercase leading-none truncate">
                RAF Flight Book
                </h2>
                <p className="text-[9px] lg:text-[10px] font-typewriter text-stone-500 mt-0.5 opacity-80 truncate">313 Czech Squadron</p>
            </div>
            
            <div className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
                <div className="text-sm lg:text-lg font-handwriting text-stone-100 whitespace-nowrap">Robin Glen</div>
                <button 
                    onClick={onOpenProfile}
                    className="flex items-center gap-1 lg:gap-1.5 bg-stone-700 hover:bg-stone-600 border border-stone-600 hover:border-amber-600/50 text-amber-500 hover:text-amber-400 px-1.5 lg:px-2 py-1 rounded-sm transition-all shadow-sm group"
                    title="View Service Record"
                >
                    <UserCircle className="w-3 h-3 group-hover:scale-105 transition-transform" />
                    <span className="font-typewriter text-[8px] lg:text-[9px] uppercase tracking-wider font-bold whitespace-nowrap hidden [@media(min-width:420px)]:inline">View</span>
                </button>
            </div>
        </div>
        
        {/* Phase Tabs - responsive */}
        <div className="flex items-center justify-between mt-1.5 md:mt-2 border-t border-stone-700 pt-1.5 md:pt-2 gap-1">
          {/* Phase filter tabs - compact layout */}
          <div className="flex gap-0 min-w-0 flex-shrink">
            <button
                onClick={() => setFilterPhase('ALL')}
                className={`flex-shrink-0 px-1.5 lg:px-2 py-1 text-[9px] lg:text-[10px] font-typewriter uppercase tracking-wider transition-colors ${
                filterPhase === 'ALL' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-300'
                }`}
            >
                All
            </button>
            {Object.values(Phase).map((phase) => {
                // Compact labels for narrow widths
                const getPhaseLabel = () => {
                  if (phase === Phase.COMBAT) return 'War';
                  if (phase === Phase.FERRY) return 'Ferry';
                  if (phase === Phase.TRAINING) return 'Training';
                  return phase;
                };
                return (
                  <button
                    key={phase}
                    onClick={() => setFilterPhase(phase)}
                    className={`flex-shrink-0 px-1.5 lg:px-2 py-1 text-[9px] lg:text-[10px] font-typewriter uppercase tracking-wider transition-colors ${
                        filterPhase === phase ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    {getPhaseLabel()}
                  </button>
                );
            })}
          </div>

          {/* Filter checkbox - very compact */}
          <label 
            htmlFor="sigOnly" 
            className="flex items-center gap-1 flex-shrink-0 cursor-pointer group"
            title="Exclude routine operations - show only significant events"
          >
              <input 
                type="checkbox" 
                id="sigOnly" 
                checked={showSignificantOnly} 
                onChange={(e) => setShowSignificantOnly(e.target.checked)}
                className="w-3 h-3 accent-amber-600 bg-stone-700 border-stone-600 rounded focus:ring-amber-500 focus:ring-1"
              />
              <span className="text-[8px] lg:text-[9px] font-typewriter text-stone-400 uppercase tracking-wide group-hover:text-stone-200 whitespace-nowrap">
                <span className="hidden [@media(min-width:500px)]:inline">Important Only</span>
                <Star className="w-3 h-3 inline [@media(min-width:500px)]:hidden" />
              </span>
          </label>
        </div>
      </div>

      {/* Logbook Grid */}
      <div className="flex-1 overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-stone-400 scrollbar-track-[#f4f1ea]" ref={scrollRef}>
        <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-[#e8e4db] text-stone-600 sticky top-0 shadow-sm font-typewriter text-[8px] lg:text-[10px] uppercase tracking-wider z-10">
                <tr>
                    <th className="p-0.5 lg:p-1.5 border-r border-stone-400 w-[72px] lg:w-24">Date</th>
                    <th className="p-0.5 lg:p-1.5 border-r border-stone-400 w-[56px] lg:w-20">
                      <span className="hidden lg:inline">Aircraft</span>
                      <span className="lg:hidden">A/C</span>
                    </th>
                    <th className="p-0.5 lg:p-1.5 border-r border-stone-400 w-10 lg:w-14 text-center">
                      <span className="hidden lg:inline">Time</span>
                      <span className="lg:hidden">Hrs</span>
                    </th>
                    <th className="p-0.5 lg:p-1.5 border-r border-stone-400">
                      <span className="hidden lg:inline">Duty & Remarks</span>
                      <span className="lg:hidden">Duty</span>
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-400/50">
                {entries.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-4 lg:p-8 text-center font-handwriting text-base lg:text-xl text-stone-500">
                            {showSignificantOnly ? "No significant events in this phase." : "No entries recorded for this period."}
                        </td>
                    </tr>
                ) : (
                    entries.map((entry) => {
                    const isSelected = selectedId === entry.id;
                    const isDDay = entry.date === '1944-06-06';
                    const hasNote = !!entry.historicalNote;
                    
                    return (
                        <tr
                            key={entry.id}
                            ref={isSelected ? selectedRef : null}
                            onClick={() => onSelect(entry)}
                            className={`
                                cursor-pointer group transition-colors duration-150 relative
                                ${isSelected ? 'bg-amber-100/60' : 'hover:bg-stone-200/40 active:bg-stone-200/60'}
                                ${isDDay ? 'bg-red-50/50' : ''}
                            `}
                        >
                            {/* Date Column with Selection Bar Inside */}
                            <td className="p-0.5 lg:p-1.5 border-r border-stone-400 font-typewriter text-[8px] lg:text-[10px] text-stone-800 align-top relative">
                                {isSelected && (
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 lg:w-1.5 bg-amber-600 z-10 shadow-sm"></div>
                                )}
                                <span className="hidden lg:inline">{entry.date}</span>
                                <span className="lg:hidden">{entry.date.slice(5)}</span>
                                {hasNote && !isSelected && (
                                    <Paperclip className="w-2 lg:w-3 h-2 lg:h-3 text-red-800 absolute top-0.5 right-0 lg:right-1 opacity-60" aria-label="View Notes" />
                                )}
                            </td>

                            {/* Aircraft */}
                            <td className="p-0.5 lg:p-1.5 border-r border-stone-400 font-typewriter text-[8px] lg:text-[10px] font-bold text-stone-900 align-top truncate max-w-0">
                                <span className="hidden lg:inline">{entry.aircraftType}</span>
                                <span className="lg:hidden">{entry.aircraftType.split(' ')[0]}</span>
                            </td>

                            {/* Time */}
                            <td className="p-0.5 lg:p-1.5 border-r border-stone-400 font-handwriting text-[9px] lg:text-xs text-stone-800 text-center align-top">
                                {entry.time}
                            </td>

                            {/* Remarks - condensed layout */}
                            <td className="p-0.5 lg:p-1.5 relative align-top overflow-hidden">
                                <div className="font-handwriting text-xs lg:text-base text-blue-900 leading-tight line-clamp-1 lg:line-clamp-none">
                                    {entry.duty}
                                </div>
                                {/* Large screens: full remarks */}
                                <div className="hidden lg:block font-handwriting text-sm text-stone-600 mt-0.5 pl-1.5 border-l-2 border-stone-300 line-clamp-2">
                                    {entry.remarks}
                                </div>
                                {/* Condensed: Show very brief remarks */}
                                <div className="lg:hidden font-handwriting text-[10px] text-stone-600 mt-0.5 line-clamp-1 opacity-70">
                                    {entry.remarks}
                                </div>
                                {isDDay && (
                                    <div className="absolute top-0 right-0 opacity-20 transform rotate-12">
                                        <div className="border lg:border-4 border-red-800 text-red-800 font-bold text-[6px] lg:text-xs px-0.5 lg:px-2 py-0 lg:py-1 uppercase tracking-widest rounded-sm font-typewriter">
                                            D-Day
                                        </div>
                                    </div>
                                )}
                                {hasNote && (
                                    <div className="absolute bottom-0 right-0">
                                        <span className="text-[7px] lg:text-[9px] font-typewriter text-red-800 uppercase bg-red-50 border border-red-200 px-0.5 rounded opacity-50 group-hover:opacity-100 transition-opacity">
                                            <span className="hidden lg:inline">Notes</span>
                                            <Star className="w-2 h-2 lg:hidden inline" />
                                        </span>
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                    })
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
});

export default LogbookPanel;