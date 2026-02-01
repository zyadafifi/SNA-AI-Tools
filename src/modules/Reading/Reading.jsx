import { useMemo, useState, useCallback, useDeferredValue } from "react";
import { LevelList } from "./Components/LevelList/LevelList";
import { readingData } from "../../config/readingData/readingData";
import { SectionTitle } from "../../components/index";

/**
 * Keep this outside component so it doesn't get re-created on every render
 */
const LEVEL_SECTIONS = [
  { title: "Beginner", keys: ["Beginner"] },
  { title: "Pre Intermediate", keys: ["Pre-Intermediate"] },
  { title: "Intermediate", keys: ["Intermediate"] },
  { title: "Advanced", keys: ["Advanced"] },
];

export const Reading = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // store as array for UI simplicity, but we'll also build a Set for fast lookup
  const [selectedLevels, setSelectedLevels] = useState([]);

  /**
   * Defer the search term so React prioritizes typing responsiveness
   * (especially helpful if the dataset is large)
   */
  const deferredSearchTerm = useDeferredValue(searchTerm);

  /**
   * Build an index ONCE:
   * - group levels by levelKey
   * - precompute lowercase titles to avoid calling toLowerCase repeatedly
   * - for lessons also precompute lowercase title
   */
  const indexed = useMemo(() => {
    const byKey = new Map();

    for (const level of readingData) {
      const levelKey = level.levelKey;
      if (!byKey.has(levelKey)) byKey.set(levelKey, []);

      const lessons = Array.isArray(level.lessons) ? level.lessons : [];

      byKey.get(levelKey).push({
        ...level,
        __levelTitleLower: (level.levelTitle || "").toLowerCase(),
        lessons: lessons.map((lesson) => ({
          ...lesson,
          __lessonTitleLower: (lesson.title || "").toLowerCase(),
        })),
        __totalLessonsCount: lessons.length,
      });
    }

    return { byKey };
  }, []);

  const selectedLevelsSet = useMemo(() => new Set(selectedLevels), [selectedLevels]);

  const filteredData = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    const hasTerm = term.length > 0;
    const hasLevelFilter = selectedLevelsSet.size > 0;

    const results = {
      sections: [],
      levelMatches: 0,
      itemMatches: 0,
      totalResults: 0,
    };

    for (const section of LEVEL_SECTIONS) {
      // Gather all levels for this section from the indexed map (no readingData.filter)
      let sectionLevels = [];
      for (const k of section.keys) {
        const arr = indexed.byKey.get(k);
        if (arr?.length) sectionLevels = sectionLevels.concat(arr);
      }

      // Apply level filter using Set (fast)
      if (hasLevelFilter) {
        sectionLevels = sectionLevels.filter((lvl) => selectedLevelsSet.has(lvl.levelKey));
      }

      if (sectionLevels.length === 0) continue;

      let filteredLevels = [];

      if (hasTerm) {
        for (const level of sectionLevels) {
          const levelTitleMatches = level.__levelTitleLower.includes(term);

          // filter lessons by title (fast lowercased field)
          let matchingLessons = [];
          if (level.lessons?.length) {
            matchingLessons = level.lessons.filter((lesson) =>
              lesson.__lessonTitleLower.includes(term)
            );
          }

          if (levelTitleMatches || matchingLessons.length > 0) {
            filteredLevels.push({
              ...level,
              levelTitleMatched: levelTitleMatches,
              lessons: matchingLessons.length > 0 ? matchingLessons : level.lessons || [],
              matchingLessonsCount: matchingLessons.length,
              totalLessonsCount: level.__totalLessonsCount || 0,
            });

            if (levelTitleMatches) results.levelMatches++;
            results.itemMatches += matchingLessons.length;
          }
        }
      } else {
        // no search term: include everything after level filter
        filteredLevels = sectionLevels.map((level) => ({
          ...level,
          levelTitleMatched: false,
          matchingLessonsCount: 0,
          totalLessonsCount: level.__totalLessonsCount || 0,
        }));

        results.levelMatches += filteredLevels.length;
        results.itemMatches += filteredLevels.reduce(
          (acc, lvl) => acc + (lvl.__totalLessonsCount || 0),
          0
        );
      }

      if (filteredLevels.length > 0) {
        results.sections.push({
          title: section.title,
          levelList: filteredLevels,
        });
      }
    }

    results.totalResults = results.levelMatches + results.itemMatches;
    return results;
  }, [deferredSearchTerm, indexed, selectedLevelsSet]);

  const handleLevelToggle = useCallback((levelKey) => {
    setSelectedLevels((prev) => {
      // avoid includes twice
      const i = prev.indexOf(levelKey);
      if (i !== -1) {
        const next = prev.slice();
        next.splice(i, 1);
        return next;
      }
      return [...prev, levelKey];
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedLevels([]);
  }, []);

  const hasSearch = deferredSearchTerm.trim() || selectedLevels.length > 0;

  return (
    <div>
      {/* <HeroSection /> */}
      <div className="section-padding">
        <div className="container container-xxl space-y-8" id="start_Beginner">
          {/* Search by Title Only */}
          <div>
            {/* Search Input - Title Search Only */}
            <div className="mb-6 flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Library"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 w-full placeholder:text-gray-800 bg-white py-[5px] pl-11 text-[#000] border border-gray-300 rounded-2xl outline-none"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {hasSearch && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Level Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-gray-700">Filter by Level:</h3>

                {LEVEL_SECTIONS.map(({ title, keys }) => {
                  const key = keys[0];
                  const isSelected = selectedLevelsSet.has(key);

                  return (
                    <button
                      key={title}
                      onClick={() => handleLevelToggle(key)}
                      className={`px-3 py-2 text-sm font-medium rounded-2xl shadow-sm transition-colors ${
                        isSelected
                          ? "bg-[var(--primary-color)] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results */}
          {filteredData.sections.length > 0 ? (
            filteredData.sections.map(({ title, levelList }) => (
              <div key={title}>
                <div className="flex items-center justify-between">
                  <SectionTitle title={title} />
                </div>
                <LevelList levelList={levelList} />
              </div>
            ))
          ) : (
            <div className="text-center py-16 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No title matches found</h3>
              <p className="text-gray-500 mb-4">
                {deferredSearchTerm.trim()
                  ? `No level titles or lesson titles contain "${deferredSearchTerm}"`
                  : "No levels match your selected filters"}
              </p>
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-[var(--secondary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
