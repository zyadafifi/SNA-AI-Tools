import { useState, useRef, useCallback, useEffect } from "react";
import Hls from "hls.js";
import {
  supportsNativeHLS,
  isIOSSafari,
  getHLSConfig,
  filterQualityLevels,
  getMinimumQualityIndex,
  getBestQualityIndex,
  MIN_QUALITY_HEIGHT,
} from "../utils/videoQualityManager";

/**
 * Enhanced Video Player Hook with HLS Support and Quality Management
 * Ensures minimum 720p quality on all devices
 */
export function useHLSVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(null);
  const [availableQualities, setAvailableQualities] = useState([]);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const qualityLockRef = useRef(false); // Prevent quality from dropping below 720p

  /**
   * Initialize HLS player for non-Safari browsers
   */
  const initializeHLS = useCallback((videoElement, src) => {
    if (!Hls.isSupported()) {
      console.warn("HLS.js is not supported in this browser");
      setHasError(true);
      return null;
    }

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const hlsConfig = getHLSConfig(true); // Force high quality
    const hls = new Hls(hlsConfig);

    // Attach media
    hls.attachMedia(videoElement);

    // Handle manifest parsed event
    hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
      const levels = data.levels;
      setAvailableQualities(levels);

      // Filter and enforce minimum quality (720p)
      const filteredLevels = filterQualityLevels(levels);

      // FORCE HIGHEST QUALITY initially, not minimum
      const bestQualityIndex = getBestQualityIndex(levels);
      const minQualityIndex = getMinimumQualityIndex(levels);
      
      // Start with best quality
      if (bestQualityIndex !== -1) {
        hls.currentLevel = bestQualityIndex;
        setCurrentQuality(levels[bestQualityIndex]);
        
        // After 5 seconds, allow adaptive but lock minimum to 720p
        const timeoutId = setTimeout(() => {
          try {
            // Guard: only run if this hls instance is still active (not destroyed/replaced)
            if (hlsRef.current === hls && hls.media) {
              hls.currentLevel = -1; // Enable auto
              qualityLockRef.current = true;
            }
          } catch (e) {
            // HLS instance may be destroyed - ignore
          }
        }, 5000);
        hls.on(Hls.Events.DESTROYING, () => clearTimeout(timeoutId));
      } else if (minQualityIndex !== -1) {
        // Fallback to minimum quality if best not available
        hls.currentLevel = minQualityIndex;
        setCurrentQuality(levels[minQualityIndex]);
        qualityLockRef.current = true;
      }
    });

    // Handle level switched event
    hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      const level = hls.levels[data.level];
      setCurrentQuality(level);

      // AGGRESSIVE quality enforcement - if it drops below 720p, force it back up IMMEDIATELY
      if (level.height < MIN_QUALITY_HEIGHT) {
        const minIndex = getMinimumQualityIndex(hls.levels);
        if (minIndex !== -1 && minIndex !== data.level) {
          // Force quality up immediately
          hls.currentLevel = minIndex;
          hls.loadLevel = minIndex;
        }
      }
    });

    // Intercept level loading to prevent low quality from even being requested
    hls.on(Hls.Events.LEVEL_LOADING, (_event, data) => {
      if (data.level !== undefined && hls.levels[data.level]) {
        const level = hls.levels[data.level];
        if (level.height < MIN_QUALITY_HEIGHT && qualityLockRef.current) {
          const minIndex = getMinimumQualityIndex(hls.levels);
          if (minIndex !== -1) {
            hls.nextLevel = minIndex;
          }
        }
      }
    });

    // Handle errors
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        console.error("HLS Error:", data);
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error("Fatal network error, trying to recover");
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error("Fatal media error, trying to recover");
            hls.recoverMediaError();
            break;
          default:
            console.error("Fatal error, cannot recover");
            setHasError(true);
            hls.destroy();
            break;
        }
      } else if (data.details === "bufferStalledError") {
        // Non-fatal: playback stalled due to empty buffer - kick recovery
        try {
          hls.startLoad();
        } catch (e) {
          // ignore
        }
      }
    });

    // Load source
    hls.loadSource(src);

    return hls;
  }, []);

  /**
   * Set video source and initialize player
   */
  const setVideoSource = useCallback((src) => {
    if (!videoRef.current || !src) return;

    setIsLoading(true);
    setHasError(false);
    qualityLockRef.current = false;

    const videoElement = videoRef.current;

    // Check if it's an HLS stream
    const isHLS = src.includes(".m3u8");

    if (isHLS) {
      // Clear any existing src/source to prevent native HLS from loading first
      // Native HLS uses conservative quality; we need HLS.js for 720p+ control
      videoElement.removeAttribute("src");
      videoElement.querySelectorAll("source").forEach((s) => s.remove());
      videoElement.load();

      // Use HLS.js when supported (includes iOS 17.1+ with MSE) for high initial quality.
      // Fall back to native HLS only when HLS.js is not supported (e.g. older iOS).
      if (Hls.isSupported()) {
        const hls = initializeHLS(videoElement, src);
        hlsRef.current = hls;
      } else if (supportsNativeHLS(videoElement)) {
        // Fallback to native HLS when HLS.js not supported (e.g. older iOS)
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        if (isIOSSafari()) {
          videoElement.setAttribute("x-webkit-airplay", "allow");
          videoElement.setAttribute("playsinline", "true");
          videoElement.setAttribute("webkit-playsinline", "true");
          videoElement.preload = "auto";
          if (videoElement.style) videoElement.style.objectFit = "cover";
        }
        videoElement.src = src;
        videoElement.load();
      }
    } else {
      // Regular MP4 playback
      
      // Clean up HLS.js if it was previously used
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      videoElement.src = src;
      videoElement.load();
    }
  }, [initializeHLS]);

  /**
   * Play video
   */
  const play = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setHasError(false);
      await videoRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Error playing video:", err);
      setHasError(true);
    }
  }, []);

  /**
   * Pause video
   */
  const pause = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
  }, []);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  /**
   * Replay video from start
   */
  const replay = useCallback(async () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    await play();
  }, [play]);

  /**
   * Seek to specific time
   */
  const seekTo = useCallback((time) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  /**
   * Set volume
   */
  const setVolume = useCallback((volume) => {
    if (!videoRef.current) return;
    videoRef.current.volume = Math.max(0, Math.min(1, volume));
  }, []);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  }, []);

  /**
   * Set quality level (HLS.js only)
   */
  const setQualityLevel = useCallback((levelIndex) => {
    if (!hlsRef.current) {
      console.warn("Cannot set quality: HLS instance not available");
      return;
    }

    const levels = hlsRef.current.levels;
    if (levelIndex < 0 || levelIndex >= levels.length) {
      console.warn("Invalid quality level index:", levelIndex);
      return;
    }

    // Check if level meets minimum quality requirement
    const level = levels[levelIndex];
    if (level.height < MIN_QUALITY_HEIGHT) {
      console.warn(`Cannot set quality below ${MIN_QUALITY_HEIGHT}p`);
      return;
    }

    hlsRef.current.currentLevel = levelIndex;
    console.log(`✓ Manually set quality to: ${level.height}p`);
  }, []);

  /**
   * Get current playback progress as percentage
   */
  const getProgress = useCallback(() => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  /**
   * Format time in MM:SS format
   */
  const formatTime = useCallback((timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Video event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleError = useCallback((event) => {
    console.error("Video error:", event);
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
    };
  }, []);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    hasError,
    currentQuality,
    availableQualities,
    play,
    pause,
    togglePlayPause,
    replay,
    seekTo,
    setVolume,
    toggleMute,
    setVideoSource,
    setQualityLevel,
    getProgress,
    formatTime,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleLoadStart,
    handleCanPlay,
  };
}

