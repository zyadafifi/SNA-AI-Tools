import React from "react";

const FeedbackDisplay = ({ feedback, onNext, onRetry, isLastExercise }) => {
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
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-[92%] max-w-[360px] bg-white/70 backdrop-blur-md rounded-[24px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        {/* Top accuracy badge */}
        <div className="flex justify-center -mt-12 mb-2">
          <div className="w-[110px] h-[110px] rounded-full bg-gradient-to-b from-[#ffd84d] to-[#f5b100] shadow-[0_8px_24px_rgba(255,197,21,0.5)] border-4 border-white flex flex-col items-center justify-center text-[#333]">
            <div className="text-2xl font-extrabold">{analysis.accuracy}%</div>
            <div className="text-[11px] leading-none opacity-80 mt-1">
              Accuracy
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-center text-[12px] text-[#475569] mt-2 mb-3">
          Master fundamental english vowel sounds with clear pronunciation
        </p>

        {/* Stats pills */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {stats.slice(0, 2).map((s, i) => (
            <div
              key={`top-${i}`}
              className="bg-white rounded-[28px] px-4 py-3 shadow-[0_6px_14px_rgba(0,0,0,0.1)] border border-[#e2e8f0] flex items-center justify-center gap-2"
            >
              <span
                className={`text-[18px] font-bold ${
                  i === 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {s.value}
              </span>
              <span className="text-[12px] text-[#475569]">{s.label}</span>
            </div>
          ))}
          {stats.slice(2, 4).map((s, i) => (
            <div
              key={`bot-${i}`}
              className="bg-white rounded-[28px] px-4 py-3 shadow-[0_6px_14px_rgba(0,0,0,0.1)] border border-[#e2e8f0] flex items-center justify-center gap-2"
            >
              <span className="text-[18px] font-bold text-[#0ea5e9]">
                {s.value}
              </span>
              <span className="text-[12px] text-[#475569]">{s.label}</span>
            </div>
          ))}
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
            className="px-5 py-2.5 rounded-full bg-white text-[#475569] border border-[#e2e8f0] shadow-sm hover:bg-white/80"
          >
            Retry
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2.5 rounded-full bg-[#ffc515] text-[#1f2937] font-semibold shadow-[0_8px_18px_rgba(255,197,21,0.35)] hover:bg-[#ffd84d]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDisplay;
