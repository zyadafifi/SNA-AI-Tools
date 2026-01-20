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

  return (
    <div className="fixed inset-0 z-[1060] flex items-center justify-center">
      <div className="absolute inset-0 " />
      <div className="relative w-[92%] max-w-[360px] bg-white/80 backdrop-blur-md rounded-[24px] px-4 pt-5 pb-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        {/* Header - Simple Score Text */}
        <div className="text-center mb-3">
          <div className="text-2xl font-bold text-gray-800">
            Score: {analysis.accuracy}%
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Let's try again — you're improving!
          </div>
        </div>

        {/* Correct Sentence Section */}
        <div className="bg-white/90 rounded-xl p-3 mb-4">
          <div className="text-xs text-gray-600 font-semibold mb-1">
            Correct sentence:
          </div>
          <div className="text-sm text-gray-800">
            {analysis.correctAnswer || correctAnswer}
          </div>
        </div>

        {/* Stats - Horizontal Row with Icons */}
        <div className="flex items-center justify-around bg-white/90 rounded-xl p-4 mb-4">
          {/* Correct */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-green-600"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <span className="text-xs text-gray-600">Correct: </span>
              <span className="font-semibold text-green-600">
                {analysis.correctWords}
              </span>
            </div>
          </div>

          {/* Wrong */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-red-600"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <span className="text-xs text-gray-600">Wrong: </span>
              <span className="font-semibold text-red-600">
                {analysis.mistakes}
              </span>
            </div>
          </div>

          {/* Missing */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-orange-600"
              >
                <path
                  d="M12 9v4m0 4h.01"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <span className="text-xs text-gray-600">Missing: </span>
              <span className="font-semibold text-orange-600">
                {analysis.missing}
              </span>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-3">
          <div className="bg-white/90 border border-[#e2e8f0] rounded-[16px] p-3">
            <div className="text-[12px] text-[#475569] mb-2 font-semibold">
              Your Answer:
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
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={onRetry}
            className="px-8 py-2.5 rounded-full bg-[#FFC107] text-white text-sm font-semibold shadow-[0_4px_12px_rgba(255,193,7,0.35)] hover:bg-[#FFB300] transition"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              if (onNext) {
                onNext();
              }
            }}
            className="px-8 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
          >
            <span>Next</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="text-gray-700"
            >
              <path
                d="M6 3L6 9M3 6l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Keep word highlighting styles */}
        <style>{`
          .word-correct{background:#86efac;color:#166534;border-radius:10px;padding:4px 8px;margin:2px;display:inline-block}
          .word-should-be{background:#86efac;color:#166534;border-radius:10px;padding:4px 8px;margin:2px;display:inline-block}
          .word-incorrect{background:#fecaca;color:#7f1d1d;border-radius:10px;padding:4px 8px;margin:2px;display:inline-block}
          .word-extra{background:#fde68a;color:#78350f;border-radius:10px;padding:4px 8px;margin:2px;display:inline-block}
          .word-missing{background:#fde68a;color:#78350f;border-radius:10px;padding:4px 8px;margin:2px;display:inline-block}
        `}</style>
      </div>
    </div>
  );
};

export default FeedbackDisplay;
