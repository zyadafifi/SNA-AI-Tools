import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import { FaHeadphonesSimple, FaRegLightbulb } from "react-icons/fa6";
import ProgressBar from "../../Pronunce/ProgressBar";
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

  // Load video source from prop (preferred) or lesson
  // Only reload when videoSrc or lesson changes - not on user interaction
  useEffect(() => {
    const src = videoSrc || lesson?.videoSrc;
    if (src) {
      setVideoSource(src);
    }
  }, [videoSrc, lesson, setVideoSource]);

  // Separate effect for auto-play to prevent unnecessary video reloads
  useEffect(() => {
    // Auto-play if user has already interacted (not the first video)
    if (
      (hasUserInteracted || userInteractionRef.current) &&
      currentStepIndex > 0
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
  }, [currentStepIndex, hasUserInteracted, userInteractionRef, videoRef]);

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

    // Play video
    if (videoRef.current) {
      try {
        await videoRef.current.play();
      } catch (error) {
        console.error("Video play error:", error);
      }
    }
  }, [videoRef, setHasUserInteracted, userInteractionRef]);

  // Handle video end - auto-transition to dictation (mobile only)
  const handleVideoEnd = useCallback(() => {
    if (!isDesktop && isMobile) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
    // Desktop: don't auto-switch, dictation is always visible
  }, [onComplete, isDesktop, isMobile]);

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
            currentSentenceIndex={currentStepIndex}
            sentenceProgress={videoProgress}
            sentences={Array.from({ length: Math.max(0, totalSteps) })}
            completedSentences={currentStepIndex}
            isMobile={isMobile}
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
            {videoSrc || lesson?.videoSrc ? (
              <source 
                src={videoSrc || lesson?.videoSrc} 
                type={(videoSrc || lesson?.videoSrc).includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'} 
              />
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

        {/* Initial Tap to Start Overlay */}
        {(!hasUserInteracted || showIOSAudioOverlay) && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1040] cursor-pointer"
            onClick={handleUserInteraction}
          >
            <div className="w-full px-5">
              <div className="mx-auto max-w-[320px] sm:max-w-[360px] bg-white/90 backdrop-blur-md rounded-[20px] p-5 text-center shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-center gap-2 text-gray-800 mb-1.5">
                  <FaHeadphonesSimple className="w-6 h-6" />
                  <h2 className="text-xl font-extrabold">Listening Phase</h2>
                </div>
                <p className="text-gray-600 text-[13px] leading-relaxed">
                  Tap To Watch this video to improve your
                  <br />
                  listening skills
                </p>
                <div className="mt-4 flex items-start gap-2.5 text-left">
                  <FaRegLightbulb className="w-5 h-5 text-[#ffc515] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 text-[13px] leading-relaxed">
                    After you finish the listening, you will move to the
                    dictation phase
                  </p>
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
                src: video.src || lesson?.videoSrc || videoSrc,
              });
            }
            handleError(e);
          }}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
        >
          {videoSrc || lesson?.videoSrc ? (
            <source 
              src={videoSrc || lesson.videoSrc} 
              type={(videoSrc || lesson?.videoSrc).includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'} 
            />
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
    </div>
  );
};

export default ListeningPhase;
