
import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { AIRCRAFT_SPECS } from '../services/flightData';
import { FolderOpen, Plane, FileText, ChevronLeft, ChevronRight, BookOpen, Maximize2, ExternalLink } from 'lucide-react';
import ImageModal from './ImageModal';
import StickyNote from './StickyNote';

interface ContextPanelProps {
  selectedEntry: LogEntry | null;
}
type Tab = 'MISSION' | 'AIRCRAFT' | 'LOGBOOK';

const ContextPanel: React.FC<ContextPanelProps> = React.memo(({ selectedEntry }) => {
  const [activeTab, setActiveTab] = useState<Tab>('MISSION');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset transcription view when entry changes
  useEffect(() => {
    setGalleryIndex(0);
    setFullscreenImage(null);
  }, [selectedEntry?.id]);

  if (!selectedEntry) {
    return (
      <div className="bg-[#f4f1ea] border-t-4 border-stone-800 p-6 flex flex-col items-center justify-center text-center h-full shadow-inner relative z-20">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] pointer-events-none"></div>
         <div className="opacity-40">
            <FolderOpen className="w-12 h-12 text-stone-800 mx-auto mb-2" />
            <p className="font-typewriter text-stone-600 text-sm">SELECT ENTRY FOR DETAILS</p>
         </div>
      </div>
    );
  }

  const isDDay = selectedEntry.date === '1944-06-06';
  const aircraftSpec = AIRCRAFT_SPECS[selectedEntry.aircraftType];
  const missionBrief = selectedEntry.missionBrief;
  const missionSlides = missionBrief?.slides ?? [];
  const galleryLength = missionSlides.length;
  const hasMissionSlides = galleryLength > 0;
  const galleryPosition = hasMissionSlides
    ? ((galleryIndex % galleryLength) + galleryLength) % galleryLength
    : 0;
  const activeMissionSlide = hasMissionSlides ? missionSlides[galleryPosition] : null;
  const activeGalleryImage = activeMissionSlide?.image ?? null;
  const activeSlideText = activeMissionSlide?.text;
  const canNavigateGallery = galleryLength > 1;
  const missionBriefVisible = hasMissionSlides;
  const hasSlideText = Boolean(activeSlideText);
  const goToPreviousImage = () => {
    if (!galleryLength) return;
    setGalleryIndex((prev) => (prev - 1 + galleryLength) % galleryLength);
  };
  const goToNextImage = () => {
    if (!galleryLength) return;
    setGalleryIndex((prev) => (prev + 1) % galleryLength);
  };

  // Base path for logbook images (served via vite-plugin-static-copy)
  const logbookImageSrc = selectedEntry.sourceDocument 
    ? `${import.meta.env.BASE_URL}logbook-images/${selectedEntry.sourceDocument}` 
    : null;

  return (
    <div className={`
        bg-[#f4f1ea] border-t-4 border-stone-800 p-0 flex flex-col shadow-inner relative z-20 overflow-hidden h-full
        ${isDDay ? 'bg-red-50' : ''}
    `}>
        {/* Paper texture */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] pointer-events-none"></div>

        {/* Tab Header */}
        <div className="bg-stone-200 border-b border-stone-300 flex relative z-10">
             <button 
                onClick={() => setActiveTab('MISSION')}
                className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-typewriter uppercase tracking-wider transition-colors border-r border-stone-300
                    ${activeTab === 'MISSION' ? 'bg-[#f4f1ea] text-stone-900 font-bold shadow-[0_2px_0_#f4f1ea]' : 'bg-stone-300 text-stone-500 hover:bg-stone-200'}`}
             >
                <FileText className="w-3 h-3" /> Mission
             </button>
             <button 
                onClick={() => setActiveTab('LOGBOOK')}
                disabled={!logbookImageSrc}
                className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-typewriter uppercase tracking-wider transition-colors border-r border-stone-300
                    ${activeTab === 'LOGBOOK' ? 'bg-[#f4f1ea] text-stone-900 font-bold shadow-[0_2px_0_#f4f1ea]' : 'bg-stone-300 text-stone-500 hover:bg-stone-200'}
                    ${!logbookImageSrc ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                <BookOpen className="w-3 h-3" /> Logbook
             </button>
             <button 
                onClick={() => setActiveTab('AIRCRAFT')}
                className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-typewriter uppercase tracking-wider transition-colors
                    ${activeTab === 'AIRCRAFT' ? 'bg-[#f4f1ea] text-stone-900 font-bold shadow-[0_2px_0_#f4f1ea]' : 'bg-stone-300 text-stone-500 hover:bg-stone-200'}`}
             >
                <Plane className="w-3 h-3" /> Aircraft
             </button>
        </div>

        <div className="p-5 relative z-10 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-stone-400">
             <div className="max-w-2xl mx-auto w-full">
             {/* Title */}
             <h3 className="font-typewriter text-lg font-bold text-stone-900 mb-1 border-b-2 border-stone-800 inline-block pb-1">
                {selectedEntry.origin.name} 
                {selectedEntry.destination && selectedEntry.destination.name !== selectedEntry.origin.name && ` ➝ ${selectedEntry.destination.name}`}
             </h3>
             <p className="font-mono text-[10px] text-stone-500 mb-4">DATE: {selectedEntry.date}</p>

             {/* Content Switching */}
             {activeTab === 'MISSION' && (
                 <div className="mt-2 font-old-print text-stone-800 leading-relaxed text-sm animate-in fade-in duration-300 space-y-6">
                    
                    {/* Historical Context */}
                    {selectedEntry.historicalNote && (
                        <div className="relative">
                            <div className="bg-[#f8f5f0] p-4 shadow-sm border border-stone-300 relative">
                                <div className="mb-2 border-b border-stone-300 pb-1 flex justify-between items-end">
                                    <span className="font-typewriter text-[10px] uppercase tracking-widest text-stone-500">Historical Record</span>
                                    <span className="font-typewriter text-[10px] text-stone-400">{selectedEntry.date}</span>
                                </div>
                                <p className="whitespace-pre-line font-typewriter text-sm text-stone-800 leading-relaxed">
                                    {selectedEntry.historicalNote}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Pilot's Notes (Handwritten style) */}
                    {selectedEntry.pilotNotes && (
                        <div className="relative transform rotate-1">
                            <div className="flex items-end justify-between mb-2">
                                <h4 className="font-typewriter text-xs font-bold uppercase text-stone-600 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-stone-800 rounded-full"></span>
                                    Pilot's Log 
                                </h4>
                                <button 
                                    onClick={() => setActiveTab('LOGBOOK')}
                                    disabled={!logbookImageSrc}
                                    className={`flex items-center gap-1.5 text-[10px] font-mono transition-all ${!logbookImageSrc ? 'opacity-0 cursor-default hidden' : 'text-stone-400 hover:text-stone-700 cursor-pointer hover:underline'}`}
                                >
                                    <BookOpen className="w-3 h-3" />
                                    <span>View in Logbook</span>
                                </button>
                            </div>
                            <div className="font-handwriting text-xl text-blue-900 leading-snug bg-[#fffdf5] p-5 pb-8 border border-stone-200 shadow-md rounded-sm relative">
                                "{selectedEntry.pilotNotes}"
                                <div className="absolute bottom-2 right-3 text-stone-400 font-serif italic text-[11px]">
                                    - by R. Glen
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedEntry.customView === 'gradebook' ? (
                        <div className="mb-6">
                           <div className="flex justify-between items-end mb-2">
                              <h4 className="font-typewriter text-sm font-bold uppercase text-stone-700">Summary of Flying & Assessments</h4>
                              <span className="font-mono text-xs text-stone-500">Form 414A (May 26, 1944)</span>
                           </div>
                           
                           <table className="w-full text-sm font-old-print border-collapse border border-stone-400 bg-white">
                              <thead className="bg-stone-200 font-typewriter text-xs uppercase text-stone-600">
                                 <tr>
                                    <th className="border border-stone-400 p-2 text-left">Ability Category</th>
                                    <th className="border border-stone-400 p-2 text-left">Assessment</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr>
                                    <td className="border border-stone-400 p-2 font-bold text-stone-800">As a Pilot</td>
                                    <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">Good Average</td>
                                 </tr>
                                 <tr>
                                    <td className="border border-stone-400 p-2 font-bold text-stone-800">As Pilot-Navigator</td>
                                    <td className="border border-stone-400 p-2 text-stone-400 italic">N/A</td>
                                 </tr>
                                 <tr>
                                    <td className="border border-stone-400 p-2 font-bold text-stone-800">In Bombing</td>
                                    <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">Average</td>
                                 </tr>
                                 <tr>
                                    <td className="border border-stone-400 p-2 font-bold text-stone-800">As Air Gunner</td>
                                    <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">Average</td>
                                 </tr>
                                 <tr>
                                    <td className="border border-stone-400 p-2 font-bold text-stone-800">Rocket Propelled Bombs</td>
                                    <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">Above Average</td>
                                 </tr>
                                 <tr>
                                    <td className="border border-stone-400 p-2 font-bold text-stone-800">Areas Needing Improvement</td>
                                    <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">None</td>
                                 </tr>
                              </tbody>
                           </table>
                           <button 
                             onClick={() => setFullscreenImage(`${import.meta.env.BASE_URL}report-card.png`)}
                             className="mt-3 text-xs flex items-center gap-1 text-amber-700 hover:text-amber-900 font-bold font-typewriter uppercase tracking-wider transition-colors"
                           >
                             <ExternalLink className="w-3 h-3" /> View Original Report Card
                           </button>
                           <p className="mt-2 font-mono text-xs text-stone-500 italic">
                              "Any points in flying or airmanship which should be watched" — [BLANK]
                           </p>
                           <p className="mt-4 font-mono text-[10px] text-stone-400 border-t border-stone-200 pt-2 leading-tight">
                              * Historical Context: In RAF evaluations of this period, "Average" and "Good Average" denoted a fully proficient, reliable pilot trusted with operational duties. "Above Average" was rare, typically reserved for exceptional test-pilot level handling.
                           </p>
                        </div>
                    ) : (
                    <>
                    
                    {!selectedEntry.pilotNotes && !selectedEntry.historicalNote && (
                        <div className="text-stone-500 italic font-handwriting text-lg pl-4 border-l-4 border-stone-300 py-2">
                            "Routine flight operations. No special incident reports filed for this date."
                        </div>
                    )}

                    {/* Mission Brief / Annotation (Gallery) */}
                    {missionBriefVisible && (
                         <div className="mt-6 border-t border-stone-300 pt-4">
                            <h4 className="font-typewriter text-xs font-bold uppercase text-stone-600 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-stone-500 rounded-full"></span>
                                Mission Artifacts
                            </h4>
                            
                            {hasMissionSlides && (
                                <div className="space-y-2">
                                    <div className="mb-3 border-4 border-white shadow-md max-w-[50rem] mx-auto rotate-1 transition-transform hover:rotate-0 group relative">
                                        <div className="relative">
                                            <img 
                                                src={activeGalleryImage ?? undefined}
                                                alt="Mission brief note" 
                                                className="w-full h-auto object-cover sepia-[0.5] cursor-zoom-in"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x200/e8e4db/57534e?text=Original+Handwritten+Note';
                                                }}
                                                onClick={() => activeGalleryImage && setFullscreenImage(activeGalleryImage)}
                                            />
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white p-1 rounded">
                                                 <Maximize2 className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {canNavigateGallery && (
                                        <div className="flex items-center justify-between text-[10px] font-typewriter uppercase tracking-[0.3em] text-stone-600 px-4">
                                            <button
                                                type="button"
                                                onClick={goToPreviousImage}
                                                className="flex items-center justify-center w-8 h-8 rounded-full border border-stone-300 bg-white/90 text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
                                            >
                                                <ChevronLeft className="w-3 h-3" />
                                            </button>
                                            <span>
                                                Image {galleryPosition + 1} of {galleryLength}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={goToNextImage}
                                                className="flex items-center justify-center w-8 h-8 rounded-full border border-stone-300 bg-white/90 text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
                                            >
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {hasSlideText && (
                                <div className="mt-4">
                                    <StickyNote className="w-full max-w-none transform -rotate-1">
                                        <div dangerouslySetInnerHTML={{ __html: activeSlideText }} />
                                    </StickyNote>
                                </div>
                            )}
                         </div>
                    )}
                  </>
                )}
                 </div>
             )}

            {activeTab === 'LOGBOOK' && logbookImageSrc && (
                <div className="mt-2 animate-in fade-in duration-300 flex flex-col h-full">
                    <div className="mb-4 bg-stone-800 text-stone-200 p-3 text-xs font-mono rounded-sm shadow-sm border border-stone-700">
                        <p className="uppercase tracking-widest mb-1 text-stone-400">Source Document</p>
                        <p className="break-all">{selectedEntry.sourceDocument}</p>
                    </div>
                    
                    <div className="relative group border-8 border-stone-200 shadow-lg bg-stone-100 flex-1 min-h-[300px] flex items-center justify-center overflow-hidden cursor-zoom-in"
                         onClick={() => setFullscreenImage(logbookImageSrc)}
                    >
                        <img 
                            src={logbookImageSrc} 
                            alt={`Logbook page ${selectedEntry.sourceDocument}`}
                            className="w-full h-full object-contain sepia-[0.3]"
                        />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none">
                            <div className="bg-stone-900/80 text-white px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                <Maximize2 className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">View Fullscreen</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-center mt-3 font-typewriter text-[10px] text-stone-500">
                        CLICK IMAGE TO INSPECT ORIGINAL DOCUMENT
                    </p>
                </div>
            )}

            {activeTab === 'AIRCRAFT' && (
                <div className="mt-2 animate-in fade-in duration-300">
                    {aircraftSpec ? (
                        <div className="border-2 border-stone-400 p-1 bg-blue-50/30">
                            <div className="border border-stone-400 p-3">
                                <h4 className="font-typewriter text-sm font-bold uppercase text-stone-800 border-b border-stone-400 mb-3 pb-1">
                                    Technical Specifications
                                </h4>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 font-mono text-xs text-stone-700">
                                    <div className="text-stone-500">MODEL:</div>
                                    <div className="font-bold">{aircraftSpec.name}</div>
                                    
                                    <div className="text-stone-500">ROLE:</div>
                                    <div className="font-bold">{aircraftSpec.role}</div>
                                    
                                    <div className="text-stone-500">MAX SPEED:</div>
                                    <div>{aircraftSpec.maxSpeed}</div>
                                    
                                    <div className="text-stone-500">RANGE:</div>
                                    <div>{aircraftSpec.range}</div>
                                </div>
                                <div className="font-old-print text-sm text-stone-800 border-t border-dashed border-stone-400 pt-2">
                                    {aircraftSpec.description}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-stone-500 italic text-sm text-center py-4">
                            No detailed specifications available for {selectedEntry.aircraftType}.
                        </div>
                    )}
                </div>
            )}

             {/* Footer Info */}
             <div className="mt-6 pt-4 border-t border-stone-300 flex justify-between items-end">
                <div>
                    <span className="block font-typewriter text-[10px] text-stone-500 uppercase">Aircraft Type</span>
                    <button 
                        onClick={() => setActiveTab('AIRCRAFT')}
                        className="font-typewriter text-sm font-bold text-stone-900 hover:text-amber-700 hover:underline decoration-amber-700/50 decoration-2 transition-all text-left cursor-pointer"
                    >
                        {selectedEntry.aircraftType}
                    </button>
                </div>
                <div>
                     <span className="block font-typewriter text-[10px] text-stone-500 uppercase text-right">Flight Duration</span>
                    <span className="font-handwriting text-xl">{selectedEntry.time} hrs</span>
                </div>
             </div>
             </div>
        </div>
        <ImageModal
            isOpen={!!fullscreenImage}
            onClose={() => setFullscreenImage(null)}
            imageSrc={fullscreenImage}
            altText="Handwritten logbook detail"
        />
    </div>
  );
});

export default ContextPanel;
