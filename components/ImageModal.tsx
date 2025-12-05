import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  altText?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageSrc, altText = "Image view" }) => {
  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-h-full max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close fullscreen view"
          className="absolute -top-3 -right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-stone-800 shadow hover:bg-white transition-colors"
          onClick={onClose}
        >
          Close
        </button>
        <img
          src={imageSrc}
          alt={altText}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-md shadow-lg border-2 border-white/50"
        />
      </div>
    </div>
  );
};

export default ImageModal;

