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
    <div
      className="fixed top-[120px] left-5 right-5 z-[1030] pointer-events-none"
      style={{
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div
        className="bg-black/30 backdrop-blur-[5px] rounded-xl p-3 text-center mt-3"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {displayEnglish && (
          <div className="text-white text-base font-semibold leading-[1.4]">
            {displayEnglish}
          </div>
        )}
        {displayArabic && (
          <div
            className="text-white/80 text-sm font-medium leading-[1.4] mt-2"
            style={{
              direction: "rtl",
              textAlign: "center",
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
