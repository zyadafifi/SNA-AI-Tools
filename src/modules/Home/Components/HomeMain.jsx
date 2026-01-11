import { HomeSectionTitle } from "./HomeSectionTitle";
// import { HomeHeroSection } from "./HomeHeroSection";
// import { HomeToolsList } from "./HomeToolsList";
import { HomeMainPlan } from "./HomeMainPlan";
export const HomeMain = () => {
  return (
    <div className="p-5">
      <div className="max-w-4xl mx-auto lg:max-w-6xl xl:max-w-7xl">
        {/* ===================== HERO SECTION ===================== */}
        {/* <HomeHeroSection tools={tools} /> */}

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
