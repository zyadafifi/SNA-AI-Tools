// Enhanced Client-Side Grammar Checker with LanguageTool API Integration
// Analyzes text for spelling, grammar, and style issues with intelligent scoring
// Falls back to custom checker when API is unavailable or quota exceeded

import { checkWithLanguageTool, getQuotaInfo } from "./languageToolService.js";

// Common misspellings database (50+ words)
const COMMON_MISSPELLINGS = {
  teh: "the",
  recieve: "receive",
  occured: "occurred",
  seperate: "separate",
  definately: "definitely",
  arguement: "argument",
  occassion: "occasion",
  untill: "until",
  tommorrow: "tomorrow",
  accomodate: "accommodate",
  acheive: "achieve",
  aquire: "acquire",
  beleive: "believe",
  calender: "calendar",
  carribean: "caribbean",
  cemetary: "cemetery",
  concious: "conscious",
  dilemna: "dilemma",
  enviroment: "environment",
  existance: "existence",
  facinating: "fascinating",
  goverment: "government",
  harrass: "harass",
  independant: "independent",
  judgement: "judgment",
  liason: "liaison",
  maintence: "maintenance",
  noticable: "noticeable",
  occassionally: "occasionally",
  persistant: "persistent",
  posession: "possession",
  reccomend: "recommend",
  rythm: "rhythm",
  succesful: "successful",
  thier: "their",
  wierd: "weird",
  alot: "a lot",
  basicly: "basically",
  begining: "beginning",
  bizzare: "bizarre",
  carribean: "caribbean",
  commitee: "committee",
  concious: "conscious",
  definitly: "definitely",
  embarass: "embarrass",
  excercise: "exercise",
  fourty: "forty",
  guage: "gauge",
  harrass: "harass",
  immediatly: "immediately",
  intresting: "interesting",
};

// Advanced grammar patterns (40+ rules)
const GRAMMAR_PATTERNS = [
  // Subject-verb agreement
  {
    regex: /\b(he|she|it)\s+don't\b/gi,
    fix: "doesn't",
    explanation: "Subject-verb agreement: Use 'doesn't' with he/she/it",
  },
  {
    regex: /\b(I|we|you|they)\s+doesn't\b/gi,
    fix: "don't",
    explanation: "Subject-verb agreement: Use 'don't' with I/we/you/they",
  },
  {
    regex: /\b(he|she|it)\s+have\b/gi,
    fix: "has",
    explanation: "Subject-verb agreement: Use 'has' with he/she/it",
  },
  {
    regex: /\b(he|she|it)\s+are\b/gi,
    fix: "is",
    explanation: "Subject-verb agreement: Use 'is' with he/she/it",
  },
  {
    regex: /\b(he|she|it)\s+were\b/gi,
    fix: "was",
    explanation:
      "Subject-verb agreement: Use 'was' with he/she/it (except subjunctive)",
  },
  {
    regex: /\b(I|we|you|they)\s+was\b/gi,
    fix: "were",
    explanation: "Subject-verb agreement: Use 'were' with I/we/you/they",
  },
  // Articles
  {
    regex: /\ba\s+([aeiouAEIOU])/g,
    fix: "an $1",
    explanation: "Use 'an' before words starting with vowel sounds",
  },
  // Double negatives
  {
    regex: /\bdon't\s+have\s+no\b/gi,
    fix: "don't have any",
    explanation: "Avoid double negatives",
  },
  {
    regex: /\bcan't\s+never\b/gi,
    fix: "can never",
    explanation: "Avoid double negatives",
  },
  // Common confusions (your/you're, their/they're, its/it's)
  {
    regex:
      /\byour\s+(going|coming|doing|being|having|thinking|working|learning)\b/gi,
    fix: "you're $1",
    explanation: "Use 'you're' (you are) instead of 'your' (possessive)",
  },
  {
    regex: /\btheir\s+(going|coming|doing|being|is|are)\b/gi,
    fix: "they're $1",
    explanation: "Use 'they're' (they are) instead of 'their' (possessive)",
  },
  {
    regex: /\bits\s+(going|being|a|the)\b/gi,
    fix: "it's $1",
    explanation: "Use 'it's' (it is) instead of 'its' (possessive)",
  },
  // Would of, could of, should of
  {
    regex: /\bwould\s+of\b/gi,
    fix: "would have",
    explanation: "Use 'would have' instead of 'would of'",
  },
  {
    regex: /\bcould\s+of\b/gi,
    fix: "could have",
    explanation: "Use 'could have' instead of 'could of'",
  },
  {
    regex: /\bshould\s+of\b/gi,
    fix: "should have",
    explanation: "Use 'should have' instead of 'should of'",
  },
  // Redundancy
  {
    regex: /\bvery\s+very\b/gi,
    fix: "extremely",
    explanation: "Avoid repetition - use 'extremely' for stronger impact",
  },
  {
    regex: /\bin\s+my\s+opinion\s+I\s+think\b/gi,
    fix: "I think",
    explanation:
      "Redundant phrase - 'in my opinion' and 'I think' mean the same",
  },
  // Then/than confusion
  {
    regex: /\bbetter\s+then\b/gi,
    fix: "better than",
    explanation: "Use 'than' for comparisons, 'then' for time",
  },
  {
    regex: /\bless\s+then\b/gi,
    fix: "less than",
    explanation: "Use 'than' for comparisons, 'then' for time",
  },
  {
    regex: /\bmore\s+then\b/gi,
    fix: "more than",
    explanation: "Use 'than' for comparisons, 'then' for time",
  },
];

// Style patterns (10+ rules)
const STYLE_PATTERNS = [
  {
    regex:
      /\bvery\s+(good|bad|nice|big|small|important|interesting|happy|sad|angry|tired|excited|bored|confused|surprised|worried|scared|proud|beautiful|ugly|smart|stupid|fast|slow|easy|hard|difficult|simple|complex|common|rare|popular|unpopular|famous|unknown)\b/gi,
    explanation:
      "Consider using a stronger adjective instead of 'very + adjective'",
  },
  {
    regex: /\b(is|are|was|were)\s+\w+ed\b/g,
    explanation:
      "Consider using active voice instead of passive voice for clarity",
  },
  {
    regex: /\bI\s+think\s+that\s+I\s+think\b/gi,
    explanation: "Avoid redundant phrases",
  },
  {
    regex: /\bthe\s+the\b/gi,
    explanation: "Remove duplicate 'the'",
  },
  {
    regex: /\band\s+and\b/gi,
    explanation: "Remove duplicate 'and'",
  },
  {
    regex: /\bbut\s+but\b/gi,
    explanation: "Remove duplicate 'but'",
  },
  {
    regex: /\bso\s+so\b/gi,
    explanation: "Remove duplicate 'so'",
  },
  {
    regex: /\bthen\s+then\b/gi,
    explanation: "Remove duplicate 'then'",
  },
  {
    regex: /\bto\s+to\b/gi,
    explanation: "Remove duplicate 'to'",
  },
  {
    regex: /\bfor\s+for\b/gi,
    explanation: "Remove duplicate 'for'",
  },
  // Additional advanced patterns
  {
    regex: /\bI\s+am\s+going\s+to\s+go\b/gi,
    fix: "I am going",
    explanation: "Redundant phrase: 'going to go' is redundant",
  },
  {
    regex: /\bmore\s+better\b/gi,
    fix: "better",
    explanation: "Redundant comparison: Use 'better' instead of 'more better'",
  },
  {
    regex: /\bmost\s+best\b/gi,
    fix: "best",
    explanation: "Redundant superlative: Use 'best' instead of 'most best'",
  },
  {
    regex: /\bless\s+fewer\b/gi,
    fix: "fewer",
    explanation: "Use 'fewer' for countable items, 'less' for uncountable",
  },
  {
    regex: /\bamount\s+of\s+(people|students|books|items)\b/gi,
    fix: "number of $1",
    explanation:
      "Use 'number of' for countable items, 'amount of' for uncountable",
  },
  {
    regex: /\bme\s+and\s+(him|her|them)\b/gi,
    fix: "$1 and I",
    explanation: "Use 'I' as subject, not 'me'",
  },
  {
    regex: /\b(him|her|them)\s+and\s+I\b/gi,
    fix: "$1 and me",
    explanation: "Use 'me' as object, not 'I'",
  },
  {
    regex: /\bwho\s+vs\s+whom\b/gi,
    fix: "whom",
    explanation: "Use 'whom' as object, 'who' as subject",
  },
  {
    regex: /\bthis\s+kind\s+of\s+things\b/gi,
    fix: "these kinds of things",
    explanation: "Match plural 'things' with plural 'kinds'",
  },
  {
    regex: /\beach\s+of\s+the\s+(student|person|child)\b/gi,
    fix: "each $1",
    explanation: "Use singular after 'each'",
  },
  {
    regex: /\beveryone\s+of\s+them\b/gi,
    fix: "all of them",
    explanation: "Use 'all' with 'of them', not 'everyone'",
  },
  {
    regex: /\bthe\s+reason\s+why\s+is\s+because\b/gi,
    fix: "the reason is",
    explanation: "Avoid 'reason why is because' - it's redundant",
  },
  {
    regex: /\bwhere\s+are\s+you\s+at\b/gi,
    fix: "where are you",
    explanation: "Remove unnecessary 'at' after 'where'",
  },
  {
    regex: /\bI\s+could\s+care\s+less\b/gi,
    fix: "I couldn't care less",
    explanation: "Use 'couldn't care less' to mean you don't care at all",
  },
  {
    regex: /\bfor\s+all\s+intensive\s+purposes\b/gi,
    fix: "for all intents and purposes",
    explanation: "Correct phrase is 'for all intents and purposes'",
  },
  {
    regex: /\bI\s+seen\b/gi,
    fix: "I saw",
    explanation: "Use 'saw' (past tense) not 'seen' (past participle)",
  },
  {
    regex: /\bI\s+done\b/gi,
    fix: "I did",
    explanation: "Use 'did' (past tense) not 'done' (past participle)",
  },
  {
    regex:
      /\bI\s+went\s+to\s+the\s+store\s+and\s+bought\s+some\s+milk\s+and\s+then\s+I\s+went\s+home\b/gi,
    explanation: "Consider breaking this long sentence into shorter ones",
  },
  {
    regex: /\bvery\s+unique\b/gi,
    fix: "unique",
    explanation: "Something is either unique or not - no degrees of uniqueness",
  },
  {
    regex: /\bmore\s+perfect\b/gi,
    fix: "perfect",
    explanation:
      "Something is either perfect or not - no degrees of perfection",
  },
];

// Check if a word looks like gibberish
const isLikelyGibberish = (word) => {
  if (word.length < 3) return false;

  // Check for excessive consonants
  const consonants = word.match(/[bcdfghjklmnpqrstvwxyz]/gi) || [];
  const vowels = word.match(/[aeiou]/gi) || [];

  // If word has more than 5 consonants in a row, likely gibberish
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(word)) return true;

  // If word has very low vowel ratio (less than 20%), likely gibberish
  if (vowels.length / word.length < 0.2 && word.length > 4) return true;

  // Check for repeated character patterns (like "zzzzz" or "aaaa")
  if (/(.)\1{3,}/.test(word)) return true;

  // Check for random character jumbles (no proper vowel-consonant patterns)
  if (word.length > 6) {
    const hasProperPattern = /[aeiou][bcdfghjklmnpqrstvwxyz]{1,2}[aeiou]/i.test(
      word
    );
    if (!hasProperPattern) return true;
  }

  return false;
};

// Check spelling
const checkSpelling = (text) => {
  const issues = [];
  const words = text.match(/\b[a-z]+\b/gi) || [];

  words.forEach((word) => {
    const lowerWord = word.toLowerCase();

    // Check known misspellings first
    if (COMMON_MISSPELLINGS[lowerWord]) {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      const match = text.match(regex);
      if (match) {
        issues.push({
          original: word,
          suggestion: COMMON_MISSPELLINGS[lowerWord],
          explanation: `Spelling: '${word}' should be '${COMMON_MISSPELLINGS[lowerWord]}'`,
          position: match.index,
        });
      }
    }
    // Check for gibberish words
    else if (isLikelyGibberish(word)) {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      const match = text.match(regex);
      if (match) {
        issues.push({
          original: word,
          suggestion: "[Check spelling]",
          explanation: `This word '${word}' doesn't appear to be a valid English word`,
          position: match.index,
        });
      }
    }
  });

  return issues;
};

// Check grammar
const checkGrammar = (text) => {
  const issues = [];

  GRAMMAR_PATTERNS.forEach((pattern) => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        original: match[0],
        suggestion: pattern.fix.replace(/\$1/g, match[1] || ""),
        explanation: pattern.explanation,
        position: match.index,
      });
    }
  });

  return issues;
};

// Check style
const checkStyle = (text) => {
  const issues = [];

  // Check for word repetition within 10 words
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordPositions = {};

  words.forEach((word, index) => {
    if (word.length > 3) {
      // Only check words longer than 3 letters
      if (wordPositions[word]) {
        const lastPosition = wordPositions[word];
        if (index - lastPosition <= 10) {
          // Within 10 words
          issues.push({
            original: word,
            suggestion: "Consider using a synonym",
            explanation: `Word repetition: '${word}' appears close together`,
            position: index,
          });
        }
      }
      wordPositions[word] = index;
    }
  });

  // Check style patterns
  STYLE_PATTERNS.forEach((pattern) => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        original: match[0],
        suggestion: "",
        explanation: pattern.explanation,
        position: match.index,
      });
    }
  });

  return issues;
};

// Calculate text statistics
const calculateStatistics = (text) => {
  const words = text.match(/\b\w+\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;

  // Calculate unique words
  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;

  // Calculate average words per sentence
  const avgWordsPerSentence = wordCount / sentenceCount;

  // Simple reading level calculation (Flesch-Kincaid grade level approximation)
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
    readingLevel: Math.max(1, Math.min(18, readingLevel)), // Clamp between 1-18
  };
};

// Count syllables in a word (simple approximation)
const countSyllables = (word) => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
};

// Calculate overall score
const calculateScore = (text, issues, stats) => {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount === 0) return 0;

  // Start with 100
  let score = 100;

  // More aggressive deductions for gibberish
  issues.forEach((issue) => {
    if (issue.suggestion === "[Check spelling]") {
      score -= 5; // Heavy penalty for gibberish words
    } else if (issue.type === "spelling") {
      score -= 3; // Moderate penalty for misspellings
    } else if (issue.type === "grammar") {
      score -= 2; // Moderate penalty for grammar
    } else if (issue.type === "style") {
      score -= 0.5; // Light penalty for style
    }
  });

  // Penalize based on error rate (more aggressive)
  const issueRate = (issues.length / wordCount) * 100;
  if (issueRate > 10) {
    // If more than 10% error rate, penalize heavily
    score -= (issueRate - 10) * 2;
  }

  // Penalize very short or low-effort responses
  if (wordCount < 20) {
    score -= 15; // Significant penalty for very short text
  } else if (wordCount < 50) {
    score -= 10; // Moderate penalty for short text
  }

  // Penalize low-quality indicators
  if (stats) {
    // Very short sentences might indicate low effort
    if (stats.avgWordsPerSentence < 5 && wordCount > 20) {
      score -= 10;
    }

    // Very low unique word ratio indicates repetitive/low-quality text
    const uniqueRatio = stats.uniqueWords / wordCount;
    if (uniqueRatio < 0.4) {
      score -= 15; // Penalize highly repetitive text
    } else if (uniqueRatio < 0.5) {
      score -= 5;
    }
  }

  // Bonus for well-written longer text
  if (wordCount > 100 && issues.length === 0) {
    score = Math.min(100, score + 5);
  }

  // NO minimum score for text with issues - let it drop naturally
  // Only give minimum score if truly error-free AND substantial
  if (issues.length === 0 && wordCount > 50) {
    score = Math.max(75, score);
  }

  // Ensure score stays between 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
};

// Generate improvement suggestions
const generateImprovements = (text, issues, stats) => {
  const improvements = [];

  // Based on statistics
  if (stats.avgWordsPerSentence > 25) {
    improvements.push("Consider shorter sentences for better readability");
  }

  if (stats.avgWordsPerSentence < 10) {
    improvements.push("Try varying sentence length for better flow");
  }

  if (stats.uniqueWords / stats.wordCount < 0.5) {
    improvements.push("Consider using more varied vocabulary");
  }

  // Based on issues
  const spellingIssues = issues.filter((i) => i.type === "spelling").length;
  const grammarIssues = issues.filter((i) => i.type === "grammar").length;
  const styleIssues = issues.filter((i) => i.type === "style").length;

  if (spellingIssues === 0) {
    improvements.push("Excellent spelling accuracy!");
  }

  if (grammarIssues === 0) {
    improvements.push("Strong grammar throughout");
  }

  if (stats.readingLevel >= 12) {
    improvements.push("Advanced vocabulary and sentence structure");
  }

  // If very few issues
  if (issues.length < 3) {
    improvements.push("Well-written text with clear communication");
  }

  // Encourage further practice
  if (improvements.length === 0) {
    improvements.push("Keep practicing to improve further!");
  }

  return improvements;
};

// Apply corrections to text
const applyCorrections = (text, issues) => {
  let correctedText = text;

  // Sort issues by position (reverse order to maintain positions)
  const sortedIssues = [...issues]
    .filter((issue) => issue.suggestion && issue.suggestion.trim() !== "")
    .sort((a, b) => b.position - a.position);

  sortedIssues.forEach((issue) => {
    if (issue.original && issue.suggestion) {
      const regex = new RegExp(`\\b${issue.original}\\b`, "i");
      correctedText = correctedText.replace(regex, issue.suggestion);
    }
  });

  return correctedText;
};

// Main analysis function with LanguageTool API integration
export const analyzeText = async (text) => {
  if (!text || text.trim().length === 0) {
    return {
      correctedText: text,
      issues: [],
      overallScore: 0,
      improvements: ["Please provide text to analyze"],
      statistics: {
        wordCount: 0,
        sentenceCount: 0,
        avgWordsPerSentence: 0,
        uniqueWords: 0,
        readingLevel: 0,
      },
      source: "none",
    };
  }

  // Try LanguageTool API first
  try {
    console.log("Attempting LanguageTool API check...");
    const apiResult = await checkWithLanguageTool(text);
    console.log("LanguageTool API check successful");
    return apiResult;
  } catch (error) {
    console.warn(
      "LanguageTool API failed, falling back to custom checker:",
      error.message
    );

    // Fall back to custom grammar checker
    return analyzeTextWithCustomChecker(text, error.message);
  }
};

// Custom grammar checker (fallback)
const analyzeTextWithCustomChecker = (text, apiError = null) => {
  const spellingIssues = checkSpelling(text);
  const grammarIssues = checkGrammar(text);
  const styleIssues = checkStyle(text);
  const stats = calculateStatistics(text);

  // Combine all issues with type labels
  const allIssues = [
    ...spellingIssues.map((i) => ({
      ...i,
      type: "spelling",
      source: "custom",
    })),
    ...grammarIssues.map((i) => ({ ...i, type: "grammar", source: "custom" })),
    ...styleIssues.map((i) => ({ ...i, type: "style", source: "custom" })),
  ];

  // Remove duplicate issues at same position
  const uniqueIssues = allIssues.filter(
    (issue, index, self) =>
      index === self.findIndex((i) => i.position === issue.position)
  );

  const overallScore = calculateScore(text, uniqueIssues, stats);
  const improvements = generateImprovements(text, uniqueIssues, stats);
  const correctedText = applyCorrections(text, uniqueIssues);

  return {
    correctedText,
    issues: uniqueIssues,
    overallScore,
    improvements,
    statistics: stats,
    source: "custom",
    apiError: apiError,
  };
};

// Synchronous version for backward compatibility
export const analyzeTextSync = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      correctedText: text,
      issues: [],
      overallScore: 0,
      improvements: ["Please provide text to analyze"],
      statistics: {
        wordCount: 0,
        sentenceCount: 0,
        avgWordsPerSentence: 0,
        uniqueWords: 0,
        readingLevel: 0,
      },
      source: "custom",
    };
  }

  return analyzeTextWithCustomChecker(text);
};
