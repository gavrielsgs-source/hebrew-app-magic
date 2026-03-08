import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarImageSliderProps {
  images: string[];
  alt: string;
}

export function CarImageSlider({ images, alt }: CarImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] relative bg-[#f5f5f7] overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <svg className="h-12 w-12 text-[#d2d2d7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.621-1.828l-2.073-2.592A4.5 4.5 0 0015.862 8.5H6.638a4.5 4.5 0 00-3.516 1.679L1.049 12.77A2.999 2.999 0 00.428 14.6v2.776C.428 17.996.932 18.5 1.553 18.5H3" />
          </svg>
        </div>
      </div>
    );
  }

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="aspect-[4/3] relative bg-[#f5f5f7] overflow-hidden group/slider">
      <img
        src={images[currentIndex]}
        alt={`${alt} - ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        loading="lazy"
      />

      {images.length > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={goPrev}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-white shadow-sm"
          >
            <ChevronRight className="h-4 w-4 text-[#1d1d1f]" />
          </button>
          <button
            onClick={goNext}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-[#1d1d1f]" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="absolute top-2 left-2 text-[11px] font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {currentIndex + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}
