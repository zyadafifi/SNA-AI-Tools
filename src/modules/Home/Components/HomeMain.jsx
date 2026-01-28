import { HomeSectionTitle } from "./HomeSectionTitle";
import { SideHome } from "./SideHome";
// import { HomeHeroSection } from "./HomeHeroSection";
// import { HomeToolsList } from "./HomeToolsList";
import { HomeMainPlan } from "./HomeMainPlan";
export const HomeMain = () => {
  return (
    <div className="p-5">
      <div className="max-w-4xl mx-auto lg:max-w-6xl xl:max-w-7xl lg:mr-0">
        {/* ===================== LEARNING TOOLS (Horizontal) - Top of page (desktop only) ===================== */}
        <div className="hidden lg:block">
          <SideHome />
        </div>

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
