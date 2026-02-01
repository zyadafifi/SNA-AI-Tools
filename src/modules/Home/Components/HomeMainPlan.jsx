import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readingData } from "../../../config/readingData/readingData";
import { Loading } from "../../../components/Loading";

// ============================================
// ICONS COMPONENTS (Memoized)
// ============================================
const HeadphonesIcon = React.memo(function HeadphonesIcon({ active, size = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 24 24" className={size} fill="none">
      <path
        d="M4 12a8 8 0 0 1 16 0v7a2 2 0 0 1-2 2h-1v-7h3"
        stroke={active ? "white" : "#9CA3AF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 12v7a2 2 0 0 0 2 2h1v-7H4"
        stroke={active ? "white" : "#9CA3AF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

const MicIcon = React.memo(function MicIcon({ active, size = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 24 24" className={size} fill="none">
      <path
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"
        stroke={active ? "white" : "#9CA3AF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 11a7 7 0 0 1-14 0"
        stroke={active ? "white" : "#9CA3AF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 18v3"
        stroke={active ? "white" : "#9CA3AF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 21h8"
        stroke={active ? "white" : "#9CA3AF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

const BookIcon = React.memo(function BookIcon({ active, size = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 24 24" className={size} fill="none">
      <path
        d="M4 19a2 2 0 0 0 2 2h14V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14Z"
        stroke={active ? "white" : "#9CA3AF"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 7h8M8 11h8"
        stroke={active ? "white" : "#9CA3AF"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
});

const PencilIcon = React.memo(function PencilIcon({ active, size = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 24 24" className={size} fill="none">
      <path
        d="M12 20h9"
        stroke={active ? "white" : "#9CA3AF"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
        stroke={active ? "white" : "#9CA3AF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

const ToolIcon = React.memo(function ToolIcon({ category, active, size = "w-10 h-10" }) {
  switch (category) {
    case "listening":
      return <HeadphonesIcon active={active} size={size} />;
    case "pronunciation":
      return <MicIcon active={active} size={size} />;
    case "reading":
      return <BookIcon active={active} size={size} />;
    case "writing":
      return <PencilIcon active={active} size={size} />;
    default:
      return <BookIcon active={active} size={size} />;
  }
});

// ============================================
// GROUP THEMES (كل 4 نقاط لون مختلف)
// ============================================
const GROUP_THEMES = [
  { primary: "#F59E0B", secondary: "#D97706", gradFrom: "#FBBF24", gradTo: "#F97316" },
  { primary: "#2563EB", secondary: "#1D4ED8", gradFrom: "#60A5FA", gradTo: "#2563EB" },
  { primary: "#7C3AED", secondary: "#6D28D9", gradFrom: "#A78BFA", gradTo: "#7C3AED" },
  { primary: "#16A34A", secondary: "#15803D", gradFrom: "#4ADE80", gradTo: "#16A34A" },
  { primary: "#DB2777", secondary: "#BE185D", gradFrom: "#F472B6", gradTo: "#DB2777" },
  { primary: "#0EA5E9", secondary: "#0284C7", gradFrom: "#7DD3FC", gradTo: "#0EA5E9" },
];

// ============================================
// CURVED PATH SVG - Connects nodes with curves (Memoized)
// ============================================
const CurvedConnector = React.memo(function CurvedConnector({ from, to, isActive, activeColor }) {
  const curveOffset = (to.x - from.x) / 1;
  const d = `M ${from.x} ${from.y}
             C ${from.x + curveOffset} ${from.y + 20},
               ${to.x + curveOffset} ${to.y - 30},
               ${to.x} ${to.y}`;

  return (
    <path
      d={d}
      fill="none"
      stroke={isActive ? activeColor : "#E5E7EB"}
      strokeWidth={isActive ? "6" : "10"}
      strokeLinecap="round"
      style={{
        // ⚡ drop-shadow على الـ active فقط (زي ما كان)
        filter: isActive ? "drop-shadow(0px 6px 6px rgba(0,0,0,0.25))" : "none",
      }}
    />
  );
});

// ============================================
// HELPERS
// ============================================
const getCategoryNameArabic = (category) => {
  const names = {
    listening: "الاستماع",
    pronunciation: "النطق",
    reading: "القراءة",
    writing: "الكتابة",
  };
  return names[category] || category;
};

// ============================================
// LESSON NODE - Single circular node (3D) (Memoized)
// ============================================
const LessonNode = React.memo(function LessonNode({ node, position, onNodeClick }) {
  const { isUnlocked, isCurrent, isClickable, linkTo, theme } = node;

  const CircleContent = (
    <div className="relative" style={{ transformStyle: "preserve-3d" }}>
      {/* Outer ring for active node */}
      {isCurrent && (
        <div
          className="absolute inset-0 rounded-full border-4 animate-pulse"
          style={{
            borderColor: theme?.primary || "var(--primary-color)",
            width: "96px",
            height: "96px",
            left: "-8px",
            top: "-6px",
            transform: "translateZ(10px) rotateX(26.87deg)",
            boxShadow: "0 10px 18px rgba(0,0,0,0.35)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Depth layer */}
      <div
        className="absolute rounded-full"
        style={{
          width: "80px",
          height: "80px",
          transform: "translateY(12px) rotateX(26.87deg) translateZ(-6px)",
          background: "rgba(0,0,0,0.18)",
          filter: "blur(2px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Main circle */}
      <div
        style={{
          transform: "rotateX(26.87deg) translateZ(8px)",
          boxShadow: `0px 10px 0px 0px ${
            isUnlocked || isCurrent ? (theme?.secondary || "var(--secondary-color)") : "gray"
          }`,
          filter: isCurrent ? "drop-shadow(0px 14px 12px rgba(0,0,0,0.35))" : "none",
          background:
            isUnlocked || isCurrent
              ? `linear-gradient(to bottom, ${theme?.gradFrom}, ${theme?.gradTo})`
              : undefined,
        }}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-lg relative z-10
          ${isUnlocked || isCurrent ? "hover:scale-105 hover:-translate-y-1" : "bg-gray-300"}
        `}
      >
        <div className="relative z-10">
          <ToolIcon category={node.category} active={isUnlocked || isCurrent} size="w-10 h-10" />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Current Label */}
      {isCurrent && (
        <div className="absolute -top-[74px] left-1/2 -translate-x-1/2 z-50">
          <div className="relative">
            <div
              className="
                flex items-center gap-2
                bg-white/80 backdrop-blur-md
                border border-white/60
                rounded-2xl px-4 py-2
                shadow-[0_16px_30px_rgba(0,0,0,0.18)]
                whitespace-nowrap
              "
            >
              <div
                className="w-7 h-7 rounded-full shadow-md flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom, ${theme?.gradFrom}, ${theme?.gradTo})`,
                }}
              >
                <span className="text-white text-xs font-black">GO</span>
              </div>

              <span className="arabic_font text-slate-800 font-extrabold text-sm">
                {node.category === "listening"
                  ? `ابدأ الاستماع درس ${node.lessonNo}`
                  : `ابدأ ${getCategoryNameArabic(node.category)} درس ${node.lessonNo}`}
              </span>
            </div>

            <div
              className="absolute -inset-0.5 rounded-2xl blur-md -z-10"
              style={{
                background: `linear-gradient(to right, ${theme?.primary}55, ${theme?.secondary}55)`,
              }}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rotate-45 w-4 h-4 bg-white/80 border border-white/60 backdrop-blur-md" />
          </div>
        </div>
      )}

      {/* Click behavior */}
      {isClickable && linkTo ? (
        <Link
          to={linkTo}
          className="block"
          onClick={() => onNodeClick?.(node)}
          aria-label={node.label}
        >
          {CircleContent}
        </Link>
      ) : (
        <div className="cursor-not-allowed opacity-90">{CircleContent}</div>
      )}
    </div>
  );
});

// ============================================
// ZIGZAG PATH UI COMPONENT (3D container) (Memoized + memoized positions)
// ============================================
const ZigzagPathUI = React.memo(function ZigzagPathUI({ nodes, onNodeClick = () => {} }) {
  const positions = useMemo(() => {
    const centerX = 210;
    const startY = 110;
    const verticalSpacing = 145;
    const horizontalOffset = 85;

    const groupSize = 4;
    const groupGap = 80;

    return nodes.map((_, index) => {
      let x = centerX;
      if (index % 2 === 1) x = centerX - horizontalOffset;
      else if (index > 0) x = centerX + horizontalOffset;

      const groupIndex = Math.floor(index / groupSize);

      return {
        x,
        y: startY + index * verticalSpacing + groupIndex * groupGap,
      };
    });
  }, [nodes]);

  const svgHeight = useMemo(() => {
    if (!positions.length) return 520;
    return positions[positions.length - 1].y + 170;
  }, [positions]);

  return (
    <div className="container relative w-full flex justify-center py-10 overflow-hidden">
      <div
        className="relative"
        style={{
          width: "420px",
          height: `${svgHeight}px`,
          perspective: "900px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Group separators */}
        {nodes.map((_, index) => {
          const isEndOfGroup = (index + 1) % 4 === 0 && index !== nodes.length - 1;
          if (!isEndOfGroup) return null;

          const y = positions[index].y + 92;
          const nextTheme = nodes[index + 1]?.theme;

          return (
            <div
              key={`sep-${index}`}
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: `${y}px`, width: "340px", height: "28px", zIndex: 1 }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div
                  className="w-full h-[6px] rounded-full"
                  style={{
                    background: "rgba(229,231,235,0.9)",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.10)",
                  }}
                />
                <div
                  className="absolute w-20 h-5 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${nextTheme?.primary}55, ${nextTheme?.secondary}55)`,
                    filter: "blur(0px)",
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* SVG Connectors */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {positions.map((pos, index) => {
            if (index === positions.length - 1) return null;

            const isGroupBreak = (index + 1) % 4 === 0;
            if (isGroupBreak) return null;

            const nextPos = positions[index + 1];
            const activeColor = nodes[index]?.theme?.primary || "var(--primary-color)";

            return (
              <CurvedConnector
                key={`connector-${index}`}
                from={pos}
                to={nextPos}
                isActive={nodes[index].isUnlocked}
                activeColor={activeColor}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, idx) => (
          <LessonNode
            key={node.id}
            node={node}
            position={positions[idx]}
            onNodeClick={onNodeClick}
          />
        ))}
      </div>
    </div>
  );
});

// ============================================
// PROGRESS HOOK (✅ لا يقرأ localStorage كل render)
// ============================================
const useProgressData = (lengths) => {
  const safeParse = (raw, fallback) => {
    try {
      return JSON.parse(raw ?? "");
    } catch {
      return fallback;
    }
  };

  const countNumericCompleted = (obj) => {
    if (!obj || typeof obj !== "object") return 0;
    let c = 0;
    for (const key in obj) {
      if (/^\d+$/.test(key) && obj[key]?.completed) c++;
    }
    return c;
  };

  const compute = useCallback(() => {
    const listeningArr = safeParse(localStorage.getItem("sna-lesson-progress"), []);
    const listeningCompleted = Array.isArray(listeningArr)
      ? listeningArr.reduce((acc, x) => acc + (x?.isCompleted ? 1 : 0), 0)
      : 0;

    const pronounceObj = safeParse(localStorage.getItem("pronunciationMasterProgress"), {});
    const pronunciationCompleted = countNumericCompleted(pronounceObj);

    const readingObj = safeParse(localStorage.getItem("quizProgress"), {});
    const readingCompleted =
      readingObj && typeof readingObj === "object"
        ? Object.values(readingObj).reduce((acc, x) => acc + (x?.completed ? 1 : 0), 0)
        : 0;

    const writingObj = safeParse(localStorage.getItem("sna-writing-tool-progress"), {});
    const writingCompleted =
      writingObj && typeof writingObj === "object"
        ? Object.values(writingObj).reduce(
            (acc, x) => acc + (x?.phase === "questions-completed" ? 1 : 0),
            0
          )
        : 0;

    return {
      listening: listeningCompleted,
      pronunciation: pronunciationCompleted,
      reading: readingCompleted,
      writing: writingCompleted,
    };
  }, []);

  const [progress, setProgress] = useState(() => compute());

  // recompute عند تغيّر lengths (يعني data اتغيرت) + عند تغيّر localStorage (من تبويب آخر)
  useEffect(() => {
    setProgress(compute());

    const onStorage = (e) => {
      if (
        e.key === "sna-lesson-progress" ||
        e.key === "pronunciationMasterProgress" ||
        e.key === "quizProgress" ||
        e.key === "sna-writing-tool-progress"
      ) {
        setProgress(compute());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [compute, lengths.listening, lengths.pronounce, lengths.reading, lengths.writing]);

  return progress;
};

// ============================================
// NEW LOGIC - Interleaved ordering
// ============================================
const CATEGORY_ORDER = ["listening", "pronunciation", "reading", "writing"];

const buildInterleavedNodes = (lengths, completedCounts, getPathByCategory) => {
  const maxLen = Math.max(
    lengths.listening || 0,
    lengths.pronounce || 0,
    lengths.reading || 0,
    lengths.writing || 0
  );

  const lenByCat = {
    listening: lengths.listening || 0,
    pronunciation: lengths.pronounce || 0,
    reading: lengths.reading || 0,
    writing: lengths.writing || 0,
  };

  const doneByCat = {
    listening: completedCounts.listening || 0,
    pronunciation: completedCounts.pronunciation || 0,
    reading: completedCounts.reading || 0,
    writing: completedCounts.writing || 0,
  };

  const steps = [];
  for (let lessonNo = 1; lessonNo <= maxLen; lessonNo++) {
    for (const cat of CATEGORY_ORDER) {
      if (lessonNo <= (lenByCat[cat] || 0)) steps.push({ category: cat, lessonNo });
    }
  }

  let currentIndex = -1;
  for (let i = 0; i < steps.length; i++) {
    const { category, lessonNo } = steps[i];
    if (lessonNo > (doneByCat[category] || 0)) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex === -1) currentIndex = steps.length - 1;

  return steps.map((step, i) => {
    const isUnlocked = step.lessonNo <= (doneByCat[step.category] || 0);
    const isCurrent = i === currentIndex;
    const isClickable = isUnlocked || isCurrent;

    const groupIndex = Math.floor(i / 4);
    const theme = GROUP_THEMES[groupIndex % GROUP_THEMES.length];

    return {
      id: `${step.category}-${step.lessonNo}-${i}`,
      index: i,
      groupIndex,
      theme,
      category: step.category,
      lessonNo: step.lessonNo,
      label: `${getCategoryNameArabic(step.category)} ${step.lessonNo}`,
      iconType: step.category,
      isUnlocked,
      isCurrent,
      isClickable,
      linkTo: isClickable ? getPathByCategory(step.category, step.lessonNo) : null,
      nextCategoryLabel: isCurrent ? getCategoryNameArabic(step.category) : null,
    };
  });
};

// ============================================
// MAIN COMPONENT
// ============================================
export function HomeMainPlan() {
  const [data, setData] = useState({
    pronounce: null,
    writing: null,
    listening: null,
  });

  const [loading, setLoading] = useState({
    pronounce: true,
    writing: true,
    listening: true,
  });

  const [errors, setErrors] = useState({
    pronounce: null,
    writing: null,
    listening: null,
  });

  // ✅ Fetch مرة واحدة + state update مرة واحدة (أقل re-renders)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [p, w, l] = await Promise.all([
          fetch("/assets/pronounceData.json").then((r) => {
            if (!r.ok) throw new Error("Failed to load pronounceData.json");
            return r.json();
          }),
          fetch("/assets/writingData.json").then((r) => {
            if (!r.ok) throw new Error("Failed to load writingData.json");
            return r.json();
          }),
          fetch("/assets/listeningData.json").then((r) => {
            if (!r.ok) throw new Error("Failed to load listeningData.json");
            return r.json();
          }),
        ]);

        if (!mounted) return;

        setData({ pronounce: p, writing: w, listening: l });
        setErrors({ pronounce: null, writing: null, listening: null });
      } catch (e) {
        if (!mounted) return;
        setErrors({
          pronounce: e?.message || "Failed to load data",
          writing: e?.message || "Failed to load data",
          listening: e?.message || "Failed to load data",
        });
      } finally {
        if (!mounted) return;
        setLoading({ pronounce: false, writing: false, listening: false });
      }
    })();

    return () => {
      mounted = false;
    };
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

  const completedCounts = useProgressData(lengths);

  // ✅ stable callback
  const getPathByCategory = useCallback(
    (category, lessonNo) => {
      switch (category) {
        case "listening":
          return `/listening/lesson/${lessonNo}`;

        case "pronunciation":
          return `/pronounce/lesson/${lessonNo}`;

        case "reading":
          return `/reading/show-lesson-first-round/${lessonNo}/1`;

        case "writing": {
          const writingId = data?.writing?.topics?.[lessonNo - 1]?.id;
          return writingId ? `/article/${writingId}` : `/article/${lessonNo}`;
        }

        default:
          return `/plan/slug/lesson-${lessonNo}`;
      }
    },
    [data?.writing]
  );

  const total = useMemo(() => {
    const maxLen = Math.max(
      lengths.listening || 0,
      lengths.pronounce || 0,
      lengths.reading || 0,
      lengths.writing || 0
    );

    let count = 0;
    for (let n = 1; n <= maxLen; n++) {
      if (n <= lengths.listening) count++;
      if (n <= lengths.pronounce) count++;
      if (n <= lengths.reading) count++;
      if (n <= lengths.writing) count++;
    }
    return count;
  }, [lengths]);

  const nodes = useMemo(() => {
    if (total === 0) return [];
    return buildInterleavedNodes(lengths, completedCounts, getPathByCategory);
  }, [total, lengths, completedCounts, getPathByCategory]);

  const isLoading = useMemo(() => Object.values(loading).some(Boolean), [loading]);
  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  const handleNodeClick = useCallback((node) => {
    // لو لسه محتاج log خليه مؤقت، لكنه بيبطّأ مع كثرة re-renders
    // console.log("Node clicked:", node);
  }, []);

  if (isLoading) return <Loading />;

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

  return <ZigzagPathUI nodes={nodes} onNodeClick={handleNodeClick} />;
}
