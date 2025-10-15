// API Configuration for LanguageTool and other services
export const API_CONFIG = {
  // LanguageTool API endpoints
  LANGUAGETOOL: {
    BASE_URL:
      import.meta.env.VITE_LANGUAGETOOL_API_URL ||
      "https://api.languagetool.org/v2/check",
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 2,
  },

  // Rate limiting for free tier
  RATE_LIMITS: {
    REQUESTS_PER_DAY: 20,
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },

  // Feature flags
  FEATURES: {
    USE_CUSTOM_FALLBACK: import.meta.env.VITE_USE_CUSTOM_FALLBACK !== "false",
    ENABLE_API_CACHE: import.meta.env.VITE_ENABLE_API_CACHE !== "false",
    ENABLE_QUOTA_TRACKING: true,
  },
};

// Quota tracking utilities
export const QuotaManager = {
  getQuotaKey: () => "languagetool_quota",

  getQuota: () => {
    try {
      const quota = localStorage.getItem(QuotaManager.getQuotaKey());
      return quota ? JSON.parse(quota) : { requests: 0, resetDate: null };
    } catch (error) {
      console.error("Error reading quota from localStorage:", error);
      return { requests: 0, resetDate: null };
    }
  },

  setQuota: (quota) => {
    try {
      localStorage.setItem(QuotaManager.getQuotaKey(), JSON.stringify(quota));
    } catch (error) {
      console.error("Error saving quota to localStorage:", error);
    }
  },

  canMakeRequest: () => {
    const quota = QuotaManager.getQuota();
    const now = new Date();

    // Reset quota if it's a new day
    if (
      quota.resetDate &&
      new Date(quota.resetDate).toDateString() !== now.toDateString()
    ) {
      QuotaManager.setQuota({ requests: 0, resetDate: now.toISOString() });
      return true;
    }

    return quota.requests < API_CONFIG.RATE_LIMITS.REQUESTS_PER_DAY;
  },

  incrementQuota: () => {
    const quota = QuotaManager.getQuota();
    const now = new Date();

    // Reset if new day
    if (
      quota.resetDate &&
      new Date(quota.resetDate).toDateString() !== now.toDateString()
    ) {
      quota.requests = 0;
      quota.resetDate = now.toISOString();
    } else if (!quota.resetDate) {
      quota.resetDate = now.toISOString();
    }

    quota.requests += 1;
    QuotaManager.setQuota(quota);
  },

  getRemainingRequests: () => {
    const quota = QuotaManager.getQuota();
    return Math.max(
      0,
      API_CONFIG.RATE_LIMITS.REQUESTS_PER_DAY - quota.requests
    );
  },
};

// Cache utilities
export const CacheManager = {
  getCacheKey: (text) =>
    `languagetool_${btoa(text).replace(/[^a-zA-Z0-9]/g, "")}`,

  get: (text) => {
    if (!API_CONFIG.FEATURES.ENABLE_API_CACHE) return null;

    try {
      const cacheKey = CacheManager.getCacheKey(text);
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid (24 hours)
        if (now - timestamp < API_CONFIG.RATE_LIMITS.CACHE_DURATION) {
          return data;
        } else {
          sessionStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error("Error reading from cache:", error);
    }

    return null;
  },

  set: (text, data) => {
    if (!API_CONFIG.FEATURES.ENABLE_API_CACHE) return;

    try {
      const cacheKey = CacheManager.getCacheKey(text);
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  },
};
