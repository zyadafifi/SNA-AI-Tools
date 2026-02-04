import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Trash2,
  Globe2,
  Turtle,
} from "lucide-react";
import { IoIosSend, IoIosMic } from "react-icons/io";
import { Link, useParams } from "react-router-dom";
import { readingData } from "../../config/readingData/readingData";
import { PiExam } from "react-icons/pi";

/* ========================== Device Detection ========================== */
const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

/* ========================== TTS Support & Voice Pref ========================== */
const supportsTTS =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

const PREFERRED_VOICE_NAME = "Google UK English Male";
const PREFERRED_VOICE_LANG = "en-GB";

/* ========================== Enhanced Pronunciation System ========================== */

/* ========================== Enhanced Pronunciation System (FIXED) ========================== */

// قاموس الاختصارات الشائعة
const CONTRACTIONS_MAP = {
  "i'm": "i am",
  "you're": "you are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "we're": "we are",
  "they're": "they are",
  "i'll": "i will",
  "you'll": "you will",
  "he'll": "he will",
  "she'll": "she will",
  "we'll": "we will",
  "they'll": "they will",
  "i'd": "i would",
  "you'd": "you would",
  "he'd": "he would",
  "she'd": "she would",
  "we'd": "we would",
  "they'd": "they would",
  "i've": "i have",
  "you've": "you have",
  "we've": "we have",
  "they've": "they have",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "haven't": "have not",
  "hasn't": "has not",
  "hadn't": "had not",
  "won't": "will not",
  "wouldn't": "would not",
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "can't": "cannot",
  "couldn't": "could not",
  "shouldn't": "should not",
  "mustn't": "must not",
  "needn't": "need not",
  "let's": "let us",
  "that's": "that is",
  "there's": "there is",
  "here's": "here is",
  "where's": "where is",
  "what's": "what is",
  "who's": "who is",
  "how's": "how is",
};

// دالة تطبيع النص
const normalizeText = (text) => {
  if (!text || typeof text !== "string") return "";

  let normalized = text
    .toLowerCase()
    .trim()
    // إزالة علامات الترقيم والرموز الخاصة (نترك ' للاختصارات)
    .replace(/[^\w\s']/g, " ")
    // معالجة المسافات المتعددة
    .replace(/\s+/g, " ")
    .trim();

  // استبدال الاختصارات
  Object.entries(CONTRACTIONS_MAP).forEach(([contraction, expansion]) => {
    const regex = new RegExp(`\\b${contraction}\\b`, "gi");
    normalized = normalized.replace(regex, expansion);
  });

  // تنظيف نهائي
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
};

// Tokenize موحد
const tokenize = (text) => {
  const n = normalizeText(text);
  if (!n) return [];
  return n.split(/\s+/).filter(Boolean);
};

// Levenshtein distance
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  for (let i = 0; i <= len2; i++) matrix[i] = [i];
  for (let j = 0; j <= len1; j++) matrix[0][j] = j;

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // replace
          matrix[i][j - 1] + 1, // insert
          matrix[i - 1][j] + 1, // delete
        );
      }
    }
  }
  return matrix[len2][len1];
};

// Similarity بين كلمتين (0..1)
const wordCharSimilarity = (a, b) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const d = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen ? (maxLen - d) / maxLen : 0;
};

/**
 * Alignment DP بين كلمات الأصل وكلمات المستخدم
 * الهدف: ما نعتمدش على نفس الـ index لأن أي كلمة زيادة/ناقصة تكسر التصحيح
 */
const alignWordsDP = (origWords, userWords) => {
  const n = origWords.length;
  const m = userWords.length;

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  const back = Array.from({ length: n + 1 }, () => Array(m + 1).fill(null));

  // tune penalties
  const DEL = -0.35; // missing an original word
  const INS = -0.2; // extra user word

  for (let i = 1; i <= n; i++) {
    dp[i][0] = dp[i - 1][0] + DEL;
    back[i][0] = "del";
  }
  for (let j = 1; j <= m; j++) {
    dp[0][j] = dp[0][j - 1] + INS;
    back[0][j] = "ins";
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sim = wordCharSimilarity(origWords[i - 1], userWords[j - 1]); // 0..1
      const MATCH = sim >= 0.95 ? 1.0 : sim >= 0.7 ? sim : sim * 0.5;

      const a = dp[i - 1][j - 1] + MATCH; // match
      const b = dp[i - 1][j] + DEL; // delete original word
      const c = dp[i][j - 1] + INS; // skip inserted user word

      const best = Math.max(a, b, c);
      dp[i][j] = best;
      back[i][j] = best === a ? "diag" : best === b ? "del" : "ins";
    }
  }

  // reconstruct: for each original word => matched user word or ""
  const pairs = [];
  let i = n,
    j = m;

  while (i > 0 || j > 0) {
    const step = back[i][j];
    if (step === "diag") {
      pairs.push({ orig: origWords[i - 1], user: userWords[j - 1] });
      i--;
      j--;
    } else if (step === "del") {
      pairs.push({ orig: origWords[i - 1], user: "" });
      i--;
    } else {
      // insertion: user said extra word not mapped to original
      j--;
    }
  }

  pairs.reverse();
  return { pairs, rawScore: dp[n][m] };
};

// حساب التشابه (0..100) باستخدام alignment
const calculateSimilarity = (userText, originalText) => {
  const origWords = tokenize(originalText);
  const userWords = tokenize(userText);

  if (!origWords.length || !userWords.length) return 0;

  // exact match after normalize?
  if (normalizeText(userText) === normalizeText(originalText)) return 100;

  const { pairs } = alignWordsDP(origWords, userWords);

  let sum = 0;
  for (const p of pairs) {
    sum += wordCharSimilarity(p.orig, p.user); // 0..1
  }

  const avg = sum / origWords.length;
  return Math.min(100, Math.round(avg * 100));
};

const evaluatePronunciation = (userText, originalText, confidence) => {
  const similarity = calculateSimilarity(userText, originalText);
  const confidenceScore = (confidence || 0) * 100;

  if (similarity === 100) {
    return {
      level: "excellent",
      message: "ممتاز! نطق مثالي 🎉",
      color: "green",
      score: 100,
    };
  }

  const overall = similarity * 0.85 + confidenceScore * 0.15;

  if (overall >= 90)
    return {
      level: "excellent",
      message: "ممتاز! نطق مثالي 🎉",
      color: "green",
      score: Math.round(overall),
    };
  if (overall >= 75)
    return {
      level: "very-good",
      message: "جيد جداً! نطق واضح 👏",
      color: "blue",
      score: Math.round(overall),
    };
  if (overall >= 60)
    return {
      level: "good",
      message: "جيد، يمكن تحسينه قليلاً 💪",
      color: "yellow",
      score: Math.round(overall),
    };
  if (overall >= 40)
    return {
      level: "needs-improvement",
      message: "يحتاج تحسين، حاول مرة أخرى 🔄",
      color: "orange",
      score: Math.round(overall),
    };
  return {
    level: "poor",
    message: "تحتاج إلى ممارسة أكثر 📚",
    color: "red",
    score: Math.round(overall),
  };
};

// ✅ Highlight words باستخدام نفس alignment (ده اللي بيصلّح الـ Correction)
const buildWordHighlights = (originalText, userText) => {
  const origDisplayWords = (originalText || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const origNormWords = tokenize(originalText);
  const userNormWords = tokenize(userText);

  const { pairs } = alignWordsDP(origNormWords, userNormWords);

  const len = Math.min(origDisplayWords.length, pairs.length);

  const items = [];
  for (let i = 0; i < len; i++) {
    const displayWord = origDisplayWords[i];
    const expected = pairs[i]?.orig || "";
    const said = pairs[i]?.user || "";

    const sim01 = wordCharSimilarity(expected, said);
    const sim = Math.round(sim01 * 100);

    let matchType = "wrong";
    if (sim >= 95) matchType = "exact";
    else if (sim >= 80) matchType = "close";
    else if (sim >= 60) matchType = "partial";

    items.push({
      word: displayWord,
      userWord: said,
      similarity: sim,
      matchType,
    });
  }

  return items;
};

/* =================== Permission Banner =================== */
const MicrophonePermissionAlert = ({ permission, onRequestPermission }) => {
  if (permission !== "denied") return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-[1000000] max-w-md w-full">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            إذن الميكروفون مغلق. لن تتمكن من تسجيل نطقك. الرجاء السماح بالوصول
            إلى الميكروفون في إعدادات المتصفح.
          </p>
          <button
            onClick={onRequestPermission}
            className="mt-2 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            طلب الإذن مرة أخرى
          </button>
        </div>
      </div>
    </div>
  );
};
MicrophonePermissionAlert.propTypes = {
  permission: PropTypes.string,
  onRequestPermission: PropTypes.func.isRequired,
};

/* ====================== Enhanced RecordingModal - Fixed Audio Playback & No Skip ====================== */
const RecordingModal = ({
  isOpen,
  isRecording,
  isWaitingForRecording,
  recordingResult,
  originalText,
  sentenceAudioUrl,
  onStartRecording,
  onStopRecording,
  onContinue,
  onRetry,
  playAudioFile,
  playRecordedAudio,
  audioLevels,
}) => {
  if (!isOpen) return null;

  const title = isRecording
    ? "جارٍ التسجيل"
    : recordingResult
      ? recordingResult.success
        ? "نتيجة التقييم"
        : "خطأ في التسجيل"
      : "سجّل نُطقك الآن";

  const tokens = useMemo(() => {
    const words = (originalText || "").trim().split(/\s+/).filter(Boolean);
    const fakePh = (t) =>
      t
        .toLowerCase()
        .replace(/[^a-z']/g, "")
        .replace(/([aeiouy]+)/g, "$1-")
        .replace(/-$/, "")
        .replace(/--+/g, "-");
    return words.map((w, i) => ({
      word: w,
      phon: fakePh(w) || w.toLowerCase(),
      id: `${w}-${i}`,
    }));
  }, [originalText]);

  const resultTone =
    recordingResult?.evaluation?.color === "green"
      ? "border-green-500 bg-green-50 text-green-800"
      : recordingResult?.evaluation?.color === "blue"
        ? "border-blue-500 bg-blue-50 text-blue-800"
        : recordingResult?.evaluation?.color === "yellow"
          ? "border-yellow-500 bg-yellow-50 text-yellow-800"
          : recordingResult?.evaluation?.color === "orange"
            ? "border-orange-500 bg-orange-50 text-orange-800"
            : "border-red-500 bg-red-50 text-red-800";

  const highlightWords = (orig, user) => {
    if (!orig || !user) return null;

    const items = buildWordHighlights(orig, user);

    return (
      <div>
        <div
          className="arabic_font text-lg leading-relaxed"
          dir="ltr"
          style={{ textAlign: "left" }}
        >
          {items.map((it, idx) => (
            <span key={idx}>
              <span
                className={`inline-block rounded-md font-bold transition-all px-1 ${
                  it.matchType === "exact"
                    ? "text-green-800 bg-green-100"
                    : it.matchType === "close"
                      ? "text-blue-800 bg-blue-100"
                      : it.matchType === "partial"
                        ? "text-yellow-800 bg-yellow-100"
                        : "text-red-800 bg-red-100"
                }`}
                title={
                  it.matchType === "exact"
                    ? `نطق صحيح (${it.similarity}%)`
                    : `متوقع: ${it.word}، نطقت: ${it.userWord || "لا شيء"} (${it.similarity}%)`
                }
              >
                {it.word}
              </span>
              {idx < items.length - 1 && " "}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 text-xs mt-3 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
            <span className="text-gray-600 arabic_font">مطابقة تامة</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
            <span className="text-gray-600 arabic_font">مطابقة قريبة</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />
            <span className="text-gray-600 arabic_font">مطابقة جزئية</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
            <span className="text-gray-600 arabic_font">غير مطابق</span>
          </div>
        </div>
      </div>
    );
  };

  const [elapsed, setElapsed] = useState(0);
  const startTsRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      startTsRef.current = performance.now();
      setElapsed(0);
      const tick = (now) => {
        const s = Math.floor((now - startTsRef.current) / 1000);
        setElapsed(s);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startTsRef.current = null;
    }
  }, [isRecording]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0",
    )}`;

  const androidClass = isAndroid() ? "android-modal" : "";
  const androidOptimizedClass = isAndroid() ? "android-optimized" : "";

  const handleDeleteRecording = () => {
    if (isRecording && onStopRecording) {
      onStopRecording();
    }
    if (recordingResult?.audioUrl) {
      URL.revokeObjectURL(recordingResult.audioUrl);
    }
    onRetry();
  };

  // ⬅️ الدالة الجديدة لإيقاف التسجيل فقط
  const handleStopRecording = () => {
    if (onStopRecording) {
      onStopRecording();
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] ${androidClass}`}>
      {/* لا يمكن إغلاق المودال */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className={`fixed left-0 right-0 bottom-0 mx-auto w-full max-w-xl rounded-t-3xl bg-white shadow-2xl border-t border-gray-100 ${androidOptimizedClass}`}
        role="dialog"
        aria-modal="true"
      >
        <div className={`max-h-[95vh] overflow-y-auto`}>
          <div className="relative px-5 pt-4 pb-3 border-b">
            <p className="text-center text-[22px] font-bold text-[var(--primary-color)]">
              Your turn!
            </p>
            <p className="text-center text-sm text-gray-600">
              Press the{" "}
              <span className="inline-flex translate-y-[2px]">
                <IoIosMic className="text-[var(--primary-color)]" />
              </span>{" "}
              and record your voice.
            </p>
          </div>

          <div className="px-5 pt-3">
            <h3 className="arabic_font text-center text-[15px] text-gray-700">
              {title}
            </h3>
          </div>

          <div className="px-4 py-5">
            {originalText && (
              <div className="mx-auto w-full rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-sm shadow-sm p-4">
                <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-3 select-none">
                  {tokens.map((t, i) => (
                    <div key={t.id} className="text-center">
                      <div className="px-1">
                        <span className="text-[20px] font-semibold text-gray-900 border-b-2 border-dotted border-gray-400">
                          {t.word}
                        </span>
                      </div>
                      <div className="mt-1 text-[12px] leading-none text-gray-500 flex items-center justify-center gap-1">
                        {i === tokens.length - 1 && (
                          <Globe2 size={12} className="opacity-70" />
                        )}
                        <span className="font-medium">{t.phon}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!recordingResult && !isRecording && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() =>
                    sentenceAudioUrl && playAudioFile(sentenceAudioUrl, 1)
                  }
                  disabled={!sentenceAudioUrl}
                  className={`inline-flex items-center gap-2 transition-all px-4 py-2 rounded-full text-white text-sm font-medium ${
                    isAndroid() ? "min-h-[44px]" : ""
                  } ${
                    sentenceAudioUrl
                      ? "bg-[var(--primary-color)] hover:scale-105 hover:shadow-md"
                      : "bg-[var(--primary-color)] opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Volume2 size={16} />
                  Listen
                </button>

                <button
                  onClick={onStartRecording}
                  className={[
                    "grid place-items-center rounded-full shadow-md transition-all",
                    isAndroid() ? "w-[80px] h-[80px]" : "w-[72px] h-[72px]",
                    "bg-[var(--primary-color)] text-white hover:scale-105 hover:shadow-lg",
                  ].join(" ")}
                  title="Tap to start speaking"
                  aria-label="Record"
                >
                  <IoIosMic size={isAndroid() ? 34 : 30} />
                </button>

                <button
                  onClick={() =>
                    sentenceAudioUrl && playAudioFile(sentenceAudioUrl, 0.75)
                  }
                  disabled={!sentenceAudioUrl}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium ${
                    isAndroid() ? "min-h-[44px]" : ""
                  } ${
                    sentenceAudioUrl
                      ? "bg-[var(--primary-color)] hover:scale-105 hover:shadow-md"
                      : "bg-[var(--primary-color)] opacity-50 cursor-not-allowed"
                  }`}
                  title="Listen (slow)"
                >
                  <Turtle size={16} />
                  Listen (slow)
                </button>
              </div>
            )}

            {isRecording && (
              <div className="mt-5 flex flex-col items-center gap-3">
                <div className="w-full max-w-md">
                  <div className="relative w-full rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white px-3 py-2 flex items-center shadow-lg">
                    <button
                      onClick={handleDeleteRecording}
                      className={`shrink-0 mr-2 rounded-full hover:bg-white/10 p-1.5`}
                      title="حذف"
                      aria-label="حذف التسجيل"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="flex-1 flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center gap-[3px] w-full max-w-[300px] h-10`}
                      >
                        {audioLevels.map((h, idx) => (
                          <span
                            key={idx}
                            className="inline-block w-[2.5px] rounded-full bg-white/95 transition-all duration-100 ease-linear shadow-sm"
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                      <div className="arabic_font text-[11px] mt-1 opacity-90 tracking-wider font-mono">
                        {fmt(elapsed)}
                      </div>
                    </div>

                    {/* ⬅️ الزر المعدل - يوقف التسجيل فقط */}
                    <button
                      onClick={handleStopRecording}
                      disabled={elapsed < 1}
                      className={`arabic_font flex items-center justify-center shrink-0 ml-2 rounded-full p-2 transition-all ${
                        elapsed < 1
                          ? "bg-white/50 text-gray-400 cursor-not-allowed"
                          : "bg-white text-[var(--secondary-color)] hover:bg-white/70"
                      }`}
                      title={elapsed < 1 ? "سجل لمدة ثانية على الأقل" : "إرسال"}
                      aria-label="إرسال التسجيل"
                    >
                      <IoIosSend size={20} className="flex" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 text-sm arabic_font font-medium">
                  🎤 جارٍ التسجيل... تحدث بوضوح
                </p>
              </div>
            )}

            {recordingResult && (
              <div className="mt-6 space-y-5">
                {recordingResult.success ? (
                  <>
                    <div
                      className={`mb-1 p-4 rounded-xl border-2 ${resultTone}`}
                    >
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 6L9 17l-5-5"
                          />
                        </svg>
                        <div>
                          <p className="text-base font-bold arabic_font">
                            {recordingResult.evaluation.message}
                          </p>
                          <p className="text-sm mt-1 arabic_font">
                            التشابه: {recordingResult.evaluation.score}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                      <p className="arabic_font text-sm text-gray-600 mb-3 font-bold">
                        تحليل الكلمات:
                      </p>
                      {highlightWords(
                        recordingResult.originalText,
                        recordingResult.userText,
                      )}
                    </div>

                    <div className="rounded-lg border border-blue-200 p-3 bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="arabic_font text-xs text-blue-600 font-bold">
                          ما قلته:
                        </p>
                        <button
                          onClick={() =>
                            recordingResult.audioUrl &&
                            playRecordedAudio(recordingResult.audioUrl)
                          }
                          disabled={!recordingResult.audioUrl}
                          className={`inline-flex arabic_font items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                            isAndroid() ? "min-h-[44px]" : ""
                          } ${
                            recordingResult.audioUrl
                              ? "bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            recordingResult.audioUrl
                              ? "استمع لصوتك المسجل"
                              : "التسجيل غير متاح"
                          }
                        >
                          <Volume2 size={14} />
                          استمع لصوتك
                        </button>
                      </div>
                      <p className="arabic_font text-left text-blue-900 font-medium">
                        {recordingResult.userText}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={onRetry}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors ${
                          isAndroid() ? "min-h-[48px]" : ""
                        }`}
                      >
                        <RotateCcw size={18} />
                        <span className="arabic_font">إعادة المحاولة</span>
                      </button>

                      {/* زر المتابعة يظهر فقط مع تسجيل صوتي */}
                      {recordingResult.audioUrl && (
                        <button
                          onClick={onContinue}
                          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors ${
                            isAndroid() ? "min-h-[48px]" : ""
                          }`}
                        >
                          <span className="arabic_font">متابعة</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border-2 border-red-500 bg-red-50 text-red-800">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7A2 2 0 003.53 22h16.94a2 2 0 001.72-3.44l-8.48-14.7a2 2 0 00-3.42 0z"
                          />
                        </svg>
                        <div>
                          <p className="font-semibold arabic_font">
                            لم يتم تسجيل نطق صالح
                          </p>
                          <p className="text-sm mt-1 arabic_font">
                            {recordingResult.message}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                        <p className="text-xs arabic_font text-gray-500 mb-1">
                          الجملة الأصلية
                        </p>
                        <p className="text-gray-900">
                          {recordingResult.originalText}
                        </p>
                      </div>
                      {recordingResult.userText && (
                        <div className="rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500">ما سُمع</p>
                            <button
                              onClick={() =>
                                recordingResult.audioUrl &&
                                playRecordedAudio(recordingResult.audioUrl)
                              }
                              disabled={!recordingResult.audioUrl}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                isAndroid() ? "min-h-[44px]" : ""
                              } ${
                                recordingResult.audioUrl
                                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                              title={
                                recordingResult.audioUrl
                                  ? "استمع لصوتك المسجل"
                                  : "التسجيل غير متاح"
                              }
                            >
                              <Volume2 size={14} />
                              استمع لصوتك
                            </button>
                          </div>
                          <p className="text-gray-900">
                            {recordingResult.userText}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={onRetry}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors ${
                        isAndroid() ? "min-h-[48px]" : ""
                      }`}
                    >
                      <RotateCcw size={18} />
                      <span className="arabic_font">
                        إعادة المحاولة (مطلوب للمتابعة)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

RecordingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isRecording: PropTypes.bool.isRequired,
  originalText: PropTypes.string.isRequired,
  sentenceAudioUrl: PropTypes.string,
  isWaitingForRecording: PropTypes.bool.isRequired,
  recordingResult: PropTypes.shape({
    success: PropTypes.bool,
    message: PropTypes.string,
    userText: PropTypes.string,
    originalText: PropTypes.string,
    audioUrl: PropTypes.string,
    evaluation: PropTypes.shape({
      level: PropTypes.string,
      message: PropTypes.string,
      color: PropTypes.string,
      score: PropTypes.number,
    }),
    confidence: PropTypes.number,
  }),
  onStartRecording: PropTypes.func.isRequired,
  onStopRecording: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
  playAudioFile: PropTypes.func.isRequired,
  playRecordedAudio: PropTypes.func.isRequired,
  audioLevels: PropTypes.arrayOf(PropTypes.number).isRequired,
};

/* ============================== Enhanced Clickable Word for Android ============================== */
const ClickableWord = ({
  word,
  isLast,
  onWordClick,
  activeWord,
  wordDefinitions,
  onPlayWordAudio,
}) => {
  const wordRef = useRef(null);

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();

      const cleanWord = word.replace(/[.,!?;:'"]/g, "");
      const toLowerWord = cleanWord.toLowerCase();
      const wordData = wordDefinitions[toLowerWord];

      if (!wordRef.current) return;

      const rect = wordRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      const position = {
        top: rect.top + scrollTop,
        bottom: rect.bottom + scrollTop,
        left: rect.left + scrollLeft + rect.width / 2,
      };

      onPlayWordAudio(cleanWord);

      onWordClick(
        {
          word: cleanWord,
          translation: wordData ? wordData.translation : "ترجمة غير متوفرة",
          definition: wordData
            ? wordData.definition
            : "Definition not available",
          partOfSpeech: wordData ? wordData.partOfSpeech : "word",
          rank: wordData ? wordData.rank : Math.floor(Math.random() * 1000) + 1,
        },
        position,
      );
    },
    [word, onWordClick, wordDefinitions, onPlayWordAudio],
  );

  const cleanWord = word.replace(/[.,!?;:'"]/g, "");
  const punctuation = word.slice(cleanWord.length);
  const isActive = activeWord === cleanWord;

  return (
    <>
      <span
        ref={wordRef}
        className={`text-black font-semibold text-xl hover:bg-blue-100 cursor-pointer rounded transition-all duration-200 ${
          isActive
            ? "border border-black p-1 bg-blue-50 shadow-sm"
            : "border border-transparent"
        }`}
        onClick={handleClick}
      >
        {cleanWord}
      </span>
      {punctuation && <span className="text-black">{punctuation}</span>}
      {!isLast && <span> </span>}
    </>
  );
};

ClickableWord.propTypes = {
  word: PropTypes.string.isRequired,
  isLast: PropTypes.bool.isRequired,
  onWordClick: PropTypes.func.isRequired,
  activeWord: PropTypes.string,
  wordDefinitions: PropTypes.object.isRequired,
  onPlayWordAudio: PropTypes.func.isRequired,
};

/* ================================= Enhanced Sentence for Android ================================ */
const Sentence = React.forwardRef(
  (
    {
      sentence,
      onWordClick,
      activeWord,
      isCurrentlyReading,
      wordDefinitions,
      pronunciationScore,
      onPlaySentenceAudio,
      onPlayWordAudio,
    },
    ref,
  ) => {
    const words = sentence.text.split(" ");
    return (
      <div ref={ref} className="relative">
        <div className="flex items-center mb-2">
          <p
            className={`leading-relaxed w-fit text-gray-800 transition-all duration-500 rounded-lg text-lg p-2
             ${
               isCurrentlyReading
                 ? "underline underline-offset-8 decoration-4 decoration-red-500 shadow-xl transform scale-[1.02] bg-yellow-50"
                 : "hover:bg-gray-50"
             }`}
          >
            {words.map((word, index) => (
              <ClickableWord
                key={index}
                word={word}
                isLast={index == words.length - 1}
                onWordClick={onWordClick}
                activeWord={activeWord}
                wordDefinitions={wordDefinitions}
                onPlayWordAudio={onPlayWordAudio}
              />
            ))}
          </p>

          {sentence.audioUrl && (
            <button
              onClick={() => onPlaySentenceAudio(sentence.audioUrl)}
              className={`ml-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors p-2`}
              title="تشغيل الجملة"
            >
              <Volume2 size={16} className="text-blue-600" />
            </button>
          )}
        </div>

        {typeof pronunciationScore === "number" && (
          <div
            className={`absolute -top-2 -right-2 rounded-full flex items-center justify-center text-xs font-bold w-8 h-8
             ${
               pronunciationScore >= 85
                 ? "bg-green-100 text-green-800"
                 : pronunciationScore >= 70
                   ? "bg-blue-100 text-blue-800"
                   : pronunciationScore >= 50
                     ? "bg-yellow-100 text-yellow-800"
                     : "bg-red-100 text-red-800"
             }`}
          >
            {pronunciationScore}
          </div>
        )}
      </div>
    );
  },
);

Sentence.displayName = "Sentence";
Sentence.propTypes = {
  sentence: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    audioUrl: PropTypes.string,
  }).isRequired,
  onWordClick: PropTypes.func.isRequired,
  activeWord: PropTypes.string,
  isCurrentlyReading: PropTypes.bool,
  wordDefinitions: PropTypes.object.isRequired,
  pronunciationScore: PropTypes.number,
  onPlaySentenceAudio: PropTypes.func.isRequired,
  onPlayWordAudio: PropTypes.func.isRequired,
};

/* ------------------------------------------------------------------ */
/* Word Popover (replaces Sidebar)                                   */
/* ------------------------------------------------------------------ */
const WordPopover = ({
  isOpen,
  selectedWordData,
  position,
  onClose,
  onPlayWordAudio,
}) => {
  if (!isOpen || !selectedWordData || !position) return null;

  const popoverWidth = 320;
  const estimatedHeight = 250;

  let top = position.top;
  let left = position.left - popoverWidth / 2;
  let showBelow = false;

  if (position.top < estimatedHeight + 100) {
    showBelow = true;
    top = position.bottom + 10;
  } else {
    top = position.top - estimatedHeight - 10;
  }

  const maxLeft = window.innerWidth - popoverWidth - 20;
  if (left < 20) left = 20;
  else if (left > maxLeft) left = maxLeft;

  const arrowLeft = position.left - left;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-20 md:bg-transparent"
        onClick={onClose}
      />

      <div
        className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200"
        style={{
          top: `${top - 65}px`,
          left: `${left}px`,
          width: `${popoverWidth}px`,
          maxWidth: "calc(100vw - 40px)",
        }}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 break-all flex-1 mr-2">
            {selectedWordData.word}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayWordAudio(selectedWordData.word);
              }}
              className="p-1.5 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] rounded-lg transition-all duration-200"
              aria-label="Play pronunciation"
            >
              <Volume2 size={16} className="text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Close"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          <div>
            <p className="arabic_font text-right text-base text-gray-700 font-medium">
              {selectedWordData.translation}
            </p>
          </div>

          {selectedWordData.definition && (
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Definition
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedWordData.definition}
              </p>
            </div>
          )}
        </div>

        <div
          className={`absolute w-3 h-3 bg-white border border-gray-200 transform rotate-45 ${
            showBelow
              ? "border-b-0 border-r-0 -top-[7px]"
              : "border-t-0 border-l-0 -bottom-[7px]"
          }`}
          style={{
            left: `${Math.max(10, Math.min(arrowLeft, popoverWidth - 10))}px`,
          }}
        />
      </div>
    </>
  );
};

WordPopover.propTypes = {
  isOpen: PropTypes.bool,
  selectedWordData: PropTypes.object,
  position: PropTypes.shape({
    top: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
  onClose: PropTypes.func,
  onPlayWordAudio: PropTypes.func,
};

/* ================================ Enhanced ShowLesson with Android Support ================================ */
export function ShowLesson() {
  const { levelId, lessonId } = useParams();
  const lessonIdNum = parseInt(lessonId);

  const currentLesson = readingData
    .find((level) => level.id == levelId)
    .lessons.find((lesson) => lesson.id == lessonIdNum);
  const currentLevel = readingData.find((level) => level.id == levelId);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState(null);
  const [selectedWordData, setSelectedWordData] = useState(null);
  const [activeWord, setActiveWord] = useState(null);

  const [isReading, setIsReading] = useState(false);
  const [currentReadingSentenceId, setCurrentReadingSentenceId] =
    useState(null);
  const [autoScroll] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [isWaitingForRecording, setIsWaitingForRecording] = useState(false);
  const [recordingResult, setRecordingResult] = useState(null);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [pronunciationEnabled] = useState(true);
  const [pronunciationScores, setPronunciationScores] = useState({});
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [audioLevels, setAudioLevels] = useState(Array(28).fill(8));

  // audio/voice
  const [voices, setVoices] = useState([]);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loopEnabled, setLoopEnabled] = useState(false);

  // ✅ performance: throttle time updates
  const timeUpdateRafRef = useRef(null);
  const lastTimeUpdateMsRef = useRef(0);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const durationsRef = useRef({});
  const [lessonTotalDuration, setLessonTotalDuration] = useState(0);
  const [lessonElapsed, setLessonElapsed] = useState(0);

  const readingTimeoutRef = useRef(null);

  const readingStateRef = useRef({
    isReading: false,
    currentIndex: 0,
    shouldStop: false,
  });

  // ✅ NEW: resume state (stop -> resume from where paused)
  const resumeRef = useRef({
    hasPosition: false,
    index: 0,
    timeInSentence: 0,
  });

  const sentenceRefs = useRef({});
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordedAudioRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const isRecordingActiveRef = useRef(false);
  const BAR_COUNT = 28;

  // Android-specific styles injection
  useEffect(() => {
    if (isAndroid()) {
      const style = document.createElement("style");
      style.textContent = `
        .android-modal {
          -webkit-tap-highlight-color: transparent;
        }
        .android-optimized {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
        .android-optimized button {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  // --- preload lesson audio metadata
  useEffect(() => {
    let active = true;
    const loaders = [];
    durationsRef.current = {}; // ✅ reset on lesson change

    if (currentLesson?.storyData?.content?.length) {
      currentLesson.storyData.content.forEach((s) => {
        if (s.audioUrl) {
          const a = new Audio();
          a.preload = "metadata";
          a.src = s.audioUrl;
          const onLoaded = () => {
            const d = Number.isFinite(a.duration) ? a.duration : 0;
            durationsRef.current[s.id] = d;
            if (active) {
              const total = Object.values(durationsRef.current).reduce(
                (acc, v) => acc + (Number.isFinite(v) ? v : 0),
                0,
              );
              setLessonTotalDuration(total);
            }
          };
          a.addEventListener("loadedmetadata", onLoaded);
          loaders.push({ a, onLoaded });
        }
      });
    }
    return () => {
      active = false;
      loaders.forEach(({ a, onLoaded }) =>
        a.removeEventListener("loadedmetadata", onLoaded),
      );
    };
  }, [currentLesson]);

  const fmt = (s) => {
    if (!Number.isFinite(s)) return "00:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      try {
        audioRef.current.playbackRate = rate;
      } catch {}
    }
  };

  const sumDurationsBeforeIndex = useCallback(
    (idx) => {
      if (!currentLesson?.storyData?.content) return 0;
      let sum = 0;
      for (let i = 0; i < idx; i++) {
        const sid = currentLesson.storyData.content[i].id;
        sum += Number.isFinite(durationsRef.current[sid])
          ? durationsRef.current[sid]
          : 0;
      }
      return sum;
    },
    [currentLesson],
  );

  /* ------------------------------ Load voices ----------------------------- */
  useEffect(() => {
    if (!supportsTTS) return;
    const loadVoices = () =>
      setVoices(window.speechSynthesis.getVoices() || []);
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const pickVoice = useCallback(() => {
    if (!voices.length) return null;
    const byName =
      voices.find((v) =>
        (v.name || "")
          .toLowerCase()
          .includes(PREFERRED_VOICE_NAME.toLowerCase()),
      ) ||
      voices.find((v) =>
        (v.voiceURI || "")
          .toLowerCase()
          .includes(PREFERRED_VOICE_NAME.toLowerCase()),
      );
    if (byName) return byName;
    const byLang = voices.find((v) =>
      (v.lang || "")
        .toLowerCase()
        .startsWith(PREFERRED_VOICE_LANG.toLowerCase()),
    );
    if (byLang) return byLang;
    return voices.find((v) => (v.lang || "").startsWith("en")) || voices[0];
  }, [voices]);

  const speak = useCallback(
    (text, rate = playbackRate) => {
      const toSay = (text || "").trim();
      if (!toSay) return;

      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }

      if (supportsTTS) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(toSay);
          const v = pickVoice();
          if (v) utter.voice = v;
          utter.lang = v?.lang || PREFERRED_VOICE_LANG || "en-US";
          utter.rate = Math.min(2, Math.max(0.4, rate || 1));
          utter.pitch = 1;
          utter.volume = 1;
          window.speechSynthesis.speak(utter);
          return;
        } catch (e) {
          console.error("TTS failed, fallback to MP3:", e);
        }
      }

      const url = `https://cdn13674550.b-cdn.net/SNA-audio/words/${toSay.toLowerCase()}.mp3`;
      audioRef.current = new Audio(url);
      try {
        audioRef.current.playbackRate = rate || 1;
      } catch {}
      audioRef.current
        .play()
        .catch((err) => console.error("TTS+MP3 fallback failed:", err));
    },
    [pickVoice, playbackRate],
  );

  /* -------------------------- Enhanced Microphone permission for Android -------------------------- */
  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({
          name: "microphone",
        });
        setMicrophonePermission(permissionStatus.state);
        permissionStatus.onchange = () =>
          setMicrophonePermission(permissionStatus.state);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((t) => t.stop());
        setMicrophonePermission("granted");
      }
    } catch (error) {
      if (error.name === "NotAllowedError") setMicrophonePermission("denied");
      else setMicrophonePermission("prompt");
    }
  }, []);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicrophonePermission("granted");
      return true;
    } catch (error) {
      console.error("Microphone permission request failed:", error);
      setMicrophonePermission("denied");
      return false;
    }
  }, []);

  useEffect(() => {
    checkMicrophonePermission();
    initializeSpeechRecognition();
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      isRecordingActiveRef.current = false;
      if (silenceTimeoutRef.current) {
        cancelAnimationFrame(silenceTimeoutRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recordedAudioRef.current) {
        URL.revokeObjectURL(recordedAudioRef.current);
      }
    };
  }, [checkMicrophonePermission]);

  // ====================== Enhanced Speech Recognition for Android ======================
  const initializeSpeechRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        if (!isAndroid()) {
          startAudioRecording();
        }
      };

      recognitionRef.current.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript
          .toLowerCase()
          .trim();
        const confidence = event.results[lastResultIndex][0].confidence;

        if (!window.lastRecognitionResult) {
          window.lastRecognitionResult = { transcript: "", confidence: 0 };
        }
        window.lastRecognitionResult = { transcript, confidence };
      };

      recognitionRef.current.onerror = (event) => {
        setIsRecording(false);
        setIsWaitingForRecording(false);

        if (!isAndroid()) {
          stopAudioRecording();
        }

        if (event.error === "no-speech") {
          setRecordingResult({
            success: false,
            message: "لم يتم سماع أي صوت. حاول مرة أخرى.",
            userText: "",
            originalText:
              currentLesson?.storyData?.content[
                readingStateRef.current.currentIndex - 1
              ]?.text || "",
            audioUrl: null,
          });
          setShowRecordingModal(true);
        } else if (event.error === "network" && isAndroid()) {
          startAudioOnlyRecording();
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        if (!isAndroid()) stopAudioRecording();

        if (
          window.lastRecognitionResult &&
          window.lastRecognitionResult.transcript
        ) {
          const { transcript, confidence } = window.lastRecognitionResult;

          if (isAndroid()) {
            startQuickAudioRecording(() => {
              handleRecognitionResult(transcript, confidence);
              window.lastRecognitionResult = null;
            });
          } else {
            setTimeout(() => {
              handleRecognitionResult(transcript, confidence);
              window.lastRecognitionResult = null;
            }, 200);
          }
        }
      };
    } else {
      console.log("❌ Speech recognition not supported");
    }
  };

  const startQuickAudioRecording = async (callback) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm; codecs=opus")
          ? "audio/webm; codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : MediaRecorder.isTypeSupported("audio/mp4")
              ? "audio/mp4"
              : "",
      });

      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        try {
          const audioUrl = URL.createObjectURL(audioBlob);
          recordedAudioRef.current = audioUrl;
        } catch (error) {
          console.error("Error creating audio URL:", error);
          recordedAudioRef.current = null;
        }

        stream.getTracks().forEach((track) => track.stop());
        if (callback) callback();
      };

      mediaRecorder.onerror = (error) => {
        console.error("MediaRecorder error:", error);
        stream.getTracks().forEach((track) => track.stop());
        if (callback) callback();
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === "recording") mediaRecorder.stop();
      }, 1000);
    } catch (error) {
      console.error("Quick audio recording failed:", error);
      if (callback) callback();
    }
  };

  const startAudioOnlyRecording = async () => {
    try {
      setIsRecording(true);
      setIsWaitingForRecording(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm; codecs=opus")
          ? "audio/webm; codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : MediaRecorder.isTypeSupported("audio/mp4")
              ? "audio/mp4"
              : "",
      });

      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        let audioUrl;
        try {
          audioUrl = URL.createObjectURL(audioBlob);
          recordedAudioRef.current = audioUrl;
        } catch (error) {
          console.error("Error creating audio URL:", error);
          audioUrl = null;
        }

        setRecordingResult({
          success: false,
          message: "تم حفظ التسجيل الصوتي فقط. التعرف على الكلام غير متاح.",
          userText: "",
          originalText:
            currentLesson?.storyData?.content[
              readingStateRef.current.currentIndex - 1
            ]?.text || "",
          audioUrl: audioUrl,
        });
        setShowRecordingModal(true);
        setIsRecording(false);
        setIsWaitingForRecording(false);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = (error) => {
        console.error("MediaRecorder error:", error);
        setIsRecording(false);
        setIsWaitingForRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === "recording") mediaRecorder.stop();
      }, 5000);
    } catch (error) {
      setIsRecording(false);
      setIsWaitingForRecording(false);
      console.error("Audio-only recording failed:", error);
    }
  };

  const startAudioRecording = async () => {
    if (isAndroid()) return;

    try {
      audioChunksRef.current = [];
      if (recordedAudioRef.current) {
        URL.revokeObjectURL(recordedAudioRef.current);
        recordedAudioRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      isRecordingActiveRef.current = true;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        recordedAudioRef.current = audioUrl;

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        isRecordingActiveRef.current = false;
      };

      mediaRecorder.start();
      startSilenceDetection(stream);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      isRecordingActiveRef.current = false;
    }
  };

  const startSilenceDetection = useCallback(
    (stream) => {
      if (isAndroid()) return;

      try {
        const audioContext = new (
          window.AudioContext || window.webkitAudioContext
        )();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0;

        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // ✅ performance: update waveform every ~2 frames
        let frame = 0;

        const detectSilence = () => {
          if (!isRecordingActiveRef.current) {
            setAudioLevels(Array(BAR_COUNT).fill(8));
            return;
          }

          analyser.getByteFrequencyData(dataArray);

          frame++;
          if (frame % 2 === 0) {
            const waveformData = [];
            const step = Math.floor(bufferLength / BAR_COUNT);
            for (let i = 0; i < BAR_COUNT; i++) {
              const index = i * step;
              const value = dataArray[index] || 0;
              const height = Math.max(8, Math.min(36, 8 + (value / 180) * 28));
              waveformData.push(height);
            }
            setAudioLevels(waveformData);
          }

          if (silenceTimeoutRef.current) {
            cancelAnimationFrame(silenceTimeoutRef.current);
          }
          silenceTimeoutRef.current = requestAnimationFrame(detectSilence);
        };

        detectSilence();
      } catch (error) {
        console.error("Error setting up silence detection:", error);
      }
    },
    [BAR_COUNT],
  );

  const stopAudioRecording = () => {
    if (isAndroid()) return;

    isRecordingActiveRef.current = false;

    if (silenceTimeoutRef.current) {
      cancelAnimationFrame(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    setAudioLevels(Array(BAR_COUNT).fill(8));

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  /* --------------------------- Scroll to sentence --------------------------- */
  const scrollToCurrentSentence = useCallback(
    (sentenceId) => {
      if (autoScroll && sentenceRefs.current[sentenceId]) {
        sentenceRefs.current[sentenceId].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
    [autoScroll],
  );

  const handleRecognitionResult = (transcript, confidence) => {
    const idx = readingStateRef.current.currentIndex - 1;
    const originalSentence = currentLesson.storyData.content[idx];
    if (originalSentence) {
      const evaluation = evaluatePronunciation(
        transcript,
        originalSentence.text,
        confidence,
      );
      setRecordingResult({
        success: true,
        userText: transcript,
        originalText: originalSentence.text,
        evaluation,
        confidence: Math.round(confidence * 100),
        audioUrl: recordedAudioRef.current,
      });
      setPronunciationScores((prev) => ({
        ...prev,
        [originalSentence.id]: evaluation.score,
      }));
      setShowRecordingModal(true);
      setIsWaitingForRecording(false);
    }
  };

  /* ------------------------------ Enhanced Recording API for Android ----------------------------- */
  const startRecording = useCallback(async () => {
    if (!recognitionRef.current) {
      if (isAndroid()) {
        startAudioOnlyRecording();
        return;
      }
      alert("التسجيل الصوتي غير مدعوم في متصفحك. جرب Chrome أو Edge");
      return;
    }

    try {
      if (microphonePermission === "denied") {
        const granted = await requestMicrophonePermission();
        if (!granted) {
          alert("تم رفض إذن الميكروفون. فعِّل الإذن من إعدادات المتصفح.");
          return;
        }
      }

      setRecordingResult(null);
      window.lastRecognitionResult = null;

      if (isAndroid()) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        recognitionRef.current.start();
      } else {
        recognitionRef.current.start();
      }
    } catch (error) {
      setIsRecording(false);
      setIsWaitingForRecording(false);

      if (error.name === "NotAllowedError") {
        setMicrophonePermission("denied");
        alert("تم رفض إذن الميكروفون. الرجاء السماح بالوصول للميكروفون.");
      } else if (isAndroid()) {
        startAudioOnlyRecording();
      }
    }
  }, [microphonePermission, requestMicrophonePermission]);

  const stopRecordingManually = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Recognition already stopped");
      }
    }
    if (!isAndroid()) {
      stopAudioRecording();
    }
  }, [isRecording]);

  const continueToNextSentence = () => {
    setShowRecordingModal(false);
    setRecordingResult(null);

    if (recordedAudioRef.current) {
      URL.revokeObjectURL(recordedAudioRef.current);
      recordedAudioRef.current = null;
    }

    if (!readingStateRef.current.shouldStop) {
      readingTimeoutRef.current = setTimeout(() => {
        window.speakNextSentence?.();
      }, 1000);
    }
  };

  const retryRecording = () => {
    if (recordedAudioRef.current) {
      URL.revokeObjectURL(recordedAudioRef.current);
      recordedAudioRef.current = null;
    }
    setRecordingResult(null);
    setIsWaitingForRecording(false);
    window.lastRecognitionResult = null;

    setTimeout(() => {
      startRecording();
    }, 300);
  };

  /* ---------------- Word click (open/close popover) ---------------- */
  const handleWordClick = useCallback((wordData, position) => {
    setSelectedWordData((prev) => {
      if (prev && prev.word === wordData.word) {
        setPopoverOpen(false);
        setActiveWord(null);
        setPopoverPosition(null);
        return null;
      } else {
        setPopoverOpen(true);
        setActiveWord(wordData.word);
        setPopoverPosition(position);
        return wordData;
      }
    });
  }, []);

  const closePopover = () => {
    setPopoverOpen(false);
    setActiveWord(null);
    setSelectedWordData(null);
    setPopoverPosition(null);
  };

  /* ------------------------------ Enhanced Audio Playback for Mobile ------------------------------ */
  const playSentenceAudio = useCallback(
    (audioUrl, startAt = 0) => {
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      try {
        audio.playbackRate = playbackRate;
      } catch {}

      audio.onloadedmetadata = () => {
        const d = Number.isFinite(audio.duration) ? audio.duration : 0;
        setDuration(d);

        // ✅ seek after metadata
        if (Number.isFinite(startAt) && startAt > 0) {
          try {
            audio.currentTime = Math.max(0, Math.min(startAt, d || startAt));
          } catch {}
        }
      };

      // ✅ performance: throttle updates (every ~150ms)
      audio.ontimeupdate = () => {
        const nowMs = performance.now();
        if (nowMs - lastTimeUpdateMsRef.current < 150) return;
        lastTimeUpdateMsRef.current = nowMs;

        if (timeUpdateRafRef.current)
          cancelAnimationFrame(timeUpdateRafRef.current);
        timeUpdateRafRef.current = requestAnimationFrame(() => {
          const now = Number.isFinite(audio.currentTime)
            ? audio.currentTime
            : 0;
          setCurrentTime(now);
          const base = sumDurationsBeforeIndex(
            readingStateRef.current.currentIndex,
          );
          setLessonElapsed(base + now);
        });
      };

      audio.onended = () => {
        setCurrentTime(0);
        const base = sumDurationsBeforeIndex(
          readingStateRef.current.currentIndex,
        );
        setLessonElapsed(base);
      };

      audio.onerror = () => {
        setDuration(0);
        setCurrentTime(0);
      };

      const playAudio = () => {
        audio.play().catch((e) => {
          console.error("Error playing audio:", e);
          if (e.name === "NotSupportedError") {
            try {
              audio.playbackRate = 1;
            } catch {}
            audio.play().catch(console.error);
          }
        });
      };

      if (isMobileDevice()) {
        if (audio.readyState >= 2) playAudio();
        else audio.addEventListener("canplay", playAudio, { once: true });
      } else {
        playAudio();
      }
    },
    [playbackRate, sumDurationsBeforeIndex],
  );

  const playAudioFile = useCallback((audioUrl, rate = 1) => {
    if (!audioUrl) return;

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    if (isMobileDevice()) {
      audio.addEventListener("loadeddata", () => {
        try {
          if (rate !== 1 && audio.playbackRate !== undefined) {
            audio.playbackRate = rate;
          }
        } catch {
          console.warn("Playback rate not supported on this device");
        }
      });

      const playMobileAudio = () => {
        audio.play().catch((err) => {
          console.error("Error playing audio on mobile:", err);
          if (err.name === "NotSupportedError") {
            try {
              audio.playbackRate = 1;
            } catch {}
            audio.play().catch(console.error);
          }
        });
      };

      if (audio.readyState >= 2) playMobileAudio();
      else audio.addEventListener("canplay", playMobileAudio, { once: true });
    } else {
      try {
        audio.playbackRate = rate;
      } catch {}
      audio.play().catch((err) => console.error("Error playing audio:", err));
    }
  }, []);

  const playRecordedAudio = useCallback((audioUrl) => {
    if (!audioUrl) return;

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    const audio = new Audio();
    audioRef.current = audio;

    if (isAndroid()) {
      audio.preload = "auto";

      audio.addEventListener("error", (e) => {
        console.error("Android audio error:", e);

        fetch(audioUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result;
              const fallbackAudio = new Audio(dataUrl);
              fallbackAudio.play().catch((err) => {
                console.error("Data URL fallback failed:", err);
                alert("عذراً، حدث خطأ في تشغيل التسجيل");
              });
            };
            reader.readAsDataURL(blob);
          })
          .catch((err) => console.error("Blob conversion failed:", err));
      });

      audio.src = audioUrl;
      audio.load();

      const playWhenReady = () => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error("Android play failed:", err);
            setTimeout(() => {
              audio.play().catch((e) => console.error("Retry failed:", e));
            }, 100);
          });
        }
      };

      if (audio.readyState >= 3) playWhenReady();
      else audio.addEventListener("canplay", playWhenReady, { once: true });
    } else if (isMobileDevice()) {
      audio.preload = "auto";
      audio.src = audioUrl;
      audio.load();

      const playIOS = () => {
        audio.play().catch((err) => {
          console.error("iOS play failed:", err);
          setTimeout(() => audio.play().catch(console.error), 100);
        });
      };

      if (audio.readyState >= 2) playIOS();
      else audio.addEventListener("canplay", playIOS, { once: true });
    } else {
      audio.src = audioUrl;
      audio.play().catch((err) => console.error("Desktop play failed:", err));
    }
  }, []);

  const playWordAudio = useCallback(
    (word) => {
      const clean = (word || "").replace(/[^\w'-]/g, "");
      if (!clean) return;
      speak(clean);
    },
    [speak],
  );

  /* ------------------------------ Read all sentences / Resume ------------------------------ */
  const readAllSentences = useCallback(
    (startIndex = 0, startAtSeconds = 0) => {
      if (!currentLesson || !currentLesson.storyData?.content?.length) return;

      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }

      readingStateRef.current = {
        isReading: true,
        currentIndex: Math.max(0, startIndex),
        shouldStop: false,
      };

      setIsReading(true);
      setIsWaitingForRecording(false);
      setShowRecordingModal(false);

      const speakNextSentence = (forceSeekSeconds = 0) => {
        const { currentIndex, shouldStop } = readingStateRef.current;
        const total = currentLesson.storyData.content.length;

        if (shouldStop || currentIndex >= total) {
          setIsReading(false);
          setCurrentReadingSentenceId(null);
          setReadingProgress(shouldStop ? readingProgress : 100);
          readingStateRef.current.isReading = false;

          if (loopEnabled && !shouldStop) {
            setTimeout(() => {
              if (!readingStateRef.current.shouldStop) {
                resumeRef.current = {
                  hasPosition: false,
                  index: 0,
                  timeInSentence: 0,
                };
                readAllSentences(0, 0);
              }
            }, 400);
          }
          return;
        }

        const sentence = currentLesson.storyData.content[currentIndex];
        const progress = ((currentIndex + 1) / total) * 100;

        setCurrentReadingSentenceId(sentence.id);
        setReadingProgress(progress);
        scrollToCurrentSentence(sentence.id);

        const base = sumDurationsBeforeIndex(currentIndex);
        setLessonElapsed(base + (forceSeekSeconds || 0));

        if (sentence.audioUrl) {
          playSentenceAudio(sentence.audioUrl, forceSeekSeconds);

          if (audioRef.current) {
            audioRef.current.onended = () => {
              if (!readingStateRef.current.shouldStop) {
                readingStateRef.current.currentIndex++;
                resumeRef.current = {
                  hasPosition: true,
                  index: readingStateRef.current.currentIndex,
                  timeInSentence: 0,
                };

                if (pronunciationEnabled) {
                  setIsWaitingForRecording(true);
                  setShowRecordingModal(true);
                } else {
                  readingTimeoutRef.current = setTimeout(
                    () => speakNextSentence(0),
                    500,
                  );
                }
              }
            };

            audioRef.current.onerror = () => {
              if (!readingStateRef.current.shouldStop) {
                readingStateRef.current.currentIndex++;
                resumeRef.current = {
                  hasPosition: true,
                  index: readingStateRef.current.currentIndex,
                  timeInSentence: 0,
                };

                if (pronunciationEnabled) {
                  setIsWaitingForRecording(true);
                  setShowRecordingModal(true);
                } else {
                  readingTimeoutRef.current = setTimeout(
                    () => speakNextSentence(0),
                    500,
                  );
                }
              }
            };
          }
        } else {
          readingStateRef.current.currentIndex++;
          resumeRef.current = {
            hasPosition: true,
            index: readingStateRef.current.currentIndex,
            timeInSentence: 0,
          };

          if (pronunciationEnabled) {
            setIsWaitingForRecording(true);
            setShowRecordingModal(true);
          } else {
            readingTimeoutRef.current = setTimeout(
              () => speakNextSentence(0),
              1000,
            );
          }
        }
      };

      window.speakNextSentence = speakNextSentence;

      // ✅ first call: can resume mid-sentence
      speakNextSentence(Math.max(0, startAtSeconds || 0));
    },
    [
      currentLesson,
      scrollToCurrentSentence,
      pronunciationEnabled,
      playSentenceAudio,
      loopEnabled,
      sumDurationsBeforeIndex,
      readingProgress,
    ],
  );

  // ✅ Stop = Pause (no reset)
  const pauseReading = useCallback(() => {
    // mark stop so speakNextSentence won't continue
    readingStateRef.current.shouldStop = true;
    readingStateRef.current.isReading = false;

    // ✅ save resume position
    const idx = readingStateRef.current.currentIndex;
    const t = audioRef.current?.currentTime || 0;

    resumeRef.current = {
      hasPosition: true,
      index: Math.max(0, idx),
      timeInSentence: Number.isFinite(t) ? t : 0,
    };

    setIsReading(false);
    setCurrentReadingSentenceId(null);
    setIsWaitingForRecording(false);
    // ما تقفلش المودال لو كان مفتوح بسبب نطق؟ أنت طلبت "stop" يوقف كل حاجة
    setShowRecordingModal(false);

    if (recognitionRef.current && isRecording) recognitionRef.current.abort();

    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
    }
    if (readingTimeoutRef.current) {
      clearTimeout(readingTimeoutRef.current);
      readingTimeoutRef.current = null;
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }, [isRecording]);

  // ✅ Reset = stop + back to start
  const resetReading = useCallback(() => {
    resumeRef.current = { hasPosition: false, index: 0, timeInSentence: 0 };

    readingStateRef.current.shouldStop = true;
    readingStateRef.current.isReading = false;
    readingStateRef.current.currentIndex = 0;

    setIsReading(false);
    setCurrentReadingSentenceId(null);
    setReadingProgress(0);
    setIsWaitingForRecording(false);
    setShowRecordingModal(false);

    if (recognitionRef.current && isRecording) recognitionRef.current.abort();

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    if (readingTimeoutRef.current) {
      clearTimeout(readingTimeoutRef.current);
      readingTimeoutRef.current = null;
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setCurrentTime(0);
    setDuration(0);
    setLessonElapsed(0);
  }, [isRecording]);

  // ✅ toggle: if paused -> resume, else start from beginning
  const resumeOrStart = useCallback(() => {
    if (!currentLesson?.storyData?.content?.length) return;

    const canResume = resumeRef.current.hasPosition;
    const index = canResume ? resumeRef.current.index : 0;
    const time = canResume ? resumeRef.current.timeInSentence : 0;

    readingStateRef.current.shouldStop = false;
    readingStateRef.current.isReading = true;

    setIsReading(true);
    setIsWaitingForRecording(false);
    setShowRecordingModal(false);

    readAllSentences(index, time);
  }, [currentLesson, readAllSentences]);

  const togglePlayPause = () => (isReading ? pauseReading() : resumeOrStart());

  useEffect(() => {
    return () => {
      readingStateRef.current.shouldStop = true;
      if (readingTimeoutRef.current) clearTimeout(readingTimeoutRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      if (timeUpdateRafRef.current)
        cancelAnimationFrame(timeUpdateRafRef.current);
    };
  }, []);

  useEffect(() => {
    if (showRecordingModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showRecordingModal]);

  /* ---------------------------------- UI ---------------------------------- */
  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Lesson not found
          </h2>
          <p className="text-gray-500">
            The requested lesson could not be found.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const currentSentenceText =
    currentLesson?.storyData?.content?.[
      readingStateRef.current.currentIndex - 1
    ]?.text || "";

  const currentSentenceAudioUrl =
    currentLesson?.storyData?.content?.[
      readingStateRef.current.currentIndex - 1
    ]?.audioUrl || "";

  return (
    <div className="min-h-screen">
      <MicrophonePermissionAlert
        permission={microphonePermission}
        onRequestPermission={requestMicrophonePermission}
      />

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Link
              to="/reading"
              className={`text-[var(--secondary-color)] p-2 hover:bg-gray-200 rounded-full transition-colors`}
            >
              <X size={29} />
            </Link>

            {(isReading || resumeRef.current.hasPosition) && (
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300 ease-out"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {Math.round(readingProgress)}%
                </span>

                {/* ✅ Reset button (optional) */}
                <button
                  onClick={resetReading}
                  className="ml-1 inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200"
                  title="إعادة من البداية"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-0">
          <div
            className={`rounded-lg overflow-hidden flex-shrink-0 shadow-md w-16 h-16 sm:w-20 sm:h-20`}
          >
            <img
              src={currentLevel.image}
              alt={currentLevel.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h1
              className={`font-semibold text-gray-800 mb-1 text-lg sm:text-xl`}
            >
              {currentLesson.title}
            </h1>
            <p className={`text-gray-600 line-clamp-2 text-sm sm:text-base`}>
              {currentLesson.description}
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-24">
          {currentLesson.storyData.content.map((sentence) => (
            <Sentence
              key={sentence.id}
              ref={(el) => (sentenceRefs.current[sentence.id] = el)}
              sentence={sentence}
              onWordClick={handleWordClick}
              activeWord={activeWord}
              isCurrentlyReading={currentReadingSentenceId === sentence.id}
              wordDefinitions={currentLesson.wordDefinitions}
              pronunciationScore={pronunciationScores[sentence.id]}
              onPlaySentenceAudio={(url) => playSentenceAudio(url, 0)}
              onPlayWordAudio={playWordAudio}
            />
          ))}
        </div>
      </div>

      {/* Word Popover */}
      <WordPopover
        isOpen={popoverOpen}
        selectedWordData={selectedWordData}
        position={popoverPosition}
        onClose={closePopover}
        onPlayWordAudio={playWordAudio}
      />

      {/* Recording modal */}
      <RecordingModal
        isOpen={showRecordingModal}
        isRecording={isRecording}
        isWaitingForRecording={isWaitingForRecording}
        recordingResult={recordingResult}
        onStartRecording={startRecording}
        onStopRecording={stopRecordingManually}
        originalText={currentSentenceText}
        sentenceAudioUrl={currentSentenceAudioUrl}
        onContinue={continueToNextSentence}
        onRetry={retryRecording}
        playAudioFile={playAudioFile}
        playRecordedAudio={playRecordedAudio}
        audioLevels={audioLevels}
      />

      {/* Mini Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-4xl">
          <div className="mx-4 mb-3 rounded-2xl bg-white shadow-[0_-6px_24px_rgba(0,0,0,0.08)] border border-gray-100">
            {/* Progress bar */}
            <div
              className="h-1 w-full bg-gray-200 rounded-t-2xl overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (
                  !audioRef.current ||
                  !Number.isFinite(duration) ||
                  duration === 0
                )
                  return;

                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.min(
                  1,
                  Math.max(0, (e.clientX - rect.left) / rect.width),
                );
                const t = ratio * duration;

                try {
                  audioRef.current.currentTime = t;
                } catch {}

                // ✅ also update resume point (so pause/resume keeps seek)
                resumeRef.current = {
                  hasPosition: true,
                  index: readingStateRef.current.currentIndex,
                  timeInSentence: t,
                };
              }}
            >
              <div
                className="h-full bg-[var(--primary-color)] transition-[width]"
                style={{
                  width: lessonTotalDuration
                    ? `${
                        (Math.min(lessonElapsed, lessonTotalDuration) /
                          lessonTotalDuration) *
                        100
                      }%`
                    : duration
                      ? `${(Math.min(currentTime, duration) / duration) * 100}%`
                      : `${readingProgress}%`,
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary-color)] text-white hover:bg-[var(--secondary-color)] transition-colors"
                  title={isReading ? "إيقاف مؤقت" : "تشغيل/استكمال"}
                >
                  {isReading ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  onClick={() => setLoopEnabled((v) => !v)}
                  className={`w-9 h-9 rounded-full grid place-items-center ${
                    loopEnabled
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  } hover:bg-emerald-100`}
                  title="تكرار الدرس"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17 1l4 4-4 4V6H7a3 3 0 00-3 3v2H2V9a5 5 0 015-5h10V1zm-10 22l-4-4 4-4v3h10a3 3 0 003-3v-2h2v2a5 5 0 01-5 5H7v3z" />
                  </svg>
                </button>
                {/* ✅ optional: Full Stop (Reset) button row for clarity */}

                <button
                  onClick={resetReading}
                  className="w-9 h-9 text-base rounded-full bg-red-100 hover:bg-red-300  grid place-items-center"
                  title="إيقاف وإعادة من البداية"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-gray-600">
                <span className="tabular-nums">
                  {lessonTotalDuration ? fmt(lessonElapsed) : fmt(currentTime)}
                </span>
                <span className="text-gray-300">/</span>
                <span className="tabular-nums">
                  {lessonTotalDuration
                    ? fmt(lessonTotalDuration)
                    : duration
                      ? fmt(duration)
                      : `${Math.round(readingProgress)}%`}
                </span>
              </div>

              <div className="relative flex items-center gap-2">
                <div className="group relative">
                  <button
                    className="px-3 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium"
                    title="السرعة"
                  >
                    {playbackRate.toFixed(2).replace(/\.00$/, "")}x ▾
                  </button>
                  <div className="absolute -right-2 bottom-9 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75].map((r) => (
                      <button
                        key={r}
                        onClick={() => handleSpeedChange(r)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          Math.abs(playbackRate - r) < 0.001
                            ? "text-[var(--primary-color)] bg-gray-50 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {r}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz FAB */}
      <Link
        to={`/reading/level/${levelId}/lesson/${lessonId}/quiz`}
        className="fixed bottom-20 md:bottom-24 right-4 md:right-6 group z-10"
      >
        <div className="md:hidden bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 px-3 py-1 animate-pulse hover:animate-none">
          <PiExam size={24} />
          <span className="arabic_font text-[11px] font-semibold">اختبار</span>
        </div>

        <div className="hidden md:flex bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white rounded-full shadow-xl hover:shadow-2xl transition-all animate-none duration-300 items-center justify-center relative hover:animate-none w-[50px] h-[50px]">
          <PiExam size={25} />
          <span className="absolute inset-0 rounded-full border-2 border-[var(--primary-color)] animate-ping opacity-75"></span>

          <div className="absolute arabic_font right-full top-1/2 -translate-y-1/2 mr-3 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg animate-none">
            🎯 ابدأ الاختبار الآن
            <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1">
              <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900 rotate-180"></div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
