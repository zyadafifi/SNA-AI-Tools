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

  // Load pronunciation progress from localStorage
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem("pronunciationMasterProgress");
      const saved = savedRaw ? JSON.parse(savedRaw) : {};
      setProgress({
        topics: saved.topics || {},
        sentences: saved.sentences || {},
      });
    } catch (error) {
      console.error("Error loading pronunciation progress:", error);
      setProgress({ topics: {}, sentences: {} });
    }
  }, []);

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

  // Overall progress calculation
  const overallProgress = useMemo(() => {
    const topicsArray = Object.values(progress.topics);
    const totalTopics = topicsArray.length;
    const completedTopics = topicsArray.filter((t) => t.completed).length;

    const totalProgress = topicsArray.reduce(
      (sum, topic) => sum + (topic.progress || 0),
      0
    );
    const percentage =
      totalTopics > 0 ? Math.round(totalProgress / totalTopics) : 0;

    return {
      completed: completedTopics,
      total: totalTopics,
      percentage,
    };
  }, [progress]);

  // Topics with progress > 0
  const topicsWithProgress = useMemo(() => {
    return Object.entries(progress.topics)
      .filter(([_, topic]) => topic.progress > 0)
      .map(([id, topic]) => ({
        id: Number(id),
        ...topic,
      }));
  }, [progress]);

  // Recent activities from sentences
  const recentActivityItems = useMemo(() => {
    return Object.entries(progress.sentences)
      .filter(([_, data]) => data && data.completedAt)
      .sort(([, a], [, b]) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 20)
      .map(([key, data]) => {
        const [topicId, sentenceId] = key.split("-").map(Number);
        return {
          id: key,
          topicId,
          sentenceId,
          topicTitle: `Topic ${topicId}`,
          sentenceTitle: `Sentence ${sentenceId + 1}`,
          date: data.completedAt,
          score: data.score || 0,
          completed: data.completed || false,
        };
      });
  }, [progress]);

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
    <div className="min-h-screen bg-[var(--main-bg-color)] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
              <p className="arabic_font text-gray-600">مواضيع مكتملة</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">
                {overallProgress.total}
              </p>
              <p className="arabic_font text-gray-600">إجمالي المواضيع</p>
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
              تقدمك العام في جميع المواضيع
            </p>
          </div>
        </div>

        {/* Topic Progress */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-end mb-4">
            <h2 className="arabic_font text-xl font-semibold text-gray-800">
              تقدم المواضيع
            </h2>
            <Award size={24} className="text-yellow-500 ms-2" />
          </div>

          <div className="space-y-6">
            {topicsWithProgress.length === 0 ? (
              <p className="arabic_font text-gray-500 text-center py-4">
                لا توجد مواضيع ذات تقدّم حتى الآن
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
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">
                          Topic {topic.id}
                        </h3>
                        <p className="arabic_font text-sm text-gray-600">
                          الموضوع {topic.id}
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
          {/* Header */}
          <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between mb-4">
            {/* View mode buttons */}
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

            {/* Title */}
            <div className="flex items-center gap-2">
              <h2 className="arabic_font text-lg md:text-xl font-semibold text-gray-800">
                آخر النشاطات
              </h2>
              <Calendar size={20} className="text-green-600 ms-2" />
            </div>
          </div>

          {/* Empty state */}
          {recentActivityItems.length === 0 && (
            <p className="arabic_font text-gray-500 text-center py-4">
              لا توجد نشاطات مسجلة بعد
            </p>
          )}

          {/* Timeline View */}
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
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--secondary-color)] mb-1 truncate">
                                {item.topicTitle} — {item.sentenceTitle}
                              </p>
                              <p className="arabic_font text-sm text-gray-600">
                                {formatDate(item.date)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
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

          {/* Grid View */}
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
                  <p className="text-sm text-gray-700 mb-2 truncate">
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

          {/* Table View */}
          {viewMode === "table" && recentActivityItems.length > 0 && (
            <>
              {/* Mobile cards */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {recentActivityItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="arabic_font text-xs text-gray-500">
                        {formatDate(item.date)}
                      </span>
                      <span className="arabic_font inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={14} /> {item.score}%
                      </span>
                    </div>
                    <p className="font-semibold text-[var(--secondary-color)] truncate">
                      {item.topicTitle}
                    </p>
                    <p className="text-sm text-gray-700 mb-2 truncate">
                      {item.sentenceTitle}
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="overflow-x-auto hidden md:block">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--primary-color)] text-white">
                      <th className="text-center arabic_font py-2 px-3 font-semibold">
                        التاريخ
                      </th>
                      <th className="text-center arabic_font py-2 px-3 font-semibold">
                        الموضوع
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
