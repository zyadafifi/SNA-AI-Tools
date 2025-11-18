import React from "react";

const MobileSubtitleContainer = ({
  currentSubtitle,
  showVideoSubtitles = false,
  isMobile = false,
}) => {
  // ONLY show subtitles from SRT files, never from pronounceData.json
  // Only display if we have currentSubtitle from SRT files
  if (!showVideoSubtitles || !isMobile || !currentSubtitle) {
    return null; // Don't render if no SRT subtitle available
  }

  const displayEnglish = currentSubtitle?.englishText;
  const displayArabic = currentSubtitle?.arabicText;

  // Only render if we have subtitle text from SRT
  const hasContent = displayEnglish || displayArabic;

  if (!hasContent) {
    return null; // Don't render empty container
  }

  return (
    <div className="subtitle-container mt-4 " id="mobileSubtitleContainer">
      <div className="subtitle-content">
        {displayEnglish && (
          <div className="subtitle-english" id="mobileSubtitleEnglish">
            {displayEnglish}
          </div>
        )}
        {displayArabic && (
          <div className="subtitle-arabic" id="mobileSubtitleArabic">
            {displayArabic}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSubtitleContainer;
