import React, { useState, useRef, MouseEvent, TouchEvent } from 'react';

interface BeforeAfterSliderProps {
  original: string;
  simulation: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ original, simulation }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.buttons !== 1) return;
    updatePosition(e.clientX);
  };
  
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    updatePosition(e.clientX);
  };
  
  const handleTouch = (e: TouchEvent<HTMLDivElement>) => {
    updatePosition(e.touches[0].clientX);
  };

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-xl"
      onMouseMove={handleDrag}
      onTouchMove={handleTouch}
      onClick={handleClick}
    >
      {/* Background Image (Simulation/After) */}
      <img 
        src={simulation} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
      />
      
      {/* Foreground Image (Original/Before) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={original} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-3 bg-current opacity-50"></div>
            <div className="w-0.5 h-3 bg-current opacity-50"></div>
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none">BEFORE</div>
      <div className="absolute top-4 right-4 bg-blue-600/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none">AFTER</div>
    </div>
  );
};

export default BeforeAfterSlider;