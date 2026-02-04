// LanguageTool API Service
import { API_CONFIG, QuotaManager, CacheManager } from "../config/api.js";

/**
 * LanguageTool API Service
 * Handles API calls to LanguageTool with error handling, caching, and quota management
 */

// LanguageTool API request parameters
const createRequestParams = (text, language = "en-US") => ({
  text,
  language,
  enabledOnly: false,
  level: "default",
  enabledRules: "*",
  disabledRules: "WHITESPACE_RULE",
});

// Convert LanguageTool response to our issue format
const convertLanguageToolResponse = (response, originalText) => {
  const issues = [];

  if (!response.matches || !Array.isArray(response.matches)) {
    return issues;
  }

  response.matches.forEach((match) => {
    const { offset, length, message, replacements, rule, context } = match;

    // Extract the original text that has the issue
    const original = originalText.substring(offset, offset + length);

    // Get the best suggestion
    const suggestion =
      replacements && replacements.length > 0 ? replacements[0].value : null;

    // Determine issue type based on rule category
    let type = "grammar";
    if (rule && rule.category) {
      const category = rule.category.toLowerCase();
      if (category.includes("spelling") || category.includes("orthography")) {
        type = "spelling";
      } else if (
        category.includes("style") ||
        category.includes("typography")
      ) {
        type = "style";
      }
    }

    // Create explanation from message and rule info
    let explanation = message;
    if (rule && rule.description) {
      explanation = `${message} (${rule.description})`;
    }

    issues.push({
      type,
      original,
      suggestion,
      explanation,
      position: offset,
      confidence: match.rule?.confidence || 0.5,
      source: "languagetool",
    });
  });

  return issues;
};

// Calculate enhanced score based on LanguageTool severity
const calculateEnhancedScore = (text, issues, languageToolResponse) => {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount === 0) return 0;

  let score = 100;

  // Base deductions for issues
  issues.forEach((issue) => {
    const severity = issue.confidence || 0.5;
    const baseDeduction =
      issue.type === "spelling" ? 3 : issue.type === "grammar" ? 2 : 1;
    score -= baseDeduction * severity;
  });

  // Additional deductions based on LanguageTool's severity levels
  if (languageToolResponse.matches) {
    languageToolResponse.matches.forEach((match) => {
      if (match.rule && match.rule.category) {
        const category = match.rule.category.toLowerCase();

        // High severity categories
        if (
          category.includes("grammar") &&
          match.rule.categoryId === "GRAMMAR"
        ) {
          score -= 2;
        } else if (category.includes("spelling")) {
          score -= 3;
        } else if (category.includes("style")) {
          score -= 0.5;
        }
      }
    });
  }

  // Penalize based on error density
  const errorRate = (issues.length / wordCount) * 100;
  if (errorRate > 5) {
    score -= (errorRate - 5) * 1.5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Check text using LanguageTool API
 * @param {string} text - Text to check
 * @param {string} language - Language code (default: 'en-US')
 * @returns {Promise<Object>} Grammar check result
 */
export const checkWithLanguageTool = async (text, language = "en-US") => {
  // Check cache first
  const cached = CacheManager.get(text);
  if (cached) {
    console.log("Using cached LanguageTool result");
    return cached;
  }

  // Check quota
  if (!QuotaManager.canMakeRequest()) {
    throw new Error(
      "Daily quota exceeded. Please try again tomorrow or use the custom checker."
    );
  }

  try {
    const params = createRequestParams(text, language);

    const response = await fetch(API_CONFIG.LANGUAGETOOL.BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams(params),
      signal: AbortSignal.timeout(API_CONFIG.LANGUAGETOOL.TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(
        `LanguageTool API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Increment quota
    QuotaManager.incrementQuota();

    // Convert to our format
    const issues = convertLanguageToolResponse(data, text);
    const overallScore = calculateEnhancedScore(text, issues, data);

    const result = {
      correctedText: text, // LanguageTool doesn't provide corrected text directly
      issues,
      overallScore,
      improvements: generateImprovements(text, issues),
      statistics: calculateStatistics(text),
      source: "languagetool",
      quotaRemaining: QuotaManager.getRemainingRequests(),
    };

    // Cache the result
    CacheManager.set(text, result);

    return result;
  } catch (error) {
    console.error("LanguageTool API error:", error);

    // If it's a quota error, don't fall back to custom checker
    if (error.message.includes("quota")) {
      throw error;
    }

    // For other errors, throw to trigger fallback
    throw new Error(`LanguageTool API failed: ${error.message}`);
  }
};

// Helper function to generate improvements (reused from grammarChecker)
const generateImprovements = (text, issues) => {
  const improvements = [];

  const spellingIssues = issues.filter((i) => i.type === "spelling").length;
  const grammarIssues = issues.filter((i) => i.type === "grammar").length;
  const styleIssues = issues.filter((i) => i.type === "style").length;

  if (spellingIssues === 0) {
    improvements.push("Excellent spelling accuracy!");
  }

  if (grammarIssues === 0) {
    improvements.push("Strong grammar throughout");
  }

  if (styleIssues === 0) {
    improvements.push("Good writing style");
  }

  if (issues.length < 3) {
    improvements.push("Well-written text with clear communication");
  }

  if (improvements.length === 0) {
    improvements.push("Keep practicing to improve further!");
  }

  return improvements;
};

// Helper function to calculate statistics (reused from grammarChecker)
const calculateStatistics = (text) => {
  const words = text.match(/\b\w+\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;

  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
  const avgWordsPerSentence = wordCount / sentenceCount;

  // Simple reading level calculation
  const syllables = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);

  const avgSyllablesPerWord = syllables / wordCount || 0;
  const readingLevel = Math.round(
    0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
  );

  return {
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    uniqueWords,
    readingLevel: Math.max(1, Math.min(18, readingLevel)),
  };
};

// Helper function to count syllables
const countSyllables = (word) => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
};

/**
 * Get quota information
 * @returns {Object} Quota status
 */
export const getQuotaInfo = () => {
  return {
    remaining: QuotaManager.getRemainingRequests(),
    total: API_CONFIG.RATE_LIMITS.REQUESTS_PER_DAY,
    canMakeRequest: QuotaManager.canMakeRequest(),
  };
};
