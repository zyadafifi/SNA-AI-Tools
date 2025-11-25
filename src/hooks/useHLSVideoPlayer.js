import { useState, useRef, useCallback, useEffect } from "react";
import Hls from "hls.js";
import {
  supportsNativeHLS,
  isIOSSafari,
  getHLSConfig,
  filterQualityLevels,
  getMinimumQualityIndex,
  getBestQualityIndex,
  logQualityInfo,
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

    const hlsConfig = getHLSConfig();
    const hls = new Hls(hlsConfig);

    // Attach media
    hls.attachMedia(videoElement);

    // Handle manifest parsed event
    hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
      console.log("📊 HLS Manifest parsed, levels:", data.levels.length);
      
      const levels = data.levels;
      setAvailableQualities(levels);

      // Filter and enforce minimum quality (720p)
      const filteredLevels = filterQualityLevels(levels);
      
      if (filteredLevels.length < levels.length) {
        console.log(`⚠️ Filtered out ${levels.length - filteredLevels.length} levels below ${MIN_QUALITY_HEIGHT}p`);
      }

      // Set initial quality to minimum acceptable (720p or best available)
      const minQualityIndex = getMinimumQualityIndex(levels);
      
      if (minQualityIndex !== -1) {
        hls.currentLevel = minQualityIndex;
        setCurrentQuality(levels[minQualityIndex]);
        console.log(`✓ Initial quality set to: ${levels[minQualityIndex].height}p`);
      }

      // Log quality information
      logQualityInfo(levels, minQualityIndex);

      // Enable quality lock to prevent dropping below 720p
      qualityLockRef.current = true;
    });

    // Handle level switched event
    hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      const level = hls.levels[data.level];
      setCurrentQuality(level);
      console.log(`🔄 Quality switched to: ${level.height}p (${Math.round(level.bitrate / 1000)}kbps)`);

      // Enforce minimum quality - if it drops below 720p, force it back up
      if (qualityLockRef.current && level.height < MIN_QUALITY_HEIGHT) {
        console.warn(`⚠️ Quality below ${MIN_QUALITY_HEIGHT}p detected, forcing back up`);
        const minIndex = getMinimumQualityIndex(hls.levels);
        if (minIndex !== -1 && minIndex !== data.level) {
          hls.currentLevel = minIndex;
        }
      }
    });

    // Handle errors
    hls.on(Hls.Events.ERROR, (_event, data) => {
      console.error("HLS Error:", data);

      if (data.fatal) {
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
      // Check if browser supports native HLS (iOS Safari)
      if (supportsNativeHLS(videoElement)) {
        console.log("✓ Using native HLS support (iOS Safari)");
        
        // Clean up HLS.js if it was previously used
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        // Use native HLS
        videoElement.src = src;
        
        // iOS-specific optimizations
        if (isIOSSafari()) {
          videoElement.setAttribute('x-webkit-airplay', 'allow');
          videoElement.setAttribute('playsinline', 'true');
          
          // iOS doesn't expose quality levels, but we can optimize preload
          videoElement.preload = 'metadata';
        }
        
        videoElement.load();
      } else {
        // Use HLS.js for other browsers
        console.log("✓ Using HLS.js for playback");
        const hls = initializeHLS(videoElement, src);
        hlsRef.current = hls;
      }
    } else {
      // Regular MP4 playback
      console.log("✓ Using standard MP4 playback");
      
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

