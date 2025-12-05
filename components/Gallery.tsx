import React, { useState, useRef, useEffect, TouchEvent } from 'react';
import { FLIGHT_LOG } from '../services/flightData';
import { MissionBriefSlide } from '../types';
import { X, ChevronLeft, ChevronRight, Images, BookOpen, Film, Play, ArrowLeft } from 'lucide-react';

const BASE_ASSET_URL = import.meta.env.BASE_URL;

interface GalleryItem extends MissionBriefSlide {
  id: string;
  sourceEntryId: string;
  sourceEntryDate: string;
}

type GalleryTab = 'photos' | 'logbook' | 'videos';

// Logbook pages range from 058 to 086
const LOGBOOK_PAGES = Array.from({ length: 29 }, (_, i) => {
  const pageNum = (58 + i).toString().padStart(3, '0');
  return {
    id: pageNum,
    src: `${BASE_ASSET_URL}logbook-images/${pageNum}.jpg`,
    label: `Page ${pageNum}`,
  };
});

// Historical videos about WW2 Spitfires and RAF operations
const HISTORICAL_VIDEOS = [
  {
    id: 'raf-combat-footage',
    youtubeId: 'R0n9ZgRiXNs',
    title: 'Combat Footage - RAF Cameras',
    description: 'Authentic combat footage captured by RAF gun cameras during World War II aerial engagements.',
  },
  {
    id: 'raf-spitfires-action',
    youtubeId: 'crp9LBuzQkE',
    title: 'RAF Spitfires in Action',
    description: 'Historical footage of RAF Spitfires in combat operations during the Second World War.',
  },
  {
    id: 'dunkirk',
    youtubeId: 'Z52vVsMdBkc',
    title: 'Dunkirk',
    description: "This is not historical footage - it's the Hollywood movie Dunkirk - but it's such a good scene of being a Spitfire pilot.",
  },
];

export const Gallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GalleryTab>('photos');
  const [selectedSlide, setSelectedSlide] = useState<GalleryItem | null>(null);
  const [selectedLogbookIndex, setSelectedLogbookIndex] = useState<number | null>(null);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const logbookContainerRef = useRef<HTMLDivElement>(null);
  
  // Touch handling for swipe gestures
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const galleryItems: GalleryItem[] = FLIGHT_LOG.flatMap((entry) => {
    if (!entry.missionBrief || !entry.missionBrief.slides) return [];
    return entry.missionBrief.slides.map((slide, index) => ({
      ...slide,
      id: `${entry.id}-slide-${index}`,
      sourceEntryId: entry.id,
      sourceEntryDate: entry.date,
    }));
  });

  const tabClass = (tab: GalleryTab) =>
    `flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 border-b-2 flex-1 sm:flex-initial ${
      activeTab === tab
        ? 'text-amber-500 border-amber-500 bg-stone-800/50'
        : 'text-stone-400 border-transparent hover:text-stone-200 hover:bg-stone-800/30'
    }`;

  // Handle keyboard navigation for logbook viewer and video escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expandedVideoId) {
          setExpandedVideoId(null);
        } else if (selectedLogbookIndex !== null) {
          setSelectedLogbookIndex(null);
        }
        return;
      }
      
      if (selectedLogbookIndex === null) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedLogbookIndex(Math.max(0, selectedLogbookIndex - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedLogbookIndex(Math.min(LOGBOOK_PAGES.length - 1, selectedLogbookIndex + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLogbookIndex, expandedVideoId]);

  // Touch handlers for swipe navigation in logbook viewer
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || selectedLogbookIndex === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    // Only trigger if horizontal swipe is dominant and significant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - go to previous
        setSelectedLogbookIndex(Math.max(0, selectedLogbookIndex - 1));
      } else {
        // Swipe left - go to next
        setSelectedLogbookIndex(Math.min(LOGBOOK_PAGES.length - 1, selectedLogbookIndex + 1));
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-900">
      {/* Tab Navigation */}
      <div className="flex border-b border-stone-700 bg-stone-950 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('photos')}
          className={tabClass('photos')}
          aria-label="Photos"
        >
          <Images size={18} className="shrink-0" />
          <span className="truncate">Photos</span>
        </button>
        <button
          onClick={() => setActiveTab('logbook')}
          className={tabClass('logbook')}
          aria-label="Logbook"
        >
          <BookOpen size={18} className="shrink-0" />
          <span className="truncate">Logbook</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={tabClass('videos')}
          aria-label="Videos"
        >
          <Film size={18} className="shrink-0" />
          <span className="truncate">Videos</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col bg-stone-800 rounded-lg overflow-hidden border border-stone-700 hover:border-amber-500/50 transition-colors cursor-pointer shadow-lg active:scale-[0.98] transition-transform"
                  onClick={() => setSelectedSlide(item)}
                >
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={item.image}
                      alt="Mission Slide"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="text-xs text-amber-500/80 mb-1 font-mono">{item.sourceEntryDate}</div>
                    {item.text && (
                      <p className="text-stone-300 text-sm line-clamp-3 font-serif">
                        {item.text.replace(/<br>/g, ' ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {galleryItems.length === 0 && (
              <div className="text-center text-stone-500 py-16">
                <Images size={48} className="mx-auto mb-4 opacity-50" />
                <p>No mission photos available yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Logbook Tab */}
        {activeTab === 'logbook' && (
          <div className="p-4 sm:p-6 md:p-8" ref={logbookContainerRef}>
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 sm:mb-6 text-center">
                <h2 className="text-lg sm:text-xl font-serif text-amber-500 mb-2">Robin Glen's Flying Logbook</h2>
                <p className="text-stone-400 text-xs sm:text-sm px-2">
                  Original handwritten pages from 1944-1946. Tap any page to view full size.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {LOGBOOK_PAGES.map((page, index) => (
                  <div
                    key={page.id}
                    className="group cursor-pointer bg-stone-800 rounded-lg overflow-hidden border border-stone-700 hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.99] transition-transform"
                    onClick={() => setSelectedLogbookIndex(index)}
                  >
                    <div className="relative">
                      <img
                        src={page.src}
                        alt={page.label}
                        className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4">
                        <span className="text-stone-200 font-mono text-xs sm:text-sm">{page.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Historical Videos Tab */}
        {activeTab === 'videos' && (
          <div className="p-4 sm:p-6 md:p-8 relative">
            <div className="max-w-5xl mx-auto">
              {/* Header - fades out when video expanded */}
              <div 
                className={`mb-6 sm:mb-8 text-center transition-all duration-500 ease-out ${
                  expandedVideoId ? 'opacity-0 pointer-events-none h-0 mb-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                <h2 className="text-lg sm:text-xl font-serif text-amber-500 mb-2">Historical Videos</h2>
                <div className="bg-stone-800 border border-amber-500/30 rounded-lg px-3 sm:px-4 py-2 mt-2 mx-auto max-w-lg">
                  <p className="text-stone-300 text-xs sm:text-sm">
                    <span className="text-amber-500">Note:</span> These videos provide general historical context about WW2 Spitfires and RAF operations. 
                    They are not specifically about Robin Glen.
                  </p>
                </div>
              </div>

              {/* Video Grid / Cinematic View Container */}
              <div className="relative">
                {/* Expanded Cinematic View */}
                <div
                  className={`transition-all duration-500 ease-out ${
                    expandedVideoId 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 pointer-events-none absolute inset-0 -translate-y-4'
                  }`}
                >
                  {expandedVideoId && (
                    <div className="animate-fadeIn">
                      {/* Back Button */}
                      <button
                        onClick={() => setExpandedVideoId(null)}
                        className="flex items-center gap-2 mb-4 text-stone-400 hover:text-amber-500 transition-colors group"
                      >
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-medium">Back to videos</span>
                      </button>
                      
                      {/* Large Video Player */}
                      <div className="bg-stone-800 rounded-xl overflow-hidden border border-stone-700 shadow-2xl">
                        <div className="aspect-video w-full">
                          <iframe
                            src={`https://www.youtube.com/embed/${expandedVideoId}?autoplay=1`}
                            title={HISTORICAL_VIDEOS.find(v => v.youtubeId === expandedVideoId)?.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                        <div className="p-4 sm:p-6">
                          <h3 className="text-xl sm:text-2xl font-serif text-stone-100 mb-2">
                            {HISTORICAL_VIDEOS.find(v => v.youtubeId === expandedVideoId)?.title}
                          </h3>
                          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
                            {HISTORICAL_VIDEOS.find(v => v.youtubeId === expandedVideoId)?.description}
                          </p>
                        </div>
                      </div>

                      {/* Keyboard hint */}
                      <div className="hidden md:block text-center mt-4 text-stone-500 text-xs">
                        Press ESC to go back
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Grid */}
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-500 ease-out ${
                    expandedVideoId 
                      ? 'opacity-0 pointer-events-none scale-95 absolute top-0 left-0 right-0' 
                      : 'opacity-100 scale-100'
                  }`}
                >
                  {HISTORICAL_VIDEOS.map((video, index) => (
                    <div
                      key={video.id}
                      onClick={() => setExpandedVideoId(video.youtubeId)}
                      className="group cursor-pointer bg-stone-800 rounded-lg overflow-hidden border border-stone-700 hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeSlideIn 0.4s ease-out backwards'
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors duration-300">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/90 group-hover:bg-amber-500 group-hover:scale-110 flex items-center justify-center shadow-lg transition-all duration-300">
                            <Play size={24} className="text-stone-900 ml-1" fill="currentColor" />
                          </div>
                        </div>
                        {/* Duration-style badge (decorative) */}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-stone-200 text-xs px-1.5 py-0.5 rounded font-mono">
                          VIDEO
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-3 sm:p-4">
                        <h3 className="text-base sm:text-lg font-serif text-stone-100 mb-1 group-hover:text-amber-500 transition-colors line-clamp-1">
                          {video.title}
                        </h3>
                        <p className="text-stone-400 text-xs sm:text-sm leading-relaxed line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dimmed overlay when video is expanded */}
            <div 
              className={`fixed inset-0 bg-black/60 -z-10 transition-opacity duration-500 ${
                expandedVideoId ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setExpandedVideoId(null)}
            />
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedSlide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2 sm:p-4 backdrop-blur-sm" 
          onClick={() => setSelectedSlide(null)}
        >
          <div 
            className="relative bg-stone-800 rounded-lg w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-600"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - larger touch target on mobile */}
            <button
              onClick={() => setSelectedSlide(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 sm:p-2 bg-black/60 hover:bg-black/80 rounded-full text-stone-200 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            <div className="flex flex-col md:flex-row h-full overflow-auto">
              {/* Image container - takes more space on mobile */}
              <div className="w-full md:w-2/3 bg-black flex items-center justify-center p-2 min-h-[40vh] md:min-h-0">
                <img
                  src={selectedSlide.image}
                  alt="Full Slide"
                  className="max-h-[50vh] md:max-h-[80vh] max-w-full object-contain"
                />
              </div>
              {/* Text sidebar - scrollable on mobile */}
              <div className="w-full md:w-1/3 p-4 sm:p-6 overflow-y-auto bg-stone-800 border-t md:border-t-0 md:border-l border-stone-700 max-h-[40vh] md:max-h-none">
                <div className="text-xs sm:text-sm text-amber-500 mb-2 font-mono">{selectedSlide.sourceEntryDate}</div>
                <div 
                  className="text-stone-200 font-serif text-base sm:text-lg leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: selectedSlide.text || '' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logbook Fullscreen Viewer */}
      {selectedLogbookIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm touch-none"
          onClick={() => setSelectedLogbookIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - larger touch target on mobile */}
            <button
              onClick={() => setSelectedLogbookIndex(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2.5 sm:p-2 bg-black/60 hover:bg-black/80 rounded-full text-stone-200 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Page counter */}
            <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-stone-200 font-mono text-xs sm:text-sm">
              {selectedLogbookIndex + 1} / {LOGBOOK_PAGES.length}
            </div>

            {/* Navigation buttons - hidden on mobile (use swipe), visible on tablet+ */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLogbookIndex(Math.max(0, selectedLogbookIndex - 1));
              }}
              disabled={selectedLogbookIndex === 0}
              className="hidden sm:block absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed rounded-full text-stone-200 hover:text-white transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={24} className="sm:w-8 sm:h-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLogbookIndex(Math.min(LOGBOOK_PAGES.length - 1, selectedLogbookIndex + 1));
              }}
              disabled={selectedLogbookIndex === LOGBOOK_PAGES.length - 1}
              className="hidden sm:block absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed rounded-full text-stone-200 hover:text-white transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={24} className="sm:w-8 sm:h-8" />
            </button>

            {/* Mobile navigation buttons - at bottom for easy thumb access */}
            <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 rounded-full px-4 py-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLogbookIndex(Math.max(0, selectedLogbookIndex - 1));
                }}
                disabled={selectedLogbookIndex === 0}
                className="p-2 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 active:text-amber-500 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={28} />
              </button>
              <span className="text-stone-400 text-xs font-mono min-w-[4rem] text-center">
                {selectedLogbookIndex + 1} / {LOGBOOK_PAGES.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLogbookIndex(Math.min(LOGBOOK_PAGES.length - 1, selectedLogbookIndex + 1));
                }}
                disabled={selectedLogbookIndex === LOGBOOK_PAGES.length - 1}
                className="p-2 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 active:text-amber-500 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            {/* Image - fills available space */}
            <img
              src={LOGBOOK_PAGES[selectedLogbookIndex].src}
              alt={LOGBOOK_PAGES[selectedLogbookIndex].label}
              className="max-h-[85vh] sm:max-h-[90vh] max-w-[95vw] sm:max-w-[90vw] object-contain shadow-2xl rounded-lg"
            />

            {/* Keyboard hint - desktop only */}
            <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-4 py-2 text-stone-400 text-xs">
              Use ← → arrow keys to navigate • ESC to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
