const ExerciseArea = ({
  exercise,
  userAnswer,
  onAnswerChange,
  onSubmit,
  onReset,
  showFeedback,
}) => {
  return (
    <div className="space-y-6">
      {/* Exercise Content - Writing Mode Only */}
      <div>
        <label className="block mb-3 font-semibold text-gray-700 text-lg">
          Your Turn! type what you heard
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="type the sentence you heard here ......."
          className="w-full p-4 border border-gray-300 rounded-2xl text-base resize-vertical min-h-[140px] font-inherit transition-colors duration-300 focus:outline-none focus:border-gray-400 bg-white text-gray-800 placeholder:text-gray-400"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
        />
      </div>

      {/* Action Buttons */}
      {!showFeedback && (
        <div className="flex gap-3 sm:gap-4 justify-center">
          <button
            onClick={onSubmit}
            disabled={!userAnswer.trim()}
            className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 ${
              !userAnswer.trim()
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-[#FDCB3E] text-gray-800 hover:bg-[#ffd84d] shadow-sm"
            }`}
          >
            Check Answer
          </button>

          <button
            onClick={onReset}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm"
          >
            Listen again
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseArea;
