import React, { useState } from "react";

const ListeningPhase = ({ lesson, onComplete }) => {
  const [isWatching, setIsWatching] = useState(false);

  const dailyTips = [
    "Watch the video at least twice - once for general understanding, then again for details!",
    "Take breaks between exercises to let your brain process what you've learned.",
    "Don't be afraid to replay difficult sentences multiple times - repetition builds skill!",
    "Focus on understanding the meaning first, then worry about perfect spelling.",
    "Practice with different accents and speaking speeds to improve your adaptability.",
    "Keep a vocabulary journal of new words you encounter during practice.",
    "Try to predict what comes next in a sentence - this improves your language intuition.",
  ];

  const today = new Date().getDate();
  const tipIndex = today % dailyTips.length;
  const dailyTip = dailyTips[tipIndex];

  const handleStartWatching = () => {
    setIsWatching(true);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="text-center">
      <h2 className="text-xl sm:text-2xl text-[#ffc515] mb-3 sm:mb-4 font-bold flex items-center justify-center gap-2">
        <span className="text-xl sm:text-2xl">🎧</span>
        Listening Phase
      </h2>
      <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">
        Watch the video below to improve your listening skills
      </p>

      {/* Tip of the Day */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-left">
        <span className="text-lg sm:text-xl flex-shrink-0">🌟</span>
        <div className="text-gray-700 text-xs sm:text-sm leading-relaxed">
          <strong>Tip of the Day:</strong> {dailyTip}
        </div>
      </div>

      {/* YouTube Video */}
      <div className="relative w-full h-0 pb-[56.25%] mb-4 sm:mb-6 rounded-lg overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        <iframe
          src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}`}
          title="SNA Academy Listening Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-none"
        />
      </div>

      <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">
        Watch the video below to improve your listening skills
      </p>

      <button
        onClick={handleComplete}
        className="relative bg-[#ffc515] text-white border-none px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-[#cc6a15] hover:-translate-y-[2px] shadow-[0_4px_12px_rgba(255,197,21,0.3)] touch-manipulation overflow-hidden group"
        style={{
          background:
            "linear-gradient(135deg, #ffc515 0%, #ffd84d 50%, #ffc515 100%)",
        }}
      >
        <span className="relative z-10">Next - Dictation Phase</span>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
      </button>
    </div>
  );
};

export default ListeningPhase;
