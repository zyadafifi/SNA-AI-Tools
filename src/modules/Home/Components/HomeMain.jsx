import { Volume2, Headphones, PenTool, BookOpen } from "lucide-react";
import { HomeSectionTitle } from "./HomeSectionTitle";
import { HomeHeroSection } from "./HomeHeroSection";
// import { HomeToolsList } from "./HomeToolsList";
import { HomeMainPlan } from "./HomeMainPlan";
export const HomeMain = () => {
  const tools = [
    {
      id: 1,
      icon: Volume2,
      title: "Pronunciation Tool",
      titleAr: "النطق",
      description:
        "Master perfect pronunciation with AI-powered feedback and real-time correction",
      descriptionAr:
        "أتقن النطق الصحيح مع تعليقات الذكاء الاصطناعي والتصحيح الفوري",
      color: "from-[var(--primary-color)] to-[var(--secondary-color)]",
      features: ["Voice Recognition", "Accent Analysis", "Progress Tracking"],
      link: "/pronounce/home",
    },
    {
      id: 2,
      icon: Headphones,
      title: "Listening Tool",
      titleAr: "الاستماع",
      description:
        "Enhance your listening skills with native speakers and adaptive content",
      descriptionAr: "حسّن مهارات الاستماع مع متحدثين أصليين ومحتوى تفاعلي",
      color: "from-[var(--primary-color)] to-[var(--secondary-color)]",
      features: ["Native Audio", "Speed Control", "Comprehension Tests"],
      link: "/listening/home",
    },
    {
      id: 3,
      icon: PenTool,
      title: "Writing Tool",
      titleAr: "الكتابة",
      description:
        "Improve your writing with intelligent grammar checking and style suggestions",
      descriptionAr: "طوّر كتابتك مع فحص القواعد الذكي واقتراحات الأسلوب",
      color: "from-[var(--primary-color)] to-[var(--secondary-color)]",
      features: ["Grammar Check", "Style Tips", "Vocabulary Builder"],
      link: "/writing/home",
    },
    {
      id: 4,
      icon: BookOpen,
      title: "Reading Tool",
      titleAr: "القراءة",
      description:
        "Build reading fluency with leveled content and interactive comprehension",
      descriptionAr: "ابنِ طلاقة القراءة مع محتوى متدرج وفهم تفاعلي",
      color: "from-[var(--primary-color)] to-[var(--secondary-color)]",
      features: ["Adaptive Levels", "Instant Translation", "Reading Analytics"],
      link: "/reading",
    },
  ];

  return (
    <div className="p-5">
      <div className="max-w-4xl mx-auto lg:max-w-6xl xl:max-w-7xl">
        {/* ===================== HERO SECTION ===================== */}
        <HomeHeroSection tools={tools} />

        {/* ===================== SECTION TITLE ===================== */}
        <HomeSectionTitle />

        {/* ===================== HOME PLAN ===================== */}
        <HomeMainPlan />

        {/* ===================== TOOLS LIST ===================== */}
        {/* <HomeToolsList tools={tools} /> */}
      </div>
    </div>
  );
};
