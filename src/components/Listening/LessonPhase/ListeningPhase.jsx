import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import { FaHeadphonesSimple, FaRegLightbulb } from "react-icons/fa6";
import ListeningProgressBar from "../ListeningProgressBar";
import { useHLSVideoPlayer } from "../../../hooks/useHLSVideoPlayer";
import useSubtitleSync from "../../../hooks/useSubtitleSync";
import MobileSubtitleContainer from "../MobileSubtitleContainer";

const ListeningPhase = ({
  lesson,
  videoSrc,
  onComplete,
  totalSteps = 0,
  currentStepIndex = 0,
  lessonId,
  questionId,
  isDesktop = false,
  hasUserInteracted = false,
  setHasUserInteracted = () => {},
  userInteractionRef = { current: false },
  videoRefForAutoPlay = null,
  shouldReplayVideo = false,
  onReplayComplete = () => {},
}) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showFocusOverlay, setShowFocusOverlay] = useState(true);
  const [showIOSAudioOverlay, setShowIOSAudioOverlay] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoLoadAttempts, setVideoLoadAttempts] = useState(0);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null);
  const nearEndTriggeredRef = useRef(false);

  // Use HLS video player hook for quality management
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isLoading: videoLoading,
    hasError: videoError,
    currentQuality,
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
  } = useHLSVideoPlayer();

  // Expose videoRef to parent for auto-play functionality
  useEffect(() => {
    if (videoRefForAutoPlay && videoRef) {
      videoRefForAutoPlay.current = videoRef.current;
    }
  }, [videoRef, videoRefForAutoPlay]);

  // Subtitle synchronization hook (if SRT files are available)
  const {
    currentSubtitle,
    subtitles,
    isSubtitlesActive,
    loadSubtitlesForQuestion,
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

  // Retry video loading function (matches pronunciation tool methodology)
  const retryVideoLoad = useCallback(
    (src, attempts = 0) => {
      const maxAttempts = 3;
      if (attempts >= maxAttempts) {
        console.error(
          `Failed to load video after ${maxAttempts} attempts:`,
          src
        );
        return;
      }

      setVideoLoadAttempts(attempts + 1);
      setVideoSource(src);

      // Retry if video doesn't load within 3 seconds
      setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState < 3) {
          retryVideoLoad(src, attempts + 1);
        }
      }, 3000);
    },
    [setVideoSource, videoRef]
  );

  // Load video source from prop (preferred) or lesson
  // Only reload when videoSrc or lesson changes - avoid unnecessary reloads (matches pronunciation methodology)
  useEffect(() => {
    const src = videoSrc || lesson?.videoSrc;
    if (src && src !== currentVideoSrc) {
      setCurrentVideoSrc(src);
      setVideoLoadAttempts(0);
      retryVideoLoad(src);
      setVideoEnded(false); // Reset ended state when video source changes
    }
  }, [
    videoSrc,
    lesson?.videoSrc,
    currentVideoSrc,
    retryVideoLoad,
  ]);

  // Separate effect for auto-play to prevent unnecessary video reloads (matches pronunciation methodology)
  useEffect(() => {
    // Auto-play if user has already interacted (not the first video) and video source is loaded
    if (
      (hasUserInteracted || userInteractionRef.current) &&
      currentStepIndex > 0 &&
      currentVideoSrc
    ) {
      let mounted = true;

      // Wait for video to be ready and play
      const attemptAutoPlay = async () => {
        if (!videoRef.current || !mounted) return;

        try {
          // Wait for video to be ready if it's not already
          if (videoRef.current.readyState < 3) {
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error("Video load timeout"));
              }, 5000);

              const onCanPlay = () => {
                clearTimeout(timeout);
                videoRef.current?.removeEventListener("canplay", onCanPlay);
                resolve();
              };

              videoRef.current?.addEventListener("canplay", onCanPlay);
            });
          }

          if (!mounted || !videoRef.current) return;

          // Ensure video is unmuted for subsequent videos
          videoRef.current.muted = false;
          await videoRef.current.play();
        } catch (error) {
          if (error.name === "AbortError") {
            console.error("Auto-play was interrupted");
          } else {
            console.error("Auto-play error:", error);
          }
        }
      };

      // Small delay to allow video source to be set
      const timer = setTimeout(attemptAutoPlay, 300);

      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
  }, [currentStepIndex, currentVideoSrc, hasUserInteracted, userInteractionRef, videoRef]);

  // Reset near-end trigger when video source changes
  useEffect(() => {
    nearEndTriggeredRef.current = false;
  }, [currentVideoSrc]);

  // Pause slightly before end to keep last frame visible (HLS buffer clears on 'ended')
  const handleTimeUpdateWithNearEnd = useCallback(() => {
    handleTimeUpdate();
    const el = videoRef.current;
    if (!el || !el.duration || nearEndTriggeredRef.current) return;
    const threshold = 0.15; // Pause 0.15s before end
    if (el.currentTime >= el.duration - threshold) {
      nearEndTriggeredRef.current = true;
      el.pause();
      setVideoEnded(true);
      if (!isDesktop && isMobile) {
        setTimeout(() => onComplete(), 1000);
      }
    }
  }, [handleTimeUpdate, isDesktop, isMobile, onComplete, videoRef]);

  // Load subtitles when question changes
  useEffect(() => {
    if (lessonId && questionId) {
      loadSubtitlesForQuestion(lessonId, questionId);
    }
    return () => {
      clearSubtitles();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, questionId]);

  // Handle replay video request from parent (when "Listen again" is clicked)
  useEffect(() => {
    if (shouldReplayVideo && videoRef.current) {
      const replayVideo = async () => {
        try {
          // Wait a bit for the phase transition to complete
          await new Promise((resolve) => setTimeout(resolve, 100));

          if (!videoRef.current) {
            onReplayComplete();
            return;
          }

          // Wait for video to be ready if it's not already
          if (videoRef.current.readyState < 3) {
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error("Video load timeout"));
              }, 5000);

              const onCanPlay = () => {
                clearTimeout(timeout);
                videoRef.current?.removeEventListener("canplay", onCanPlay);
                resolve();
              };

              videoRef.current?.addEventListener("canplay", onCanPlay);
            });
          }

          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.muted = false; // Ensure audio is on
            await videoRef.current.play();
          }

          // Notify parent that replay is complete
          onReplayComplete();
        } catch (error) {
          if (error.name === "AbortError") {
            console.error("Video replay was interrupted");
          } else {
            console.error("Video replay error:", error);
          }
          onReplayComplete(); // Still reset the flag even on error
        }
      };

      replayVideo();
    }
  }, [shouldReplayVideo, videoRef, onReplayComplete]);

  // Handle user interaction for mobile
  const handleUserInteraction = useCallback(async () => {
    setHasUserInteracted(true);
    userInteractionRef.current = true;
    setShowIOSAudioOverlay(false);
    setShowFocusOverlay(false);
    setVideoEnded(false); // Reset ended state when starting new video

    // Play video
    if (videoRef.current) {
      try {
        await videoRef.current.play();
      } catch (error) {
        console.error("Video play error:", error);
      }
    }
  }, [videoRef, setHasUserInteracted, userInteractionRef]);

  // Fallback when 'ended' fires (e.g. if timeupdate missed) - still try to show last frame
  const handleVideoEnd = useCallback(() => {
    if (nearEndTriggeredRef.current) return; // Already handled by timeupdate
    nearEndTriggeredRef.current = true;
    if (videoRef.current?.duration) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.duration - 0.01);
      videoRef.current.pause();
    }
    setVideoEnded(true);
    if (!isDesktop && isMobile) {
      setTimeout(() => onComplete(), 1000);
    }
  }, [onComplete, isDesktop, isMobile, videoRef]);

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
        {/* Back Button - Hide when user has played the video */}
        {!hasUserInteracted && (
          <div className="absolute top-20 left-5 z-[100000]">
            <button
              onClick={handleBackClick}
              className="w-11 h-11 rounded-full bg-[#ffc515] border border-white text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-100"
            >
              <FaChevronLeft size={20} />
            </button>
          </div>
        )}

        {/* Top Progress Bar */}
        <div
          className="absolute top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] z-[1020] sm:w-[92%] sm:top-4"
          style={{
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          <ListeningProgressBar
            currentPart={currentStepIndex}
            totalParts={totalSteps}
            currentStage={1}
            stageNames={["Listening", "Dictation", "Result", "Speaking", "Result"]}
            onBackClick={handleBackClick}
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
            x-webkit-airplay="allow"
            crossOrigin="anonymous"
            disablePictureInPicture={false}
            onClick={handleVideoClick}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdateWithNearEnd}
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
                  src: video.src || videoSrc || lesson?.videoSrc,
                });
              } else {
                console.error("Video error event (no error code):", {
                  networkState: video?.networkState,
                  readyState: video?.readyState,
                  src: video?.src || videoSrc || lesson?.videoSrc,
                });
              }
              handleError(e);
            }}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
          >
            {/* No source element - load via setVideoSource/HLS.js only for full quality control */}
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
        <MobileSubtitleContainer
          currentSubtitle={currentSubtitle}
          isMobile={isMobile}
        />

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

        {/* Initial Listening Phase Modal */}
        {(!hasUserInteracted || showIOSAudioOverlay) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1040]">
            <div className="w-full px-5">
              <div className="mx-auto max-w-[380px] sm:max-w-[400px] bg-white/80 rounded-[20px] p-5 text-center shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                {/* Title with Headphone Icon */}
                <div className="flex items-center justify-center gap-2 text-gray-800 mb-1">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 512 512"
                    className="w-6 h-6"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M256 80C141.1 80 48 173.1 48 288V392c0 13.3-10.7 24-24 24s-24-10.7-24-24V288C0 146.6 114.6 32 256 32s256 114.6 256 256V392c0 13.3-10.7 24-24 24s-24-10.7-24-24V288c0-114.9-93.1-208-208-208zM80 352c0-35.3 28.7-64 64-64h16c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H144c-35.3 0-64-28.7-64-64V352zm288-64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H352c-17.7 0-32-14.3-32-32V320c0-17.7 14.3-32 32-32h16z"></path>
                  </svg>
                  <h2 className="text-xl font-extrabold">Listening Phase</h2>
                </div>

                {/* Main Instruction */}
                <div className="text-left mb-2.5">
                  <div className="flex items-start gap-2">
                    
                    <p className="text-gray-600 text-[13px] leading-relaxed mt-1">
                      Listen carefully. You'll type what you hear next.
                    </p>
                  </div>
                </div>

                {/* Bullet Points */}
                <div className="text-left mb-3 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-800 font-semibold text-[13px]">•</span>
                    <p className="text-gray-600 text-[13px] leading-relaxed">
                      Replay: 2 times max
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-800 font-semibold text-[13px]">•</span>
                    <p className="text-gray-600 text-[13px] leading-relaxed">
                      Focus on the full sentence
                    </p>
                  </div>
                </div>

                {/* Start Listening Button */}
                <div className="flex justify-center mb-2">
                  <button
                    onClick={handleUserInteraction}
                    className="w-auto min-w-[280px] bg-gradient-to-r from-[#ffc515] via-[#ffd84d] to-[#ffc515] text-gray-800 font-semibold py-2 px-8 rounded-[30px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:shadow-[0_6px_16px_rgba(255,197,21,0.4)] active:scale-95"
                  >
                  <div className="bg-black rounded-full p-1.5 flex items-center justify-center">
                    <svg
                      stroke="#ffc515"
                      fill="#ffc515"
                      strokeWidth="0"
                      viewBox="0 0 448 512"
                      className="w-4 h-4 pl-0.5"
                      height="0.5em"
                      width="0.5em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path>
                    </svg>
                  </div>
                  <span>Start Listening</span>
                  </button>
                </div>

                {/* Skip Intro Link */}
                <div className="flex justify-end">
                  <button
                    onClick={handleUserInteraction}
                    className="text-gray-500 text-[13px] flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer mt-2"
                  >
                    <span>Skip intro</span>
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 512 512"
                      className="w-4 h-4"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path>
                    </svg>
                  </button>
                </div>
              </div>
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
    <div className="w-full">
      {/* HTML5 Video - Simplified for combined view */}
      <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-t-2xl">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-t-2xl"
          controls
          playsInline
          preload="metadata"
          x-webkit-airplay="allow"
          crossOrigin="anonymous"
          disablePictureInPicture={false}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdateWithNearEnd}
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
                src: video.src || lesson?.videoSrc || videoSrc,
              });
            }
            handleError(e);
          }}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
        >
          {/* No source element - load via setVideoSource/HLS.js only for full quality control */}
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
    </div>
  );
};

export default ListeningPhase;
