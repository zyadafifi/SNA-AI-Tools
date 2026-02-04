import { useEffect, useId, useMemo, useState } from "react";
import { Volume2, Headphones, BookOpen, TrendingUp } from "lucide-react";
import { readingData } from "../../../config/readingData/readingData";
import { Link } from "react-router-dom";

const safeJSON = (raw, fallback) => {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const runWhenIdle = (fn) => {
  if (typeof window === "undefined") return;
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(fn, { timeout: 800 });
  } else {
    setTimeout(fn, 0);
  }
};

export const SideHome = () => {
  const gradientId = `progressGradient-${useId().replace(/:/g, "")}`;
  const [activeCard, setActiveCard] = useState(null);

  // ✅ store only RAW loaded data once, and derive everything else via useMemo
  const [pronounceLessons, setPronounceLessons] = useState([]);

  const [stored, setStored] = useState(() => ({
    quizProgress: {},
    lessonProgress: [],
    pronunciationMaster: null,
  }));

  // ✅ Fetch pronounce JSON (use browser cache instead of no-store)
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/assets/pronounceData.json", {
          cache: "force-cache",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`pronounceData.json ${res.status}`);
        const data = await res.json();
        setPronounceLessons(Array.isArray(data?.lessons) ? data.lessons : []);
      } catch (e) {
        if (e?.name === "AbortError") return;
        console.error("Error loading pronounceData.json:", e);
        setPronounceLessons([]);
      }
    })();

    return () => controller.abort();
  }, []);

  // ✅ Read localStorage ONCE (idle) to reduce blocking
  useEffect(() => {
    runWhenIdle(() => {
      const quizProgressRaw = localStorage.getItem("quizProgress");
      const lessonProgressRaw = localStorage.getItem("sna-lesson-progress");
      const pronMasterRaw = localStorage.getItem("pronunciationMasterProgress");

      setStored({
        quizProgress: safeJSON(quizProgressRaw, {}),
        lessonProgress: safeJSON(lessonProgressRaw, []),
        pronunciationMaster: safeJSON(pronMasterRaw, null),
      });
    });
  }, []);

  // =========================================================
  // ✅ Reading: precompute a fast lookup map once
  // =========================================================
  const readingIndex = useMemo(() => {
    const known = new Set();
    let totalLessons = 0;

    for (const level of readingData) {
      const lid = level?.id;
      const lessons = level?.lessons || [];
      totalLessons += lessons.length;

      for (const lesson of lessons) {
        known.add(`level-${lid}-lesson-${lesson?.id}`);
      }
    }

    return { known, totalLessons };
  }, []);

  const readingOverall = useMemo(() => {
    const progressObj =
      stored.quizProgress && typeof stored.quizProgress === "object"
        ? stored.quizProgress
        : {};

    let completed = 0;

    for (const key of Object.keys(progressObj)) {
      if (readingIndex.known.has(key)) completed++;
    }

    const total = readingIndex.totalLessons;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }, [stored.quizProgress, readingIndex]);

  // =========================================================
  // ✅ Listening
  // =========================================================
  const listeningProgress = useMemo(() => {
    const lessons = Array.isArray(stored.lessonProgress)
      ? stored.lessonProgress
      : [];
    const total = lessons.length;
    if (!total) return { progress: 0, completedLessons: 0, totalLessons: 10 };

    let completed = 0;
    let sum = 0;

    for (const l of lessons) {
      if (l?.isCompleted) completed++;
      sum += Number(l?.progress || 0);
    }

    const avg = Math.round(sum / total);

    return {
      progress: avg,
      completedLessons: completed,
      totalLessons: total,
    };
  }, [stored.lessonProgress]);

  // =========================================================
  // ✅ Pronunciation (derived, no extra setState)
  // =========================================================
  const pronunciationProgress = useMemo(() => {
    const master = stored.pronunciationMaster;
    if (!master) {
      return { progress: 0, completedTopics: 0, totalTopics: 30 };
    }

    // totals from JSON
    const totalByLessonFromJson = {};
    for (const l of pronounceLessons) {
      const id = Number(l?.lessonNumber);
      totalByLessonFromJson[id] = Array.isArray(l?.sentences)
        ? l.sentences.length
        : 0;
    }

    const sentences =
      master?.sentences && typeof master.sentences === "object"
        ? master.sentences
        : {};
    const conversations =
      master?.conversations && typeof master.conversations === "object"
        ? master.conversations
        : {};

    // completed sentences from localStorage
    const completedByLesson = {};
    for (const [key, s] of Object.entries(sentences)) {
      if (!s?.completed) continue;
      const [lessonStr] = String(key).split("-");
      const lessonId = Number(lessonStr);
      if (!Number.isFinite(lessonId)) continue;
      completedByLesson[lessonId] = (completedByLesson[lessonId] || 0) + 1;
    }

    const lessonIds = Array.from(
      new Set([
        ...Object.keys(totalByLessonFromJson).map(Number),
        ...Object.keys(completedByLesson).map(Number),
        ...Object.keys(conversations).map(Number),
      ]),
    )
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    let sumProgress = 0;
    let count = 0;
    let completedLessons = 0;

    for (const id of lessonIds) {
      const totalJson = totalByLessonFromJson[id] ?? 0;
      if (totalJson <= 0) continue;

      const done = completedByLesson[id] ?? 0;
      const inferred = Math.round((done / totalJson) * 100);
      const finalProgress = inferred;

      sumProgress += finalProgress;
      count++;

      if (done >= totalJson) completedLessons++;
    }

    const avg = count > 0 ? Math.round(sumProgress / count) : 0;

    return {
      progress: avg,
      completedTopics: completedLessons,
      totalTopics: count,
    };
  }, [stored.pronunciationMaster, pronounceLessons]);

  // =========================================================
  // ✅ Tools array memoized
  // =========================================================
  const tools = useMemo(() => {
    return [
      {
        id: 1,
        icon: BookOpen,
        title: "Reading",
        titleAr: "القراءة",
        brief: "Adaptive level content",
        progress: readingOverall.percentage,
        completedLessons: readingOverall.completed,
        totalLessons: readingOverall.total,
        color: "from-[var(--primary-color)] to-[var(--primary-color)]",
        link: "/reading/progress",
        unit: "lessons",
      },
      {
        id: 2,
        icon: Volume2,
        title: "Pronunciation",
        titleAr: "النطق",
        brief: "accent training",
        progress: pronunciationProgress.progress,
        completedLessons: pronunciationProgress.completedTopics,
        totalLessons: pronunciationProgress.totalTopics,
        color: "from-[var(--primary-color)] to-[var(--primary-color)]",
        link: "/pronounce/progress",
        unit: "topics",
      },
      {
        id: 3,
        icon: Headphones,
        title: "Listening",
        titleAr: "الاستماع",
        brief: "Native speaker content",
        progress: listeningProgress.progress,
        completedLessons: listeningProgress.completedLessons,
        totalLessons: listeningProgress.totalLessons,
        color: "from-[var(--primary-color)] to-[var(--primary-color)]",
        link: "/listening/progress",
        unit: "lessons",
      },
    ];
  }, [readingOverall, pronunciationProgress, listeningProgress]);

  const averageProgress = useMemo(() => {
    const sum = tools.reduce((acc, t) => acc + Number(t.progress || 0), 0);
    return tools.length ? Math.round(sum / tools.length) : 0;
  }, [tools]);

  return (
    <section className="w-full p-4 md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-[var(--main-text-color)] text-2xl font-bold arabic_font">
            أدوات التعلم
          </h1>
        </div>

        {/* Tools Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
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
                  className="
                    relative bg-white/5 backdrop-blur-sm rounded-2xl p-4
                    border border-gray/10 transition-all duration-300
                  "
                >
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
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

                    <div className="space-y-2">
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

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-[var(--primary-color)]" />
                          <span className="text-white font-semibold">
                            {tool.progress}%
                          </span>
                          <span className="text-gray-400">complete</span>
                        </div>
                        <span className="text-gray-400">
                          {tool.completedLessons}/{tool.totalLessons} {tool.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Overall Progress */}
        <div className="mt-8 pt-6 flex justify-center">
          <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 border border-gray/10 flex flex-col md:flex-row flex-nowrap items-center md:justify-start gap-4 md:gap-6 lg:gap-8">
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 64}`}
                  strokeDashoffset={`${2 * Math.PI * 64 * (1 - averageProgress / 100)}`}
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
                متوسط تقدمك في جميع أدوات التعلم الثلاثة
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
