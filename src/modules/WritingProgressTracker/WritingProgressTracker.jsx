import { useState, useEffect, useMemo } from "react";
import {
  Award,
  Calendar,
  Home,
  List,
  Grid3X3,
  Table,
  Clock,
  CheckCircle2,
  PenTool,
} from "lucide-react";
import { SectionTitle } from "../../components";
import { Link } from "react-router-dom";

// Map topic IDs to Arabic names
const topicNames = {
  "basic-pronunciation": "النطق الأساسي",
  "common-phrases": "العبارات الشائعة",
  "numbers-time": "الأرقام والوقت",
  "family-relationships": "العائلة والعلاقات",
  "food-dining": "الطعام والمطاعم",
  "shopping-commerce": "التسوق والتجارة",
  "travel-tourism": "السفر والسياحة",
  "health-medicine": "الصحة والطب",
  "education-learning": "التعليم والتعلم",
  "technology-digital": "التكنولوجيا الرقمية",
  "sports-fitness": "الرياضة واللياقة",
  "entertainment-media": "الترفيه والإعلام",
  "business-communication": "التواصل التجاري",
  "housing-accommodation": "الإسكان والسكن",
  "transportation-logistics": "النقل والخدمات اللوجستية",
  "weather-climate": "الطقس والمناخ",
  "arts-culture": "الفنون والثقافة",
  "science-research": "العلوم والبحث",
  "current-events": "الأحداث الجارية",
  "environment-sustainability": "البيئة والاستدامة",
  "finance-economics": "المالية والاقتصاد",
  "law-justice": "القانون والعدالة",
  "psychology-emotions": "علم النفس والعواطف",
  "philosophy-ethics": "الفلسفة والأخلاق",
  "academic-english": "الإنجليزية الأكاديمية",
};

export function WritingProgressTracker() {
  const [progress, setProgress] = useState({
    progress: 0,
    completedTopics: 0,
    totalTopics: 0,
  });
  const [topicsData, setTopicsData] = useState([]);
  const [viewMode, setViewMode] = useState("timeline");

  useEffect(() => {
    // For demo: use in-memory data since localStorage isn't supported
    const demoData = {
      "basic-pronunciation": {
        isUnlocked: true,
        phase: "questions-completed",
        isInProgress: true,
      },
      "common-phrases": {
        isUnlocked: true,
        phase: "article-read",
        isInProgress: true,
      },
      "numbers-time": {
        isUnlocked: false,
        phase: "not-started",
        isInProgress: false,
      },
      "family-relationships": {
        isUnlocked: false,
        phase: "not-started",
        isInProgress: false,
      },
      "food-dining": {
        isUnlocked: false,
        phase: "not-started",
        isInProgress: false,
      },
      "shopping-commerce": {
        isUnlocked: false,
        phase: "not-started",
        isInProgress: false,
      },
      "travel-tourism": {
        isUnlocked: false,
        phase: "not-started",
        isInProgress: false,
      },
      "health-medicine": {
        isUnlocked: false,
        phase: "not-started",
        isInProgress: false,
      },
      "education-learning": {
        isUnlocked: false,
        phase: "not-started",
        isInProgress: false,
      },
      "technology-digital": {
        isUnlocked: false,
        phase: "not-started",
        isInProgress: false,
      },
    };

    try {
      // Try to read from localStorage (will work in actual app)
      const storedData =
        typeof window !== "undefined" && window.localStorage
          ? window.localStorage.getItem("sna-writing-tool-progress")
          : null;

      const topicsObj = storedData ? JSON.parse(storedData) : demoData;

      // Convert object to array
      const topicsArray = Object.entries(topicsObj).map(
        ([id, data], index) => ({
          id: index + 1,
          topicId: id,
          name: topicNames[id] || id,
          isUnlocked: data.isUnlocked,
          phase: data.phase,
          isInProgress: data.isInProgress,
          isCompleted: data.phase === "completed",
          progress: calculateProgress(data.phase),
        })
      );

      setTopicsData(topicsArray);

      const total = topicsArray.length;
      const completed = topicsArray.filter((topic) => topic.isCompleted).length;
      const totalProgress = topicsArray.reduce(
        (sum, topic) => sum + topic.progress,
        0
      );
      const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

      setProgress({
        progress: avgProgress,
        completedTopics: completed,
        totalTopics: total,
      });
    } catch (error) {
      console.error("Error loading writing progress:", error);
    }
  }, []);

  const calculateProgress = (phase) => {
    const phaseProgress = {
      "not-started": 0,
      "article-read": 25,
      "questions-completed": 50,
      "writing-submitted": 75,
      completed: 100,
    };
    return phaseProgress[phase] || 0;
  };

  const getPhaseLabel = (phase) => {
    const labels = {
      "not-started": "لم يبدأ",
      "article-read": "قراءة المقال",
      "questions-completed": "إكمال الأسئلة",
      "writing-submitted": "تقديم الكتابة",
      completed: "مكتمل",
    };
    return labels[phase] || phase;
  };

  const getTopicColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500",
    ];
    return colors[index % colors.length];
  };

  const recentActivityItems = useMemo(() => {
    return topicsData
      .filter((topic) => topic.isUnlocked || topic.progress > 0)
      .sort((a, b) => b.progress - a.progress)
      .map((topic) => ({
        id: topic.id,
        topicId: topic.topicId,
        topicTitle: topic.name,
        progress: topic.progress,
        isCompleted: topic.isCompleted,
        isUnlocked: topic.isUnlocked,
        phase: topic.phase,
        date: new Date().toISOString(),
      }));
  }, [topicsData]);

  const groupedByStatus = useMemo(() => {
    const groups = {
      مكتمل: [],
      "قيد التقدم": [],
      متاح: [],
    };

    for (const item of recentActivityItems) {
      if (item.isCompleted) groups["مكتمل"].push(item);
      else if (item.progress > 0) groups["قيد التقدم"].push(item);
      else if (item.isUnlocked) groups["متاح"].push(item);
    }
    return groups;
  }, [recentActivityItems]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title="تقدمك في الكتابة" />
          <Link
            to="/writing/home"
            className="arabic_font inline-flex items-center text-white bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] px-4 py-2 rounded-lg transition-colors"
          >
            الرئيسية
            <Home size={20} className="ms-1" />
          </Link>
        </div>

        {/* Overall Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-end mb-4">
            <h2 className="text-xl font-semibold text-gray-800 arabic_font">
              الإحصائيات العامة
            </h2>
            <PenTool size={24} className="text-blue-500 ms-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">
                {progress.completedTopics}
              </p>
              <p className="text-gray-600 arabic_font">مواضيع مكتملة</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">
                {progress.totalTopics}
              </p>
              <p className="text-gray-600 arabic_font">إجمالي المواضيع</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">
                {progress.progress}%
              </p>
              <p className="text-gray-600 arabic_font">نسبة الإكمال</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 overflow-hidden rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-left arabic_font">
              تقدمك العام في جميع المواضيع
            </p>
          </div>
        </div>

        {/* Topics Progress */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-end mb-4">
            <h2 className="text-xl font-semibold text-gray-800 arabic_font">
              تقدم المواضيع
            </h2>
            <Award size={24} className="text-yellow-500 ms-2" />
          </div>

          <div className="space-y-4">
            {topicsData.length === 0 ? (
              <p className="text-gray-500 text-center py-4 arabic_font">
                لا توجد مواضيع متاحة حتى الآن
              </p>
            ) : (
              topicsData.map((topic, index) => {
                const colorClass = getTopicColor(index);
                return (
                  <div
                    key={topic.topicId}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            topic.isCompleted
                              ? "bg-green-500"
                              : topic.isUnlocked
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {topic.id}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 arabic_font">
                            {topic.name}
                          </h3>
                          <p className="text-sm text-gray-600 arabic_font">
                            {getPhaseLabel(topic.phase)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-gray-800">
                          {topic.progress}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${colorClass} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div
            className="flex flex-col-reverse arabic_font gap-4 md:flex-row md:items-center md:justify-between mb-4"
            role="tablist"
            aria-label="طرق عرض آخر النشاطات"
          >
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewMode("timeline")}
                aria-pressed={viewMode === "timeline"}
                role="tab"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${
                  viewMode === "timeline"
                    ? "bg-blue-600 text-white border-transparent"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <List size={16} />
                <span className="hidden sm:inline">Timeline</span>
              </button>

              <button
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                role="tab"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white border-transparent"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Grid3X3 size={16} />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                role="tab"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white border-transparent"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Table size={16} />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            <div className="gap-2 flex items-center text-gray-800">
              <h2 className="text-lg md:text-xl font-semibold arabic_font">آخر النشاطات</h2>
              <Calendar size={20} className="text-green-600 ms-2" />
            </div>
          </div>

          {recentActivityItems.length === 0 && (
            <p className="text-gray-500 text-center py-4 arabic_font">
              لا توجد نشاطات مسجلة بعد
            </p>
          )}

          {/* Timeline View */}
          {viewMode === "timeline" && recentActivityItems.length > 0 && (
            <div className="relative border-s-2 border-gray-200 ps-6">
              {Object.entries(groupedByStatus).map(([statusLabel, items]) =>
                items.length > 0 ? (
                  <div key={statusLabel} className="mb-6 arabic_font">
                    <div className="flex items-center gap-2 mb-3 arabic_font">
                      <Clock size={16} className="text-gray-500" />
                      <h3 className="text-gray-700 font-semibold arabic_font">
                        {statusLabel}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.topicId} className="relative">
                          <span className="absolute -start-9 top-9 w-6 h-6 rounded-full bg-white border-2 border-blue-600" />
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="font-medium text-blue-700 mb-1 arabic_font">
                                  {item.topicTitle}
                                </p>
                                <p className="text-xs text-gray-600 mb-1 arabic_font">
                                  {getPhaseLabel(item.phase)}
                                </p>
                                {item.isCompleted && (
                                  <span className="inline-flex arabic_font items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 size={14} /> مكتمل
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-2xl text-blue-700">
                                  {item.progress}%
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && recentActivityItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentActivityItems.map((item) => (
                <div
                  key={item.topicId}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex arabic_font items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {item.isCompleted ? (
                        <>
                          <CheckCircle2 size={14} /> مكتمل
                        </>
                      ) : (
                        `${getPhaseLabel(item.phase)}`
                      )}
                    </span>
                  </div>

                  <p className="font-semibold text-blue-700 mb-3 arabic_font">
                    {item.topicTitle}
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 arabic_font">التقدم</span>
                    <span className="font-semibold text-blue-700">
                      {item.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && recentActivityItems.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {recentActivityItems.map((item) => (
                  <div
                    key={item.topicId}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-blue-700 arabic_font">
                        {item.topicTitle}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {item.progress}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 arabic_font">
                      {getPhaseLabel(item.phase)}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 arabic_font">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r arabic_font from-blue-500 to-purple-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto hidden md:block">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="text-center py-2 px-3 font-semibold arabic_font">
                        الموضوع
                      </th>
                      <th className="text-center py-2 px-3 font-semibold arabic_font">
                        المرحلة
                      </th>
                      <th className="text-center py-2 px-3 font-semibold arabic_font">
                        التقدم
                      </th>
                      <th className="text-center py-2 px-3 font-semibold arabic_font">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivityItems.map((item, idx) => (
                      <tr
                        key={item.topicId}
                        className={idx % 2 ? "bg-gray-100" : "bg-white arabic_font"}
                      >
                        <td className="text-black text-center py-2 px-3 arabic_font">
                          {item.topicTitle}
                        </td>
                        <td className="text-black text-center py-2 px-3 arabic_font">
                          {getPhaseLabel(item.phase)}
                        </td>
                        <td className="text-center py-2 px-3 arabic_font">
                          <div className="w-full bg-gray-200 rounded-full h-2 mx-auto max-w-[100px]">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </td>
                        <td className=" text-center py-2 px-3 font-medium text-blue-700">
                          {item.progress}%
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
}
