import { useEffect, useId, useMemo, useState } from "react";
import {
  Volume2,
  Headphones,
  PenTool,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { readingData } from "../../../config/readingData/readingData";
import { Link } from "react-router-dom";

export const SideHome = () => {
  const gradientId = `progressGradient-${useId().replace(/:/g, "")}`;
  const [activeCard, setActiveCard] = useState(null);
  const [progress, setProgress] = useState({});
  const [pronounceLessons, setPronounceLessons] = useState([]);
  const [listeningProgress, setListeningProgress] = useState({
    progress: 0,
    completedLessons: 0,
    totalLessons: 10,
  });
  const [pronunciationProgress, setPronunciationProgress] = useState({
    progress: 0,
    completedTopics: 0,
    totalTopics: 30,
  });

  const [writingProgress, setWritingProgress] = useState({
    progress: 0,
    completedTopics: 0,
    totalTopics: 0,
  });

  useEffect(() => {
  let cancelled = false;

  const load = async () => {
    try {
      const res = await fetch("/assets/pronounceData.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`pronounceData.json ${res.status}`);
      const data = await res.json();
      if (!cancelled) setPronounceLessons(data?.lessons || []);
    } catch (e) {
      console.error("Error loading pronounceData.json:", e);
      if (!cancelled) setPronounceLessons([]);
    }
  };

  load();
  return () => {
    cancelled = true;
  };
}, []);


  // Load Writing progress from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sna-writing-tool-progress");
      if (!raw) return;

      // مثال الداتا: { "basic-pronunciation": { isUnlocked: true, phase: "questions-completed", isInProgress: true }, ... }
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;

      const entries = Object.values(data || {});
      const totalTopics = entries.length;

      // أوزان المراحل
      const phaseWeights = {
        "not-started": 0,
        "article-read": 50,
        "questions-completed": 100,
      };

      const totalProgress = entries.reduce((sum, item) => {
        const phase = item?.phase || "not-started";
        return sum + (phaseWeights[phase] ?? 0);
      }, 0);

      const avgProgress =
        totalTopics > 0 ? Math.round(totalProgress / totalTopics) : 0;

      const completedTopics = entries.filter(
        (item) => item?.phase === "questions-completed"
      ).length;

      setWritingProgress({
        progress: avgProgress,
        completedTopics,
        totalTopics,
      });
    } catch (e) {
      console.error("Error loading writing progress:", e);
      setWritingProgress({ progress: 0, completedTopics: 0, totalTopics: 0 });
    }
  }, []);
  // Load Reading progress from localStorage
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem("quizProgress");
      const parsedProgress = savedProgress ? JSON.parse(savedProgress) : {};
      setProgress(typeof parsedProgress === "object" ? parsedProgress : {});
    } catch (error) {
      console.error("Error loading progress:", error);
      setProgress({});
    }
  }, []);

  // Load Listening progress from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("sna-lesson-progress");
      if (storedData) {
        const lessons = JSON.parse(storedData);
        const total = lessons.length;
        const completed = lessons.filter((lesson) => lesson.isCompleted).length;
        const totalProgress = lessons.reduce(
          (sum, lesson) => sum + lesson.progress,
          0
        );
        const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

        setListeningProgress({
          progress: avgProgress,
          completedLessons: completed,
          totalLessons: total,
        });
      }
    } catch (error) {
      console.error("Error loading listening progress:", error);
    }
  }, []);

  // Load Pronunciation progress from localStorage
  useEffect(() => {
  try {
    const storedData = localStorage.getItem("pronunciationMasterProgress");
    if (!storedData) return;

    const data = JSON.parse(storedData);

    // ✅ totals from JSON (الحقيقي)
    const totalByLessonFromJson = {};
    for (const l of pronounceLessons) {
      const id = Number(l.lessonNumber);
      totalByLessonFromJson[id] = Array.isArray(l.sentences) ? l.sentences.length : 0;
    }

    // ✅ completed sentences from localStorage
    const sentences = data?.sentences && typeof data.sentences === "object" ? data.sentences : {};
    const conversations =
      data?.conversations && typeof data.conversations === "object" ? data.conversations : {};

    const completedByLesson = {};
    for (const [key, s] of Object.entries(sentences)) {
      if (!s?.completed) continue;
      const [lessonStr] = String(key).split("-");
      const lessonId = Number(lessonStr);
      if (!Number.isFinite(lessonId)) continue;
      completedByLesson[lessonId] = (completedByLesson[lessonId] || 0) + 1;
    }

    // ✅ union of lessons (from json + localstorage)
    const lessonIds = Array.from(
      new Set([
        ...Object.keys(totalByLessonFromJson).map(Number),
        ...Object.keys(completedByLesson).map(Number),
        ...Object.keys(conversations).map(Number),
      ])
    )
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    // ✅ Compare + compute per lesson using JSON totals
    const perLesson = lessonIds.map((id) => {
      const totalJson = totalByLessonFromJson[id] ?? 0;
      const done = completedByLesson[id] ?? 0;

      // inferred progress from JSON totals (الأهم)
      const inferred =
        totalJson > 0 ? Math.round((done / totalJson) * 100) : 0;

      // conversations may say 100 wrongly or be missing
      const conv = conversations[String(id)];
      const convProgress =
        typeof conv?.progress === "number"
          ? conv.progress
          : conv?.completed
          ? 100
          : null;

      // ✅ final progress:
      // - لو عندنا totalJson: نعتمد inferred (أصدق)
      // - ولو conversations أقل (مثلاً 50) نخلي الأقل؟ (اختياري)
      // أنا هنا بخلي final = inferred لأن inferred مبني على الحقيقي.
      const finalProgress = totalJson > 0 ? inferred : convProgress ?? 0;

      const completed = totalJson > 0 ? done >= totalJson : !!conv?.completed;

      // ✅ mismatch detection (ده اللي انتي عايزاه)
      const mismatch =
        typeof convProgress === "number" &&
        totalJson > 0 &&
        convProgress === 100 &&
        inferred < 100;

      return {
        lessonId: id,
        doneSentences: done,
        totalSentencesJson: totalJson,
        inferredProgress: inferred,
        convProgress: convProgress ?? "-",
        finalProgress,
        completed,
        mismatch,
      };
    });

    // ✅ console comparison table
    console.group("✅ Pronunciation JSON vs LocalStorage Comparison");
    console.table(perLesson);

    const mismatches = perLesson.filter((x) => x.mismatch);
    if (mismatches.length) {
      console.warn("⚠️ Mismatches (conv says 100 but JSON-based < 100):");
      console.table(mismatches);
    }
    console.groupEnd();

    // ✅ compute overall from JSON-based finalProgress
    const valid = perLesson.filter((x) => x.totalSentencesJson > 0);
    const totalLessons = valid.length;

    const avgProgress =
      totalLessons > 0
        ? Math.round(valid.reduce((s, x) => s + x.finalProgress, 0) / totalLessons)
        : 0;

    const completedLessons = valid.filter((x) => x.completed).length;

    setPronunciationProgress({
      progress: avgProgress,
      completedTopics: completedLessons,
      totalTopics: totalLessons,
    });
  } catch (error) {
    console.error("Error loading pronunciation progress:", error);
  }
}, [pronounceLessons]);


  // Helper functions
  const isValidProgressKey = (key) => /^level-\d+-lesson-\d+$/.test(key);

  const parseProgressKey = (key) => {
    const match = key.match(/level-(\d+)-lesson-(\d+)/);
    return match
      ? { levelId: Number(match[1]), lessonId: Number(match[2]) }
      : { levelId: null, lessonId: null };
  };

  const isKnownLesson = (levelId, lessonId) => {
    const level = readingData.find((l) => l.id === levelId);
    return level?.lessons?.some((lesson) => lesson.id === lessonId) || false;
  };

  // Calculate overall progress for Reading
  const overallProgress = useMemo(() => {
    const validEntries = Object.keys(progress).filter((key) => {
      if (!isValidProgressKey(key)) return false;
      const { levelId, lessonId } = parseProgressKey(key);
      return levelId && lessonId && isKnownLesson(levelId, lessonId);
    });

    const totalLessons = readingData.reduce(
      (total, level) => total + (level.lessons?.length || 0),
      0
    );

    const completedLessons = validEntries.length;
    const percentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      completed: completedLessons,
      total: totalLessons,
      percentage,
    };
  }, [progress]);

  const tools = [
    {
      id: 4,
      icon: BookOpen,
      title: "Reading",
      titleAr: "القراءة",
      brief: "Adaptive level content",
      briefAr: "محتوى بمستويات متكيفة",
      progress: overallProgress.percentage,
      completedLessons: overallProgress.completed,
      totalLessons: overallProgress.total,
      color: "from-[var(--primary-color)] to-[var(--primary-color)]",
      link: "/reading/progress",
    },
    {
      id: 1,
      icon: Volume2,
      title: "Pronunciation",
      titleAr: "النطق",
      brief: "accent training",
      briefAr: "تدريب النطق بالذكاء الاصطناعي",
      progress: pronunciationProgress.progress,
      completedLessons: pronunciationProgress.completedTopics,
      totalLessons: pronunciationProgress.totalTopics,
      color: "from-[var(--primary-color)] to-[var(--primary-color)]",
      link: "/pronounce/progress",
    },
    {
      id: 2,
      icon: Headphones,
      title: "Listening",
      titleAr: "الاستماع",
      brief: "Native speaker content",
      briefAr: "محتوى من متحدثين أصليين",
      progress: listeningProgress.progress,
      completedLessons: listeningProgress.completedLessons,
      totalLessons: listeningProgress.totalLessons,
      color: "from-[var(--primary-color)] to-[var(--primary-color)]",
      link: "/listening/progress",
    },
    {
      id: 3,
      icon: PenTool,
      title: "Writing",
      titleAr: "الكتابة",
      brief: "Smart grammar correction",
      briefAr: "تصحيح القواعد الذكي",
      progress: writingProgress.progress,
      completedLessons: writingProgress.completedTopics,
      totalLessons: writingProgress.totalTopics,
      color: "from-[var(--primary-color)] to-[var(--primary-color)]",
      link: "/writing/progress",
      unit: "topics",
    },
  ];

  const averageProgress = Math.round(
    tools.reduce((acc, tool) => acc + tool.progress, 0) / tools.length
  );

  const horizontalTools = tools;

  return (
    <section className="w-full p-4 md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-[var(--main-text-color)] text-2xl font-bold arabic_font">
            أدوات التعلم
          </h1>
        </div>

        {/* Tools Cards - Horizontal row */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-4">
          {horizontalTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeCard === tool.id;
            return (
              <Link
                to={tool.link}
                key={tool.id}
                onMouseEnter={() => setActiveCard(tool.id)}
                onMouseLeave={() => setActiveCard(null)}
                className="group cursor-pointer block w-full"
              >
                <div
                  className={`
                    relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 
                    border border-gray/10 transition-all duration-300
                  `}
                >
                  {/* Glow effect */}
                  <div
                    className={`absolute inset-0 rounded-2xl transition-opacity duration-300`}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Icon */}
                      <div
                        className={`
                          rounded-xl bg-gradient-to-br
                          flex items-center justify-center flex-shrink-0
                          transition-transform duration-300
                          ${isActive ? "scale-110" : "scale-100"}
                        `}
                      >
                        <Icon className="w-12 h-12 text-[var(--primary-color)]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[var(--main-text-color)] font-bold text-base mb-1">
                          {tool.title}
                        </h3>
                        <p className="arabic_font text-[var(--main-text-color)] text-sm font-semibold mb-1">
                          {tool.titleAr}
                        </p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          {tool.brief}
                        </p>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-2">
                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`
                              h-full bg-gradient-to-r ${tool.color}
                              transition-all duration-500 ease-out
                              ${isActive ? "animate-pulse" : ""}
                            `}
                            style={{ width: `${tool.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Progress Info */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-[var(--primary-color)]" />
                          <span className="text-white font-semibold">
                            {tool.progress}%
                          </span>
                          <span className="text-gray-400">complete</span>
                        </div>
                        <span className="text-gray-400">
                          {tool.completedLessons}/{tool.totalLessons}{" "}
                          {tool.id === 1 ? "topics" : "lessons"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Overall Progress - Stacked on mobile, horizontal on desktop */}
        <div className="mt-8 pt-6 flex justify-center">
          <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 border border-gray/10 flex flex-col md:flex-row flex-nowrap items-center md:justify-start gap-4 md:gap-6 lg:gap-8">
            {/* Circular Progress - centered on mobile, left on desktop */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle - light grey */}
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Progress arc - yellow with glow */}
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 64}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 64 * (1 - averageProgress / 100)
                  }`}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: "drop-shadow(0 0 10px rgba(255, 197, 21, 0.5))",
                  }}
                />
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ffc515" />
                    <stop offset="100%" stopColor="#ffc515" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center: percentage and "Overall" */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-[var(--main-text-color)] font-bold text-3xl mb-0.5">
                    {averageProgress}%
                  </p>
                  <p className="text-[var(--main-text-color)] text-sm">
                    Overall
                  </p>
                </div>
              </div>
            </div>

            {/* Text content - centered on mobile, left on desktop */}
            <div className="flex-1 min-w-0 text-center md:text-left w-full md:w-auto">
              <p className="text-[var(--main-text-color)] font-bold text-lg mb-1">
                Overall Progress
              </p>
              <p className="arabic_font text-[var(--main-text-color)] font-semibold text-sm mb-3">
                التقدم الإجمالي
              </p>
              <p className="text-[var(--main-text-color)] text-sm mb-1">
                Your average progress across all tools
              </p>
              <p className="arabic_font text-[var(--main-text-color)] text-sm">
                متوسط تقدمك في جميع أدوات التعلم الأربعة
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
