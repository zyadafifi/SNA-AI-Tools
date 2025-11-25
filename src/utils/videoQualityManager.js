/**
 * Video Quality Manager
 * Utilities for managing HLS video quality levels and ensuring minimum quality standards
 */

/**
 * Minimum acceptable video height (720p)
 */
export const MIN_QUALITY_HEIGHT = 720;

/**
 * Filter quality levels to ensure minimum 720p
 * @param {Array} levels - HLS quality levels
 * @returns {Array} Filtered levels meeting minimum quality
 */
export function filterQualityLevels(levels) {
  if (!levels || levels.length === 0) return [];
  
  // Filter out levels below 720p
  const filtered = levels.filter(level => level.height >= MIN_QUALITY_HEIGHT);
  
  // If no levels meet the minimum, return all levels (fallback)
  return filtered.length > 0 ? filtered : levels;
}

/**
 * Get the index of the best quality level (highest resolution)
 * @param {Array} levels - HLS quality levels
 * @returns {number} Index of best quality level
 */
export function getBestQualityIndex(levels) {
  if (!levels || levels.length === 0) return -1;
  
  let bestIndex = 0;
  let maxHeight = levels[0]?.height || 0;
  
  for (let i = 1; i < levels.length; i++) {
    if (levels[i].height > maxHeight) {
      maxHeight = levels[i].height;
      bestIndex = i;
    }
  }
  
  return bestIndex;
}

/**
 * Get the index of minimum acceptable quality level (720p or closest above)
 * @param {Array} levels - HLS quality levels
 * @returns {number} Index of minimum quality level
 */
export function getMinimumQualityIndex(levels) {
  if (!levels || levels.length === 0) return -1;
  
  // Find the level closest to 720p but not below
  let minIndex = -1;
  let closestHeight = Infinity;
  
  for (let i = 0; i < levels.length; i++) {
    const height = levels[i].height;
    if (height >= MIN_QUALITY_HEIGHT && height < closestHeight) {
      closestHeight = height;
      minIndex = i;
    }
  }
  
  // If no level meets minimum, return highest available
  if (minIndex === -1) {
    return getBestQualityIndex(levels);
  }
  
  return minIndex;
}

/**
 * Detect if browser is iOS Safari
 * @returns {boolean} True if iOS Safari
 */
export function isIOSSafari() {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  return iOS;
}

/**
 * Check if browser supports native HLS playback
 * @param {HTMLVideoElement} videoElement - Video element to check
 * @returns {boolean} True if native HLS is supported
 */
export function supportsNativeHLS(videoElement) {
  if (!videoElement) return false;
  return videoElement.canPlayType('application/vnd.apple.mpegurl') !== '';
}

/**
 * Get quality label from height
 * @param {number} height - Video height in pixels
 * @returns {string} Quality label (e.g., "720p", "1080p")
 */
export function getQualityLabel(height) {
  if (height >= 2160) return '4K';
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  if (height >= 360) return '360p';
  return `${height}p`;
}

/**
 * Get HLS.js configuration optimized for quality
 * @param {boolean} forceHighQuality - Force start with highest quality
 * @returns {Object} HLS.js configuration object
 */
export function getHLSConfig(forceHighQuality = true) {
  const isIOS = isIOSSafari();
  
  return {
    // Start with highest quality for iOS, auto for others
    startLevel: forceHighQuality ? 1000 : -1, // High number = highest quality
    
    // Buffer configuration - larger for iOS
    maxBufferLength: isIOS ? 40 : 30,
    maxBufferSize: 80 * 1000 * 1000, // 80 MB for better quality buffering
    maxBufferHole: 0.5,
    
    // Loading timeouts and retries
    manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 3,
    levelLoadingTimeOut: 10000,
    levelLoadingMaxRetry: 3,
    fragLoadingTimeOut: 20000,
    fragLoadingMaxRetry: 6,
    
    // Quality settings - no upper limit, high minimum
    autoLevelCapping: -1,
    
    // INCREASED minimum bitrate for better quality (~4 Mbps for solid 720p)
    minAutoBitrate: isIOS ? 4000000 : 3000000,
    
    // Enable ABR but bias towards higher quality
    abrEwmaFastLive: 3.0,
    abrEwmaSlowLive: 9.0,
    abrEwmaDefaultEstimate: 8000000, // Start very high (8 Mbps) for iOS
    
    // ABR algorithm settings - favor quality
    abrBandWidthFactor: 0.95, // More aggressive quality selection
    abrBandWidthUpFactor: 0.7, // Faster upgrade to better quality
    
    // Debugging
    debug: isIOS, // Enable debug for iOS to see quality selection
    
    // Enable worker for better performance
    enableWorker: true,
    
    // Optimize for quality over latency
    lowLatencyMode: false,
    backBufferLength: 90, // Keep more buffer for quality
    
    // Fragment loading
    fragLoadingLoopThreshold: 3,
    
    // Enable accurate seeking
    nudgeMaxRetry: 3,
    
    // iOS-specific: Prefer higher quality
    capLevelToPlayerSize: false, // Don't limit quality to player size
    
    // Force highest initial quality
    testBandwidth: true,
    initialLiveManifestSize: 1,
  };
}

/**
 * Log quality information for debugging
 * @param {Array} levels - HLS quality levels
 * @param {number} currentLevel - Current quality level index
 */
export function logQualityInfo(levels, currentLevel) {
  if (!levels || levels.length === 0) return;
  
  console.group('🎥 Video Quality Information');
  console.log('Available levels:', levels.length);
  
  levels.forEach((level, index) => {
    const isCurrent = index === currentLevel;
    const meets720p = level.height >= MIN_QUALITY_HEIGHT;
    console.log(
      `${isCurrent ? '→' : ' '} Level ${index}: ${level.width}x${level.height} (${getQualityLabel(level.height)}) - ${Math.round(level.bitrate / 1000)}kbps ${meets720p ? '✓' : '✗'}`
    );
  });
  
  console.groupEnd();
}

