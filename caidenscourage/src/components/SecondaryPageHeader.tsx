import React from 'react';

interface SecondaryPageHeaderProps {
  breadcrumb: string;
  title: string;
  subtitle?: string;
  pillLabel?: string;
  showWatermark?: boolean;
  watermarkOpacity?: number;
}

const SecondaryPageHeader: React.FC<SecondaryPageHeaderProps> = ({
  breadcrumb,
  title,
  subtitle,
  pillLabel,
  showWatermark = true,
  watermarkOpacity = 0.04
}) => {
  return (
    <header className="relative bg-gradient-to-b from-cream to-white py-16 sm:py-20 lg:py-24 overflow-hidden" style={{ paddingTop: '120px' }}>
      {/* B-4 Watermark - Very subtle */}
      {showWatermark && (
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] sm:opacity-[0.04] lg:opacity-[0.05] pointer-events-none select-none"
          style={{ 
            transform: 'translateY(-50%)',
            width: '300px',
            height: '300px',
            maxWidth: '40vw'
          }}
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#243E70" strokeWidth="2" opacity="1"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="#243E70" strokeWidth="1.5" opacity="0.8"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="#243E70" strokeWidth="1" opacity="0.6"/>
            <circle cx="85" cy="90" r="4" fill="#243E70" opacity="0.7"/>
            <circle cx="115" cy="90" r="4" fill="#243E70" opacity="0.7"/>
            <line x1="100" y1="50" x2="100" y2="70" stroke="#243E70" strokeWidth="1.5" opacity="0.6"/>
            <line x1="100" y1="130" x2="100" y2="150" stroke="#243E70" strokeWidth="1.5" opacity="0.6"/>
          </svg>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-left">
          {/* Breadcrumb */}
          <p className="text-sm sm:text-base text-navy-400 mb-3 font-medium">
            {breadcrumb}
          </p>
          
          {/* Title with Pill Label */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-500 leading-tight">
              {title}
            </h1>
            {pillLabel && (
              <span className="inline-flex items-center px-3 py-1.5 bg-golden-500 text-navy-500 font-semibold text-xs sm:text-sm rounded-full w-fit">
                {pillLabel}
              </span>
            )}
          </div>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg sm:text-xl lg:text-2xl text-navy-600 font-medium leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
};

export default SecondaryPageHeader;

