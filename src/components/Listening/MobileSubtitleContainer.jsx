import React from "react";

const MobileSubtitleContainer = ({ currentSubtitle, isMobile = false }) => {
  // Only render if we have a subtitle and we're on mobile
  if (!isMobile || !currentSubtitle) {
    return null;
  }

  const displayEnglish = currentSubtitle?.englishText || currentSubtitle?.text;
  const displayArabic = currentSubtitle?.arabicText;

  // Don't render empty container
  const hasContent = displayEnglish || displayArabic;
  if (!hasContent) {
    return null;
  }

  return (
    <div className="fixed top-[45px] left-[76px] right-5 z-[1030] pointer-events-none">
      <div
        className="bg-black/30 backdrop-blur-[5px] rounded-xl p-3 text-center mt-3"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {displayEnglish && (
          <div
            className="text-white text-[14px] font-semibold leading-[1.5]"
            style={{
              fontFamily: '"Inter", sans-serif',
              letterSpacing: "0.01em",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
            }}
          >
            {displayEnglish}
          </div>
        )}
        {displayArabic && (
          <div
            className="text-[15px] leading-[1.6] mt-2"
            style={{
              fontFamily: '"Tajawal", "Noto Kufi Arabic", sans-serif',
              color: "rgba(255, 255, 255, 0.95)",
              letterSpacing: "0.015em",
              direction: "rtl",
              textAlign: "center",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
              fontWeight: "600",
            }}
          >
            {displayArabic}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSubtitleContainer;
