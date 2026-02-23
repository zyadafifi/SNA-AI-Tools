import React, { useState } from "react";

const MobileSubtitleContainer = ({
  currentSubtitle,
  showVideoSubtitles = false,
  isMobile = false,
}) => {
  // State to track Arabic subtitle visibility
  const [showArabic, setShowArabic] = useState(false);

  // ONLY show subtitles from SRT files, never from pronounceData.json
  // Only display if we have currentSubtitle from SRT files
  if (!showVideoSubtitles || !isMobile || !currentSubtitle) {
    return null; // Don't render if no SRT subtitle available
  }

  const displayEnglish = currentSubtitle?.englishText || currentSubtitle?.text;
  const displayArabic = currentSubtitle?.arabicText;

  // Don't render empty container
  const hasContent = displayEnglish || displayArabic;
  if (!hasContent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1030] pointer-events-none px-4 pb-6">
      <div
        className="bg-gray-500/40  rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] pointer-events-auto"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* English subtitle - always visible */}
        {displayEnglish && (
          <div
            className="text-white text-lg font-semibold text-center leading-relaxed"
            style={{
              fontFamily: '"Inter", sans-serif',
              letterSpacing: "0.01em",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
            }}
          >
            {displayEnglish}
          </div>
        )}

        {/* Show meaning button - only show if Arabic subtitle exists and not shown yet */}
        {displayArabic && !showArabic && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowArabic(true)}
              className="px-6 py-2.5 rounded-full bg-gray-500/40 border border-gray-200 text-gray-400 text-sm font-medium flex items-center gap-2 pointer-events-auto transition-all hover:bg-gray-50"
            >
              <span>Show meaning (Arabic)</span>
              <svg 
                width="8" 
                height="12" 
                viewBox="0 0 8 12" 
                fill="none" 
                className="ml-1"
              >
                <path 
                  d="M1.5 1L6.5 6L1.5 11" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Arabic subtitle - conditional */}
        {showArabic && displayArabic && (
          <>
            <div
              className=" text-white text-center leading-[1.8]"
              style={{
                fontFamily: '"Tajawal", "Noto Kufi Arabic", sans-serif',
                fontSize: "19px",
                letterSpacing: "0",
                direction: "rtl",
                textAlign: "center",
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
                fontWeight: "500",
              }}
            >
              {displayArabic}
            </div>
            
            {/* Hide meaning button - shown below Arabic subtitle */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowArabic(false)}
                className="px-6 py-2.5 rounded-full bg-gray-500/40 border border-gray-200 text-gray-400 text-sm font-medium flex items-center gap-2 pointer-events-auto transition-all hover:bg-gray-50"
              >
                <span>Hide meaning (Arabic)</span>
                <svg 
                  width="12" 
                  height="8" 
                  viewBox="0 0 12 8" 
                  fill="none" 
                  className="ml-1"
                >
                  <path 
                    d="M1 1.5L6 6.5L11 1.5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileSubtitleContainer;
