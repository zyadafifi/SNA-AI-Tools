import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faExclamationTriangle,
  faPause,
  faPlay,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";

const DesktopVideoSection = ({
  videoRef,
  currentSentence,
  isPlaying,
  videoLoading,
  videoError,
  onPlay,
  onReplay,
  onVideoEnd,
  onLoadedMetadata,
  onTimeUpdate,
  onVideoPlay, // Video element play event
  onPause,
  onEnded,
  onError,
  onLoadStart,
  onCanPlay,
}) => {
  const handlePlayClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        onPlay();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleReplayClick = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      onReplay();
    }
  };

  return (
    <div className="watch-learn-section">
      <div className="section-header">
        <div className="section-icon">
          <FontAwesomeIcon icon={faPlayCircle} className="fas fa-play-circle" />
        </div>
        <h3>Watch & Learn</h3>
      </div>

      {/* Video Container */}
      <div className="video-container">
        <video
          ref={videoRef}
          className="lesson-video"
          controls
          controlsList="nodownload"
          id="lessonVideo"
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onPlay={onVideoPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={onError}
          onLoadStart={onLoadStart}
          onCanPlay={onCanPlay}
        >
          <source src={currentSentence?.videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Error Indicator */}
        {videoError && (
          <div className="video-error-overlay">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="fas fa-exclamation-triangle"
            />
            <span>Video failed to load. Please check your connection.</span>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="video-controls">
        <button
          className="btn btn-outline-primary"
          id="playVideoBtn"
          onClick={handlePlayClick}
          disabled={videoLoading}
        >
          <FontAwesomeIcon
            icon={isPlaying ? faPause : faPlay}
            className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}
          />
          {isPlaying ? "Pause Video" : "Watch Video"}
        </button>
        <button
          className="btn btn-outline-secondary"
          id="replayVideoBtn"
          onClick={handleReplayClick}
          disabled={videoLoading}
        >
          <FontAwesomeIcon icon={faRedo} className="fas fa-redo" /> Replay
        </button>
      </div>
    </div>
  );
};

export default DesktopVideoSection;
