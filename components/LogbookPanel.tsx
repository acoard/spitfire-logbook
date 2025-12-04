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
      <div className="px-3 md:px-4 py-2 md:py-3 bg-stone-800 text-stone-200 shadow-md sticky top-0 z-20 border-b-4 border-stone-900">
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

        {/* Desktop: Original full header */}
        <div className="hidden md:flex items-end justify-between mb-2">
            <div>
                <h2 className="text-2xl font-typewriter tracking-widest text-amber-500 uppercase leading-none">
                RAF Flight Book
                </h2>
                <p className="text-[10px] font-typewriter text-stone-500 mt-1 opacity-80">313 Czech Squadron</p>
            </div>
            
            <div className="flex items-center gap-4 mb-0.5">
                <div className="text-xl font-handwriting text-stone-100">Robin Glen</div>
                <button 
                    onClick={onOpenProfile}
                    className="flex items-center gap-2 bg-stone-700 hover:bg-stone-600 border border-stone-600 hover:border-amber-600/50 text-amber-500 hover:text-amber-400 px-2 py-1 rounded-sm transition-all shadow-sm group"
                >
                    <UserCircle className="w-3 h-3 group-hover:scale-105 transition-transform" />
                    <span className="font-typewriter text-[9px] uppercase tracking-widest font-bold">View Service Record</span>
                </button>
            </div>
        </div>
        
        {/* Phase Tabs - responsive */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 border-t border-stone-700 pt-2 gap-2">
          {/* Phase filter tabs - scrollable on mobile */}
          <div className="flex gap-0.5 md:gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <button
                onClick={() => setFilterPhase('ALL')}
                className={`flex-shrink-0 px-2 md:px-3 py-1.5 md:py-1 text-[10px] md:text-xs font-typewriter uppercase tracking-wider transition-colors ${
                filterPhase === 'ALL' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-300'
                }`}
            >
                All
            </button>
            {Object.values(Phase).map((phase) => (
                <button
                key={phase}
                onClick={() => setFilterPhase(phase)}
                className={`flex-shrink-0 px-2 md:px-3 py-1.5 md:py-1 text-[10px] md:text-xs font-typewriter uppercase tracking-wider transition-colors ${
                    filterPhase === phase ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-300'
                }`}
                >
                {phase === Phase.COMBAT ? 'Ops' : phase}
                </button>
            ))}
          </div>

          {/* Filter checkbox - compact on mobile */}
          <div className="flex items-center gap-2 flex-shrink-0">
              <input 
                type="checkbox" 
                id="sigOnly" 
                checked={showSignificantOnly} 
                onChange={(e) => setShowSignificantOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-amber-600 bg-stone-700 border-stone-600 rounded focus:ring-amber-500 focus:ring-1"
              />
              <label htmlFor="sigOnly" className="text-[9px] md:text-[10px] font-typewriter text-stone-400 uppercase tracking-wider cursor-pointer hover:text-stone-200">
                <span className="hidden md:inline">Exclude Routine Operations</span>
                <span className="md:hidden">Key Events Only</span>
              </label>
          </div>
        </div>
      </div>

      {/* Logbook Grid */}
      <div className="flex-1 overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-stone-400 scrollbar-track-[#f4f1ea]" ref={scrollRef}>
        <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-[#e8e4db] text-stone-600 sticky top-0 shadow-sm font-typewriter text-[9px] md:text-[10px] uppercase tracking-wider z-10">
                <tr>
                    <th className="p-1.5 md:p-2 border-r border-stone-400 w-20 md:w-24">Date</th>
                    <th className="p-1.5 md:p-2 border-r border-stone-400 w-16 md:w-24">
                      <span className="hidden md:inline">Aircraft</span>
                      <span className="md:hidden">A/C</span>
                    </th>
                    <th className="p-1.5 md:p-2 border-r border-stone-400 w-10 md:w-16 text-center">
                      <span className="hidden md:inline">Time</span>
                      <span className="md:hidden">Hrs</span>
                    </th>
                    <th className="p-1.5 md:p-2 border-r border-stone-400">Duty & Remarks</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-400/50">
                {entries.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-6 md:p-8 text-center font-handwriting text-lg md:text-xl text-stone-500">
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
                            <td className="p-1.5 md:p-2 border-r border-stone-400 font-typewriter text-[10px] md:text-xs text-stone-800 align-top relative">
                                {isSelected && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-amber-600 z-10 shadow-sm"></div>
                                )}
                                <span className="hidden md:inline">{entry.date}</span>
                                <span className="md:hidden">{entry.date.slice(5)}</span>
                                {hasNote && !isSelected && (
                                    <Paperclip className="w-2.5 md:w-3 h-2.5 md:h-3 text-red-800 absolute top-1 right-0.5 md:right-1 opacity-60" aria-label="View Notes" />
                                )}
                            </td>

                            {/* Aircraft */}
                            <td className="p-1.5 md:p-2 border-r border-stone-400 font-typewriter text-[10px] md:text-xs font-bold text-stone-900 align-top break-words">
                                <span className="hidden md:inline">{entry.aircraftType}</span>
                                <span className="md:hidden">{entry.aircraftType.split(' ')[0]}</span>
                            </td>

                            {/* Time */}
                            <td className="p-1.5 md:p-2 border-r border-stone-400 font-handwriting text-xs md:text-sm text-stone-800 text-center align-top">
                                {entry.time}
                            </td>

                            {/* Remarks */}
                            <td className="p-1.5 md:p-2 relative align-top">
                                <div className="font-handwriting text-base md:text-lg text-blue-900 leading-tight">
                                    {entry.duty}
                                </div>
                                <div className="hidden md:block font-handwriting text-base text-stone-600 mt-1 pl-2 border-l-2 border-stone-300">
                                    {entry.remarks}
                                </div>
                                {/* Mobile: Show truncated remarks */}
                                <div className="md:hidden font-handwriting text-sm text-stone-600 mt-0.5 line-clamp-1">
                                    {entry.remarks}
                                </div>
                                {isDDay && (
                                    <div className="absolute top-1 md:top-2 right-1 md:right-2 opacity-20 transform rotate-12">
                                        <div className="border-2 md:border-4 border-red-800 text-red-800 font-bold text-[8px] md:text-xs px-1 md:px-2 py-0.5 md:py-1 uppercase tracking-widest rounded-sm font-typewriter">
                                            Overlord
                                        </div>
                                    </div>
                                )}
                                {hasNote && (
                                    <div className="absolute bottom-0.5 md:bottom-1 right-0.5 md:right-1">
                                        <span className="text-[8px] md:text-[9px] font-typewriter text-red-800 uppercase bg-red-50 border border-red-200 px-0.5 md:px-1 rounded opacity-50 group-hover:opacity-100 transition-opacity">
                                            Notes
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