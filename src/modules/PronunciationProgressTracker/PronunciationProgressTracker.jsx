import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Award,
  Calendar,
  Home,
  List,
  Grid3X3,
  Table,
  Clock,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import { SectionTitle } from "../../components";

export const PronunciationProgressTracker = () => {
  const [progress, setProgress] = useState({ topics: {}, sentences: {} });
  const [viewMode, setViewMode] = useState("timeline");

  // ✅ lessons data from public json
  const [lessonsData, setLessonsData] = useState({ lessons: [] });
  const [isLessonsLoading, setIsLessonsLoading] = useState(true);

  // ✅ Normalizes localStorage shape into { topics, sentences }
  const normalizeProgress = (saved) => {
    if (!saved || typeof saved !== "object") return { topics: {}, sentences: {} };

    // If already expected schema
    if (saved.topics || saved.sentences) {
      return {
        topics: saved.topics || {},
        sentences: saved.sentences || {},
      };
    }

    const topics = {};
    const sentences =
      saved.sentences && typeof saved.sentences === "object" ? saved.sentences : {};
    const conversations =
      saved.conversations && typeof saved.conversations === "object"
        ? saved.conversations
        : {};

    // Numeric keys at root = topics
    for (const [key, value] of Object.entries(saved)) {
      if (key === "sentences" || key === "conversations") continue;
      if (!/^\d+$/.test(key)) continue;

      const topicId = Number(key);
      const topicRoot = value && typeof value === "object" ? value : {};
      const conv = conversations[key] || {};

      topics[topicId] = {
        completed: !!topicRoot.completed || !!conv.completed,
        completedAt: topicRoot.completedAt || conv.completedAt || "",
        progress:
          typeof conv.progress === "number"
            ? conv.progress
            : topicRoot.completed
            ? 100
            : 0,
        score:
          typeof conv.score === "number"
            ? conv.score
            : typeof topicRoot.score === "number"
            ? topicRoot.score
            : 0,
      };
    }

    // Also add any conversation keys even if root topic key doesn't exist
    for (const [key, conv] of Object.entries(conversations)) {
      if (!/^\d+$/.test(key)) continue;
      const topicId = Number(key);
      if (!topics[topicId]) {
        topics[topicId] = {
          completed: !!conv.completed,
          completedAt: conv.completedAt || "",
          progress: typeof conv.progress === "number" ? conv.progress : 0,
          score: typeof conv.score === "number" ? conv.score : 0,
        };
      }
    }

    return { topics, sentences };
  };

  // ✅ load progress from localStorage
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem("pronunciationMasterProgress");
      if (!savedRaw) {
        setProgress({ topics: {}, sentences: {} });
        return;
      }
      const saved = JSON.parse(savedRaw);
      setProgress(normalizeProgress(saved));
    } catch (error) {
      console.error("Error loading pronunciation progress:", error);
      setProgress({ topics: {}, sentences: {} });
    }
  }, []);

  // ✅ load lessons from public folder via fetch
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLessonsLoading(true);
        const res = await fetch("/assets/pronounceData.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load json: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setLessonsData(data || { lessons: [] });
      } catch (e) {
        console.error("Error loading pronounceData.json:", e);
        if (!cancelled) setLessonsData({ lessons: [] });
      } finally {
        if (!cancelled) setIsLessonsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const lessons = useMemo(() => lessonsData?.lessons || [], [lessonsData]);

  const lessonByNumber = useMemo(() => {
    const map = new Map();
    for (const l of lessons) map.set(Number(l.lessonNumber), l);
    return map;
  }, [lessons]);

  // ✅ Build sentence completion counts per lesson from localStorage
  const sentenceStatsByLesson = useMemo(() => {
    // { [lessonId]: { completedCount, totalCount, avgScore } }
    const stats = {};

    // Pre-fill totals from JSON
    for (const l of lessons) {
      const id = Number(l.lessonNumber);
      const total = Array.isArray(l.sentences) ? l.sentences.length : 0;
      stats[id] = { completedCount: 0, totalCount: total, scoreSum: 0, scoreCount: 0 };
    }

    // Fill completed counts from localStorage sentences
    for (const [key, data] of Object.entries(progress.sentences || {})) {
      const [lessonStr, sentenceStr] = String(key).split("-");
      const lessonId = Number(lessonStr);
      const sentenceIndex = Number(sentenceStr);

      if (isNaN(lessonId) || isNaN(sentenceIndex)) continue;
      if (!stats[lessonId]) {
        // lesson not in JSON (still track it)
        stats[lessonId] = { completedCount: 0, totalCount: 0, scoreSum: 0, scoreCount: 0 };
      }

      if (data?.completed) stats[lessonId].completedCount += 1;

      if (typeof data?.score === "number") {
        stats[lessonId].scoreSum += data.score;
        stats[lessonId].scoreCount += 1;
      }
    }

    // Convert sums to avg
    const finalStats = {};
    for (const [idStr, s] of Object.entries(stats)) {
      const id = Number(idStr);
      const avgScore =
        s.scoreCount > 0 ? Math.round(s.scoreSum / s.scoreCount) : 0;

      finalStats[id] = {
        completedCount: s.completedCount,
        totalCount: s.totalCount,
        avgScore,
      };
    }

    return finalStats;
  }, [lessons, progress.sentences]);

  // Date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString("ar-EG", options);
  };

  // Topic colors
  const getTopicColor = (topicId) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-purple-500",
    ];
    return colors[(topicId - 1) % colors.length];
  };

  // ✅ Topics list using BOTH:
  // - saved conversations/topics
  // - inferred progress from sentences
  const topicsWithProgress = useMemo(() => {
    return lessons.map((l) => {
      const id = Number(l.lessonNumber);
      const savedTopic = progress.topics?.[id] || {};

      const stat = sentenceStatsByLesson[id] || {
        completedCount: 0,
        totalCount: Array.isArray(l.sentences) ? l.sentences.length : 0,
        avgScore: 0,
      };

      // inferred progress from sentence completion
      const inferredProgress =
        stat.totalCount > 0
          ? Math.round((stat.completedCount / stat.totalCount) * 100)
          : 0;

      // choose the best progress (some systems store progress, some don't)
      const savedProgress =
        typeof savedTopic.progress === "number" ? savedTopic.progress : 0;

      const finalProgress = Math.max(savedProgress, inferredProgress);

      const completedBySentences =
        stat.totalCount > 0 && stat.completedCount >= stat.totalCount;

      const finalCompleted = !!savedTopic.completed || completedBySentences;

      // score preference: savedTopic.score, else avg from sentences
      const finalScore =
        typeof savedTopic.score === "number" && savedTopic.score > 0
          ? savedTopic.score
          : stat.avgScore;

      return {
        id,
        title: l.title || `Lesson ${id}`,
        arabicDescription: l.arabicDescription || "",
        progress: finalProgress,
        completed: finalCompleted,
        score: finalScore,
        completedCount: stat.completedCount,
        totalCount: stat.totalCount,
      };
    });
  }, [lessons, progress.topics, sentenceStatsByLesson]);

  // ✅ Overall progress based on topicsWithProgress (أدق)
  const overallProgress = useMemo(() => {
    const total = topicsWithProgress.length;
    const completed = topicsWithProgress.filter((t) => t.completed).length;

    const sum = topicsWithProgress.reduce((acc, t) => acc + (t.progress || 0), 0);
    const percentage = total > 0 ? Math.round(sum / total) : 0;

    return { completed, total, percentage };
  }, [topicsWithProgress]);

  // Recent activities from sentences with real lesson/sentence names
  const recentActivityItems = useMemo(() => {
    return Object.entries(progress.sentences || {})
      .filter(([_, data]) => data && data.completedAt)
      .sort(([, a], [, b]) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 20)
      .map(([key, data]) => {
        const [topicStr, sentenceStr] = String(key).split("-");
        const topicId = Number(topicStr);
        const sentenceIndex = Number(sentenceStr);

        const lesson = lessonByNumber.get(topicId);
        const sentenceObj =
          lesson && Array.isArray(lesson.sentences)
            ? lesson.sentences[sentenceIndex]
            : null;

        const topicTitle = lesson?.title ? lesson.title : `Lesson ${topicId}`;
        const sentenceTitle =
          sentenceObj?.arabic ||
          sentenceObj?.english ||
          `Sentence ${sentenceIndex + 1}`;

        return {
          id: key,
          topicId,
          sentenceId: sentenceIndex,
          topicTitle,
          sentenceTitle,
          date: data.completedAt,
          score: typeof data.score === "number" ? data.score : 0,
          completed: !!data.completed,
        };
      })
      .filter((item) => !isNaN(item.topicId) && !isNaN(item.sentenceId));
  }, [progress.sentences, lessonByNumber]);

  // Group by day
  const groupedByDay = useMemo(() => {
    const groups = {};
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    for (const item of recentActivityItems) {
      const d = new Date(item.date);
      let key = formatDate(item.date);
      if (isSameDay(d, today)) key = "اليوم";
      else if (isSameDay(d, yesterday)) key = "أمس";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [recentActivityItems]);

  return (
    <div className="min-h-screen py-8">
      <div className="container container-lg px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <SectionTitle title={"تقدمك في النطق"} />
          <Link
            to="/pronounce/home"
            className="arabic_font inline-flex items-center text-white bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] px-4 py-2 rounded-lg transition-colors"
          >
            الرئيسية
            <Home size={20} className="ms-1" />
          </Link>
        </div>

        {/* Loading lessons */}
        {isLessonsLoading && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <p className="arabic_font text-gray-600 text-center">
              جارٍ تحميل بيانات الدروس...
            </p>
          </div>
        )}

        {/* Overall Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-end mb-4">
            <h2 className="arabic_font text-xl font-semibold text-gray-800">
              الإحصائيات العامة
            </h2>
            <BarChart3 size={24} className="text-blue-500 ms-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">
                {overallProgress.completed}
              </p>
              <p className="arabic_font text-gray-600">دروس مكتملة</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">
                {overallProgress.total}
              </p>
              <p className="arabic_font text-gray-600">إجمالي الدروس</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">
                {overallProgress.percentage}%
              </p>
              <p className="arabic_font text-gray-600">نسبة الإكمال</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 overflow-hidden rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${overallProgress.percentage}%` }}
              />
            </div>
            <p className="arabic_font text-sm text-gray-500 mt-2 text-left">
              تقدمك العام في جميع الدروس
            </p>
          </div>
        </div>

        {/* Topic Progress */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-end mb-4">
            <h2 className="arabic_font text-xl font-semibold text-gray-800">
              تقدم الدروس
            </h2>
            <Award size={24} className="text-yellow-500 ms-2" />
          </div>

          <div className="space-y-6">
            {topicsWithProgress.length === 0 ? (
              <p className="arabic_font text-gray-500 text-center py-4">
                لا توجد دروس
              </p>
            ) : (
              topicsWithProgress.map((topic) => {
                const colorClass = getTopicColor(topic.id);
                return (
                  <div
                    key={topic.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 mb-1 truncate">
                          {topic.title}
                        </h3>
                        {topic.arabicDescription ? (
                          <p className="arabic_font text-sm text-gray-600 truncate">
                            {topic.arabicDescription}
                          </p>
                        ) : (
                          <p className="arabic_font text-sm text-gray-600">
                            الدرس {topic.id}
                          </p>
                        )}

                        {/* ✅ show sentence count to prove progress */}
                        <p className="arabic_font text-xs text-gray-500 mt-1">
                          تم إنجاز {topic.completedCount} من {topic.totalCount} جملة
                        </p>
                      </div>

                      <div className="text-sm flex flex-col items-end text-gray-800">
                        {topic.completed ? (
                          <span className="arabic_font inline-flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1 rounded-full">
                            <CheckCircle2 size={16} />
                            مكتمل
                          </span>
                        ) : (
                          <span className="arabic_font text-orange-700 bg-orange-50 px-3 py-1 rounded-full">
                            قيد التقدم
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className={`${colorClass} h-3 rounded-full transition-all duration-1000`}
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>

                    <p className="text-md text-gray-800 text-left">
                      {topic.progress}% مكتمل
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${
                  viewMode === "timeline"
                    ? "bg-[var(--primary-color)] text-white border-transparent"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <List size={16} />
                <span className="hidden sm:inline">Timeline</span>
              </button>

              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${
                  viewMode === "grid"
                    ? "bg-[var(--primary-color)] text-white border-transparent"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Grid3X3 size={16} />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${
                  viewMode === "table"
                    ? "bg-[var(--primary-color)] text-white border-transparent"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Table size={16} />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <h2 className="arabic_font text-lg md:text-xl font-semibold text-gray-800">
                آخر النشاطات
              </h2>
              <Calendar size={20} className="text-green-600 ms-2" />
            </div>
          </div>

          {recentActivityItems.length === 0 && (
            <p className="arabic_font text-gray-500 text-center py-4">
              لا توجد نشاطات مسجلة بعد
            </p>
          )}

          {viewMode === "timeline" && recentActivityItems.length > 0 && (
            <div className="relative border-s-2 border-gray-200 ps-6">
              {Object.entries(groupedByDay).map(([dayLabel, items]) => (
                <div key={dayLabel} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-gray-500" />
                    <h3 className="arabic_font text-gray-700 font-semibold">
                      {dayLabel}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="relative">
                        <span className="absolute -start-9 top-9 w-6 h-6 rounded-full bg-white border-2 border-[var(--primary-color)]" />
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--secondary-color)] mb-1 truncate">
                                {item.topicTitle}
                              </p>
                              <p className="arabic_font text-sm text-gray-700 truncate">
                                {item.sentenceTitle}
                              </p>
                              <p className="arabic_font text-xs text-gray-500 mt-1">
                                {formatDate(item.date)}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-2 justify-end">
                                <Volume2 size={16} className="text-blue-500" />
                                <p className="font-semibold text-[var(--secondary-color)]">
                                  {item.score}%
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-[var(--primary-color)]"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === "grid" && recentActivityItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentActivityItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="arabic_font inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={14} /> مكتمل
                    </span>
                    <span className="arabic_font text-xs text-gray-500">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <p className="font-semibold text-[var(--secondary-color)] mb-1 truncate">
                    {item.topicTitle}
                  </p>
                  <p className="arabic_font text-sm text-gray-700 mb-2 truncate">
                    {item.sentenceTitle}
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full bg-[var(--primary-color)]"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="arabic_font text-gray-700">النتيجة</span>
                    <span className="font-semibold text-[var(--secondary-color)]">
                      {item.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === "table" && recentActivityItems.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[var(--primary-color)] text-white">
                    <th className="text-center arabic_font py-2 px-3 font-semibold">
                      التاريخ
                    </th>
                    <th className="text-center arabic_font py-2 px-3 font-semibold">
                      الدرس
                    </th>
                    <th className="text-center arabic_font py-2 px-3 font-semibold">
                      الجملة
                    </th>
                    <th className="text-center arabic_font py-2 px-3 font-semibold">
                      النتيجة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivityItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={idx % 2 ? "bg-gray-100" : "bg-white"}
                    >
                      <td className="arabic_font text-black text-center py-2 px-3 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="arabic_font text-black text-center py-2 px-3">
                        {item.topicTitle}
                      </td>
                      <td className="arabic_font text-black text-center py-2 px-3">
                        {item.sentenceTitle}
                      </td>
                      <td className="arabic_font text-black text-center py-2 px-3 font-medium text-[var(--secondary-color)]">
                        {item.score}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
