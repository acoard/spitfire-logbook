import React, { useState } from 'react';
import { FLIGHT_LOG } from '../services/flightData';
import { MissionBriefSlide } from '../types';
import { X } from 'lucide-react';

interface GalleryItem extends MissionBriefSlide {
  id: string; // Composite ID for key
  sourceEntryId: string;
  sourceEntryDate: string;
}

export const Gallery: React.FC = () => {
  const [selectedSlide, setSelectedSlide] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = FLIGHT_LOG.flatMap((entry) => {
    if (!entry.missionBrief || !entry.missionBrief.slides) return [];
    return entry.missionBrief.slides.map((slide, index) => ({
      ...slide,
      id: `${entry.id}-slide-${index}`,
      sourceEntryId: entry.id,
      sourceEntryDate: entry.date,
    }));
  });

  return (
    <div className="flex-1 overflow-y-auto bg-stone-900 p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col bg-stone-800 rounded-lg overflow-hidden border border-stone-700 hover:border-amber-500/50 transition-colors cursor-pointer shadow-lg"
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

      {/* Modal Overlay */}
      {selectedSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedSlide(null)}>
          <div 
            className="relative bg-stone-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-600"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSlide(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-stone-200 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col md:flex-row h-full overflow-auto">
                <div className="md:w-2/3 bg-black flex items-center justify-center p-2">
                    <img
                        src={selectedSlide.image}
                        alt="Full Slide"
                        className="max-h-[80vh] max-w-full object-contain"
                    />
                </div>
                <div className="md:w-1/3 p-6 overflow-y-auto bg-stone-800 border-l border-stone-700">
                     <div className="text-sm text-amber-500 mb-2 font-mono">{selectedSlide.sourceEntryDate}</div>
                    <div 
                        className="text-stone-200 font-serif text-lg leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: selectedSlide.text || '' }}
                    />
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

