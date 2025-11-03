import React from "react";

const FeedbackDisplay = ({
  feedback,
  onNext,
  onRetry,
  isLastExercise,
  lessonTitle,
}) => {
  const { type, analysis, correctAnswer } = feedback;

  if (type !== "writing" || !analysis) return null;

  const stats = [
    { label: "correct", value: analysis.correctWords },
    { label: "mistakes", value: analysis.mistakes },
    { label: "missing", value: analysis.missing },
    { label: "Extra", value: analysis.extra },
  ];

  return (
    <div className="fixed inset-0 z-[1060] flex items-center justify-center">
      <div className="absolute inset-0 " />
      <div className="relative w-[92%] max-w-[360px] bg-white/80 backdrop-blur-md rounded-[24px] px-4 pt-5 pb-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        {/* Top accuracy badge */}
        <div className="flex justify-center mt-0 mb-3">
          <div className="w-[110px] h-[110px] rounded-full bg-gradient-to-b from-[#ffd84d] to-[#f5b100] shadow-[0_8px_24px_rgba(255,197,21,0.5)] border-4 border-white flex flex-col items-center justify-center text-[#333]">
            <div className="text-2xl font-extrabold">{analysis.accuracy}%</div>
            <div className="text-[11px] leading-none opacity-80 mt-1">
              Accuracy
            </div>
          </div>
        </div>
        {lessonTitle && (
          <div className="flex justify-center mt-5 mb-3">
            <div className="px-4 py-1 rounded-full bg-slate-200/90 backdrop-blur-sm border border-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] text-[12px] text-slate-800 font-semibold">
              {lessonTitle}
            </div>
          </div>
        )}
        {/* Stats: same styling as provided pill components */}
        <div className="space-y-2 mb-3 sm:mb-4 lg:mb-6 -mx-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 w-full">
            <div
              className="bg-white rounded-r-full rounded-l-xl sm:rounded-l-2xl border-t border-b border-r border-slate-200 shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:shadow-[0_12px_30px_rgba(0,0,0,0.12)] h-12 sm:h-14 lg:h-16 xl:h-18 flex items-center justify-end px-4 sm:px-6 lg:px-8 xl:px-12"
              aria-label={`${stats[0].value} ${stats[0].label}`}
            >
              <div className="text-center leading-tight flex flex-col justify-center">
                <div className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-green-600">
                  {stats[0].value}
                </div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-0.5">
                  {stats[0].label}
                </div>
              </div>
            </div>
            <div
              className="bg-white rounded-l-full rounded-r-xl sm:rounded-r-2xl border-t border-b border-l border-slate-200 shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:shadow-[0_12px_30px_rgba(0,0,0,0.12)] h-12 sm:h-14 lg:h-16 xl:h-18 flex items-center justify-start px-4 sm:px-6 lg:px-8 xl:px-12"
              aria-label={`${stats[1].value} ${stats[1].label}`}
            >
              <div className="text-center leading-tight flex flex-col justify-center">
                <div className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-red-500">
                  {stats[1].value}
                </div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-0.5">
                  {stats[1].label}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 w-full">
            <div
              className="bg-white rounded-r-full rounded-l-xl sm:rounded-l-2xl border-t border-b border-r border-slate-200 shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:shadow-[0_12px_30px_rgba(0,0,0,0.12)] h-12 sm:h-14 lg:h-16 xl:h-18 flex items-center justify-end px-4 sm:px-6 lg:px-8 xl:px-12"
              aria-label={`${stats[2].value} ${stats[2].label}`}
            >
              <div className="text-center leading-tight flex flex-col justify-center">
                <div className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-slate-700">
                  {stats[2].value}
                </div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-0.5">
                  {stats[2].label}
                </div>
              </div>
            </div>
            <div
              className="bg-white rounded-l-full rounded-r-xl sm:rounded-r-2xl border-t border-b border-l border-slate-200 shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:shadow-[0_12px_30px_rgba(0,0,0,0.12)] h-12 sm:h-14 lg:h-16 xl:h-18 flex items-center justify-start px-4 sm:px-6 lg:px-8 xl:px-12"
              aria-label={`${stats[3].value} ${stats[3].label}`}
            >
              <div className="text-center leading-tight flex flex-col justify-center">
                <div className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-slate-700">
                  {stats[3].value}
                </div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-0.5">
                  {stats[3].label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-3">
          <div className="bg-white/90 border border-[#e2e8f0] rounded-[16px] p-3">
            <div className="text-[12px] text-[#475569] mb-2 font-semibold">
              Your Answer
            </div>
            <div className="text-[13px] text-[#334155]">
              <div
                className="leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    analysis.userAnalysis ||
                    analysis.userAnswer ||
                    "No answer provided",
                }}
              />
            </div>
          </div>
          <div className="bg-white/90 border border-[#e2e8f0] rounded-[16px] p-3">
            <div className="text-[12px] text-[#475569] mb-2 font-semibold">
              correct answer
            </div>
            <style>{`
              .word-correct{background:#86efac;color:#166534;border-radius:10px;padding:4px 8px;margin:2px;display:inline-block}
              .word-should-be{background:#86efac;color:#166534;border-radius:10px;padding:4px 8px;margin:2px;display:inline-block}
              .word-incorrect{background:#fecaca;color:#7f1d1d;border-radius:10px;padding:4px 8px;margin:2px;display:inline-block}
              .word-extra{background:#fde68a;color:#78350f;border-radius:10px;padding:4px 8px;margin:2px;display:inline-block}
              .word-missing{background:#fde68a;color:#78350f;border-radius:10px;padding:4px 8px;margin:2px;display:inline-block}
            `}</style>
            <div
              className="text-[13px] text-[#334155] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: analysis.correctAnalysis || analysis.correctAnswer,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={onRetry}
            className="w-[100px] h-[38px] rounded-full border border-[#D1D5DB] text-[#6B7280] text-sm font-medium bg-white hover:bg-gray-50 transition"
          >
            Retry
          </button>
          <button
            onClick={onNext}
            className="w-[100px] h-[38px] rounded-full bg-[#FFC107] text-white text-sm font-semibold shadow-[0_4px_12px_rgba(255,193,7,0.35)] hover:bg-[#FFB300] transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDisplay;
