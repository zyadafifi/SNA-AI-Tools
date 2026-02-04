import { useState, useRef, useEffect } from "react";

const PlayPauseIcon = ({ playing }) => {
  // Pure SVG (no emoji), flat yellow like the mock, with a tiny soft shadow.
  return playing ? (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      className="drop-shadow-[0_1px_0_rgba(0,0,0,0.10)]"
      aria-hidden="true"
    >
      <rect x="4.5" y="3.5" width="5" height="15" rx="1" fill="#FDCB3E" />
      <rect x="12.5" y="3.5" width="5" height="15" rx="1" fill="#FDCB3E" />
    </svg>
  ) : (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      className="drop-shadow-[0_1px_0_rgba(0,0,0,0.10)]"
      aria-hidden="true"
    >
      <path d="M6 3 L18 11 L6 19 Z" fill="#FDCB3E" />
    </svg>
  );
};

const AudioControls = ({
  audioUrl,
  isPlaying,
  onPlayPause,
  onVolumeChange, // (kept for API parity if you use it elsewhere)
  onSpeedChange,
}) => {
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  // Simulated waveform bars (subtle like the mock)
  const waveformBars = Array.from(
    { length: 28 },
    () => Math.floor(Math.random() * 22 + 8) // 8–30px
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handlePlayPause = () => {
    if (!audioUrl) {
      alert("No audio available for this exercise");
      return;
    }
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    onPlayPause?.();
  };

  const handleSpeedToggle = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const i = speeds.indexOf(playbackRate);
    const next = speeds[(i + 1) % speeds.length];
    setPlaybackRate(next);
    onSpeedChange?.(next);
  };

  return (
    <div className="bg-gradient-to-r from-[#FFF3E0] via-[#FFF7E8] to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
      {/* Audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => onPlayPause?.()}
          onError={() => {
            console.error("Audio failed to load");
            alert(
              "Failed to load audio. Please check your internet connection."
            );
          }}
        />
      )}

      {/* Title */}
      <h3 className="text-center text-gray-800 mb-6 text-lg sm:text-xl font-bold">
        Listen to the sentence
      </h3>

      {/* Player with tooltip */}
      <div className="relative">
        {/* Tooltip bubble */}
        <div className="absolute -top-9 left-0 z-10">
          <div className="relative bg-gray border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
            <span className="text-xs text-gray-600 whitespace-nowrap font-normal">
              tap here to listen
            </span>
            {/* Arrow */}
            <div className="absolute -bottom-1 left-4">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M0 0 L5 6 L10 0 Z" fill="gray" />
              </svg>
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                className="absolute top-0 left-0"
              >
                <path
                  d="M0 0 L5 5 L10 0"
                  fill="none"
                  stroke="gray"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Rail */}
        <div className="bg-white border border-gray-300 rounded-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {/* Play / Pause (no background) */}
          <button
            onClick={handlePlayPause}
            disabled={!audioUrl}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            style={{ background: "transparent", boxShadow: "none" }}
          >
            <PlayPauseIcon playing={isPlaying} />
          </button>

          {/* Waveform */}
          <div className="flex-1 flex items-center justify-center gap-[3px] sm:gap-1 px-1 sm:px-2 h-9">
            {waveformBars.map((h, idx) => (
              <div
                key={idx}
                className="bg-gray-500/70 rounded-[1px]"
                style={{
                  width: "3px",
                  height: `${h}px`,
                  minHeight: "8px",
                  maxHeight: "30px",
                }}
              />
            ))}
          </div>

          {/* Speed pill (small, yellow, rounded) */}
          <button
            onClick={handleSpeedToggle}
            className="flex-shrink-0 bg-[#FDCB3E] text-gray-900 border border-gray-300 rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold hover:bg-[#FFD84D] transition-all duration-300 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
          >
            {playbackRate === 1 ? "1x" : `${playbackRate.toFixed(1)}x`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
