import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import ProgressBar from "../../Pronunce/ProgressBar";
import { useVideoPlayer } from "../../../hooks/useVideoPlayer";
import useSubtitleSync from "../../../hooks/useSubtitleSync";

const ListeningPhase = ({ lesson, onComplete }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showFocusOverlay, setShowFocusOverlay] = useState(true);
  const [showIOSAudioOverlay, setShowIOSAudioOverlay] = useState(false);
  const userInteractionRef = useRef(false);

  // Use video player hook like pronunciation tool
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isLoading: videoLoading,
    hasError: videoError,
    play,
    pause,
    setVideoSource,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleLoadStart,
    handleCanPlay,
  } = useVideoPlayer();

  // Subtitle synchronization hook (if SRT files are available)
  const {
    currentSubtitle,
    subtitles,
    isSubtitlesActive,
    loadSubtitlesForSentence,
    clearSubtitles,
  } = useSubtitleSync(videoRef);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load video source when lesson changes
  useEffect(() => {
    if (lesson?.videoSrc) {
      setVideoSource(lesson.videoSrc);
    } else {
      console.warn("Lesson missing videoSrc:", lesson?.id || "unknown");
    }
  }, [lesson, setVideoSource]);

  // Handle user interaction for mobile
  const handleUserInteraction = useCallback(async () => {
    setHasUserInteracted(true);
    userInteractionRef.current = true;
    setShowIOSAudioOverlay(false);
    setShowFocusOverlay(false);

    // Play video
    if (videoRef.current) {
      try {
        await videoRef.current.play();
      } catch (error) {
        console.error("Video play error:", error);
      }
    }
  }, [videoRef]);

  // Handle video end - auto-transition to dictation
  const handleVideoEnd = useCallback(() => {
    setTimeout(() => {
      onComplete();
    }, 1000);
  }, [onComplete]);

  const handleVideoClick = () => {
    if (!hasUserInteracted) {
      handleUserInteraction();
    } else if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Calculate video progress percentage
  const videoProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle back button click
  const handleBackClick = () => {
    navigate("/listening/home");
  };

  // Mobile full-screen layout
  if (isMobile) {
    return (
      <div
        className="fixed top-0 left-0 w-screen bg-black overflow-hidden z-[1000]"
        style={{
          height: "100dvh",
          minHeight: "-webkit-fill-available",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        {/* Back Button */}
        <div className="absolute top-20 left-5 z-[1020]">
          <button
            onClick={handleBackClick}
            className="w-11 h-11 rounded-full bg-[#ffc515] border border-white text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-100"
          >
            <FaChevronLeft size={20} />
          </button>
        </div>

        {/* Top Progress Bar */}
        <div
          className="absolute top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] z-[1020] sm:w-[92%] sm:top-4"
          style={{
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          <ProgressBar
            currentSentenceIndex={0}
            sentenceProgress={videoProgress}
            sentences={lesson.exercises}
            completedSentences={0}
          />
        </div>

        {/* Video Container */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover bg-black"
            playsInline
            preload="metadata"
            muted={!hasUserInteracted}
            webkit-playsinline="true"
            crossOrigin="anonymous"
            onClick={handleVideoClick}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleVideoEnd}
            onError={(e) => {
              const video = e.target;
              const error = video?.error;
              if (error) {
                console.error("Video error:", {
                  code: error.code,
                  message: error.message,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  src: video.src || lesson?.videoSrc,
                });
              } else {
                console.error("Video error event (no error code):", {
                  networkState: video?.networkState,
                  readyState: video?.readyState,
                  src: video?.src || lesson?.videoSrc,
                });
              }
              handleError(e);
            }}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
          >
            {lesson?.videoSrc ? (
              <source src={lesson.videoSrc} type="video/mp4" />
            ) : (
              <source src="" type="video/mp4" />
            )}
            Your browser does not support the video tag.
          </video>

          {/* Video Error Indicator */}
          {videoError && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 bg-red-600/90 text-white p-5 rounded-[10px] text-sm text-center z-10">
              <i className="fas fa-exclamation-triangle text-2xl mb-1"></i>
              <span>Video failed to load. Please check your connection.</span>
            </div>
          )}
        </div>

        {/* Subtitle Overlay */}
        {currentSubtitle && (
          <div className="fixed top-[120px] sm:top-[100px] left-1/2 -translate-x-1/2 z-[1030] max-w-[90%] w-auto text-center pointer-events-none">
            <div className="bg-black/80 backdrop-blur-[5px] text-white py-2.5 px-5 rounded-xl inline-block">
              <p className="m-0 text-lg sm:text-base font-semibold leading-[1.4] [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">
                {currentSubtitle.text}
              </p>
            </div>
          </div>
        )}

        {/* Focus on Listening Overlay */}
        {showFocusOverlay && hasUserInteracted && isPlaying && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1030] pointer-events-none">
            <div className="bg-black/80 backdrop-blur-[10px] text-white py-5 px-10 sm:py-4 sm:px-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-fade-in-out">
              <h3 className="m-0 text-2xl sm:text-xl font-semibold text-center lowercase tracking-[0.5px]">
                focus on listening
              </h3>
            </div>
          </div>
        )}

        {/* Initial Tap to Start Overlay */}
        {(!hasUserInteracted || showIOSAudioOverlay) && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-[10px] flex items-center justify-center z-[1040] cursor-pointer"
            onClick={handleUserInteraction}
          >
            <div className="text-center text-white ">
              <div className="w-20 h-20 sm:w-[70px] sm:h-[70px] bg-[#ffc515] rounded-full flex items-center justify-center text-4xl sm:text-[30px] mx-auto mb-5 shadow-[0_8px_24px_rgba(255,197,21,0.4)]">
                ▶
              </div>
              <p className="text-xl sm:text-lg font-semibold m-0 [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]">
                Tap to Start Video
              </p>
            </div>
          </div>
        )}

        {/* Bottom Video Progress Bar */}
        <div
          className="fixed bottom-0 left-0 w-full h-1 bg-white/20 z-[1020]"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-[#ffc515] to-[#ffd84d] transition-[width] duration-[0.1s] ease-linear shadow-[0_0_10px_rgba(255,197,21,0.5)]"
            style={{ width: `${videoProgress}%` }}
          />
        </div>
      </div>
    );
  }

  // Desktop layout with HTML5 video
  return (
    <div className="text-center">
      <h2 className="text-xl sm:text-2xl text-[#ffc515] mb-3 sm:mb-4 font-bold flex items-center justify-center gap-2">
        <span className="text-xl sm:text-2xl">🎧</span>
        Listening Phase
      </h2>
      <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">
        Watch the video below to improve your listening skills
      </p>

      {/* HTML5 Video */}
      <div className="relative w-full h-0 pb-[56.25%] mb-4 sm:mb-6 rounded-lg overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleVideoEnd}
          onError={(e) => {
            const video = e.target;
            const error = video?.error;
            if (error) {
              console.error("Video error:", {
                code: error.code,
                message: error.message,
                networkState: video.networkState,
                readyState: video.readyState,
                src: video.src || lesson?.videoSrc,
              });
            }
            handleError(e);
          }}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
        >
          {lesson?.videoSrc ? (
            <source src={lesson.videoSrc} type="video/mp4" />
          ) : (
            <source src="" type="video/mp4" />
          )}
          Your browser does not support the video tag.
        </video>
      </div>

      <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">
        Watch the video below to improve your listening skills
      </p>

      <button
        onClick={onComplete}
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
