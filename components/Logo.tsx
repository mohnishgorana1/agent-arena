import React from "react";

interface LogoProps {
  showText?: boolean;
}

export default function Logo({ showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      {/* Logo Container with subtle glow on hover */}
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="h-7 w-7 overflow-visible"
        >
          {/* Left Wing - Main structure (Slides Top-Left on hover) */}
          <path 
            d="M12 2L4 21h4.5L12 12.5" 
            fill="currentColor" 
            className="text-txt transition-transform duration-300 ease-out" 
          />
          
          {/* Right Sliced Wing (Slides Bottom-Right on hover) */}
          <path 
            d="M14 7.5L20 21h-4.5l-3-7.5" 
            fill="currentColor" 
            className="text-muted transition-transform duration-300 ease-out " 
          />
          

          {/* Core Dot (The Agent Eye) - Colored and scales up on hover */}
          <circle 
            cx="12" cy="17.5" r="2" 
            fill="currentColor" 
            className="text-indigo-500 transition-transform duration-300 ease-out origin-[12px_17.5px] group-hover:scale-[1.35]" 
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex items-center">
          <span className="font-sans text-[16px] font-black tracking-tight text-txt uppercase">
            Agent
          </span>
          <span className="font-sans text-[16px] font-black tracking-tight text-indigo-500 uppercase ml-[1px]">
            Arena
          </span>
        </div>
      )}
    </div>
  );
}