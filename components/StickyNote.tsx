import React from 'react';

interface StickyNoteProps {
  children: React.ReactNode;
  signature?: string;
  className?: string;
}

const StickyNote: React.FC<StickyNoteProps> = ({ children, signature, className = '' }) => {
  return (
    <div className={`relative z-20 w-full max-w-xs md:pointer-events-none ${className}`}>
      <div className="bg-[#fdfbf7] p-5 shadow-[2px_4px_12px_rgba(0,0,0,0.15)] border border-stone-200 relative">
        {/* Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#e8dfc8]/80 -rotate-1 shadow-sm"></div>
        
        <div className="font-handwriting text-lg text-stone-800 leading-6">
          {children}
        </div>
        {signature && (
          <div className="flex justify-end mt-3 pt-2 border-t border-stone-200/50">
            <span className="font-typewriter text-xs text-stone-500/80">
              - {signature}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyNote;

