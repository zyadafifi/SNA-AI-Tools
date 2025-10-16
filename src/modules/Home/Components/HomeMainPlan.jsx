import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readingData } from "../../../config/readingData/readingData";

const StarIcon = ({ filled = false }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path
      d="M12 2.5l2.97 6.02 6.65.97-4.81 4.69 1.14 6.64L12 17.77 6.05 20.82l1.14-6.64L2.39 9.49l6.64-.97L12 2.5z"
      className={filled ? "fill-white" : "fill-transparent"}
      stroke={filled ? "white" : "currentColor"}
      strokeWidth={filled ? 0 : 1.5}
    />
  </svg>
);

export default function HomeMainPlan() {
  const [data, setData] = useState({ pronounce: null, writing: null, listening: null });
  const [loading, setLoading] = useState({ pronounce: true, writing: true, listening: true });
  const [errors, setErrors] = useState({ pronounce: null, writing: null, listening: null });

  const fetchData = async (url, key) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load data");
      const json = await res.json();
      setData((p) => ({ ...p, [key]: json }));
      setErrors((p) => ({ ...p, [key]: null }));
    } catch (e) {
      setErrors((p) => ({ ...p, [key]: e.message }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  };

  useEffect(() => {
    fetchData("/assets/pronounceData.json", "pronounce");
    fetchData("/assets/writingData.json", "writing");
    fetchData("/assets/listeningData.json", "listening");
  }, []);

  const lengths = useMemo(
    () => ({
      pronounce: data.pronounce?.lessons?.length || 0,
      writing: data.writing?.topics?.length || 0,
      listening: data.listening?.lessons?.length || 0,
      reading: readingData?.length || 0,
    }),
    [data]
  );

  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(Boolean);
  const maxKey = useMemo(
    () => Object.keys(lengths).reduce((a, b) => (lengths[a] > lengths[b] ? a : b)),
    [lengths]
  );
  const total = lengths[maxKey] || 0;

  const [unlockedCount, setUnlockedCount] = useState(() => {
    const saved = localStorage.getItem("planUnlockedCount");
    return saved ? Number(saved) : 1;
  });
  useEffect(() => localStorage.setItem("planUnlockedCount", String(unlockedCount)), [unlockedCount]);

  if (isLoading) {
    return (
      <div className="mb-8 text-center py-8">
        <div className="animate-pulse text-gray-600">Loading lessons…</div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="mb-8 text-center py-8">
        <div className="text-red-600">Error loading data. Please try again.</div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="mb-8 text-center py-8">
        <div className="text-gray-600">No lessons available yet.</div>
      </div>
    );
  }

  const nodes = Array.from({ length: total }, (_, i) => ({
    index: i,
    label: `Lesson ${i + 1}`,
    side: i % 2 === 0 ? "left" : "right",
  }));

  return (
    <div className="relative flex flex-col items-center mt-8">
      {nodes.map((n) => {
        const unlocked = n.index < unlockedCount;
        const nextUp = n.index === unlockedCount;
        const offsetX = n.side === "left" ? "-translate-x-12" : "translate-x-6";

        return (
          <div key={n.index} className={`relative flex flex-col items-center mb-4 ${offsetX}`}>
            {nextUp && (
              <span className="mb-1 text-emerald-700 bg-white px-3 py-1 rounded-xl shadow border border-emerald-200 text-sm font-semibold">
                ابدأ
              </span>
            )}

            <div
              className={`rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
                unlocked || nextUp
                  ? "bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-500"
                  : "bg-gray-200 border-gray-300 opacity-70"
              } border-4 w-16 h-16`}
            >
              <StarIcon filled={unlocked || nextUp} />
            </div>

            <Link
              to={`/plan/slug/lesson-${n.index + 1}`}
              onClick={() => {
                if (nextUp) setUnlockedCount((c) => Math.min(c + 1, total));
              }}
              className="absolute inset-0 rounded-full"
            />
          </div>
        );
      })}
    </div>
  );
}