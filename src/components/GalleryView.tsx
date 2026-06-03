import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';


interface GalleryViewProps {
  items: {
    id: string;
    media_url: string;
    media_type: 'image' | 'video';
    title: string;
    description?: string;
    copyright?: string;
  }[];
  selectedItem: {
    id: string;
    media_url: string;
    media_type: 'image' | 'video';
    title: string;
    description?: string;
    copyright?: string;
  };
  onClose: () => void;
}

// Optimized Image Component for Gallery Viewer
const ViewerImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#FAC39B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-sm">جاري تحميل الصورة...</p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-all duration-700 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        loading="eager"
      />
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <p className="text-lg mb-2">⚠️</p>
            <p className="text-sm">فشل تحميل الصورة</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function GalleryView({ items, selectedItem, onClose }: GalleryViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Find the index of the selected item
    const index = items.findIndex(item => item.id === selectedItem.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [selectedItem.id, items]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handleNext(); // RTL layout
    } else if (e.key === 'ArrowRight') {
      handlePrevious(); // RTL layout
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentItem = items[currentIndex];

  if (!currentItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="gallery-controls absolute top-4 right-4 z-30 p-2 bg-black/70 backdrop-blur-sm rounded-full text-white hover:text-red-400 transition-all duration-300 hover:scale-110"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-30">
        <span className="gallery-controls bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="gallery-controls hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/70 backdrop-blur-sm hover:bg-black/80 rounded-full transition-all duration-300 text-white hover:text-[#FAC39B] hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="gallery-controls hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/70 backdrop-blur-sm hover:bg-black/80 rounded-full transition-all duration-300 text-white hover:text-[#FAC39B] hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Content Container */}
      <div className="flex flex-col h-full">
        {/* Media Container */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-3 md:p-4">
          <div className="w-full h-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] flex items-center justify-center">
            {currentItem.media_type === 'image' ? (
              <ViewerImage
                src={currentItem.media_url}
                alt={currentItem.title}
                className="max-w-full max-h-full object-contain rounded-md sm:rounded-lg shadow-lg"
              />
            ) : (
              <video
                key={currentItem.media_url}
                src={currentItem.media_url}
                className="max-w-full max-h-full rounded-md sm:rounded-lg shadow-lg"
                controls
                controlsList="nodownload"
                playsInline
              />
            )}
          </div>
        </div>

        {/* Info Panel - Bottom on mobile, overlay on desktop */}
        <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 p-2 sm:p-3 md:p-4">
          <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2">
              {currentItem.title}
            </h3>
            {currentItem.description && (
              <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                {currentItem.description}
              </p>
            )}
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-1">
              {currentItem.copyright || (
                currentItem.media_type === 'image' 
                  ? 'Digital asset copyright: Pitt Rivers Museum, University of Oxford'
                  : '© سواليفهم - جميع الحقوق محفوظة'
              )}
            </p>
          </div>
        </div>

        {/* Mobile Navigation Dots */}
        {items.length > 1 && (
          <div className="sm:hidden flex justify-center gap-1.5 pb-3">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`gallery-controls w-1 h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#FAC39B] scale-125'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Mobile Swipe Navigation */}
        {items.length > 1 && (
          <div className="sm:hidden flex justify-between items-center px-2 pb-2">
            <button
              onClick={handlePrevious}
              className="gallery-controls flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-white hover:text-[#FAC39B] transition-colors text-xs"
            >
              <ChevronRight className="w-3 h-3" />
              <span>السابق</span>
            </button>
            <button
              onClick={handleNext}
              className="gallery-controls flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-white hover:text-[#FAC39B] transition-colors text-xs"
            >
              <span>التالي</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}