import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { X, Volume2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { readingData } from "../../config/readingData/readingData";

/* ------------------------------------------------------------------ */
/* TTS support + config                                               */
/* ------------------------------------------------------------------ */
const supportsTTS =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

const PREFERRED_VOICE_NAME = "Google UK English Male";
const PREFERRED_VOICE_LANG = "en-GB";



/* ------------------------------------------------------------------ */
/* Word Popover (replaces Sidebar)                                   */
/* ------------------------------------------------------------------ */
const WordPopover = ({ isOpen, selectedWordData, position, onClose, onPlayWordAudio }) => {
  if (!isOpen || !selectedWordData || !position) return null;

  const popoverWidth = 320;
  const estimatedHeight = 250;

  // حساب الموقع
  let top = position.top;
  let left = position.left - popoverWidth / 2;
  let showBelow = false;

  // نشوف لو الكلمة في أول الصفحة
  if (position.top < estimatedHeight + 100) {
    showBelow = true;
    top = position.bottom + 10;
  } else {
    top = position.top - estimatedHeight - 10;
  }

  // نتأكد إن مش هيخرج من الشاشة يمين أو شمال
  const maxLeft = window.innerWidth - popoverWidth - 20;
  if (left < 20) {
    left = 20;
  } else if (left > maxLeft) {
    left = maxLeft;
  }

  // حساب موقع السهم بالنسبة للـ popover
  const arrowLeft = position.left - left;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-20 md:bg-transparent"
        onClick={onClose}
      />
      
      {/* Popover */}
      <div
        className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200"
        style={{
          top: `${top - 65}px`,
          left: `${left}px`,
          width: `${popoverWidth}px`,
          maxWidth: 'calc(100vw - 40px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 break-all flex-1 mr-2">
            {selectedWordData.word}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayWordAudio(selectedWordData.word);
              }}
              className="p-1.5 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] rounded-lg transition-all duration-200"
              aria-label="Play pronunciation"
            >
              <Volume2 size={16} className="text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Close"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {/* Translation */}
          <div>
            <p className="arabic_font text-right text-base text-gray-700 font-medium">
              {selectedWordData.translation}
            </p>
          </div>

          {/* Definition */}
          {selectedWordData.definition && (
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Definition
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedWordData.definition}
              </p>
            </div>
          )}
        </div>

        {/* Arrow pointer */}
        <div
          className={`absolute w-3 h-3 bg-white border border-gray-200 transform rotate-45 ${
            showBelow 
              ? 'border-b-0 border-r-0 -top-[7px]' 
              : 'border-t-0 border-l-0 -bottom-[7px]'
          }`}
          style={{
            left: `${Math.max(10, Math.min(arrowLeft, popoverWidth - 10))}px`,
          }}
        />
      </div>
    </>
  );
};

WordPopover.propTypes = {
  isOpen: PropTypes.bool,
  selectedWordData: PropTypes.object,
  position: PropTypes.shape({
    top: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
  onClose: PropTypes.func,
  onPlayWordAudio: PropTypes.func,
};

/* ------------------------------------------------------------------ */
/* ClickableWord                                                      */
/* ------------------------------------------------------------------ */
const ClickableWord = ({
  word,
  isLast,
  onWordClick,
  activeWord,
  wordDefinitions,
  onPlayWordAudio,
}) => {
  const wordRef = useRef(null);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    
    const cleanWord = word.replace(/[.,!?;:'"]/g, "");
    const toLowerWord = cleanWord.toLowerCase();
    const wordData = wordDefinitions[toLowerWord];

    if (!wordRef.current) return;

    // حساب موقع الكلمة بالنسبة للصفحة
    const rect = wordRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const position = {
      top: rect.top + scrollTop,
      bottom: rect.bottom + scrollTop,
      left: rect.left + scrollLeft + rect.width / 2,
    };

    onPlayWordAudio(cleanWord);

    onWordClick({
      word: cleanWord,
      translation: wordData ? wordData.translation : "ترجمة غير متوفرة",
      definition: wordData ? wordData.definition : "Definition not available",
      partOfSpeech: wordData ? wordData.partOfSpeech : "word",
      rank: wordData ? wordData.rank : Math.floor(Math.random() * 1000) + 1,
    }, position);
  }, [word, onWordClick, wordDefinitions, onPlayWordAudio]);

  const cleanWord = word.replace(/[.,!?;:'"]/g, "");
  const punctuation = word.slice(cleanWord.length);
  const isActive = activeWord === cleanWord;

  return (
    <>
      <span
        ref={wordRef}
        className={`text-black font-semibold text-xl hover:bg-blue-100 cursor-pointer rounded transition-all duration-200 ${
          isActive
            ? "border border-black p-1 bg-blue-50 shadow-sm"
            : "border border-transparent"
        }`}
        onClick={handleClick}
      >
        {cleanWord}
      </span>
      {punctuation && <span className="text-black">{punctuation}</span>}
      {!isLast && <span> </span>}
    </>
  );
};

ClickableWord.propTypes = {
  word: PropTypes.string.isRequired,
  isLast: PropTypes.bool.isRequired,
  onWordClick: PropTypes.func.isRequired,
  activeWord: PropTypes.string,
  wordDefinitions: PropTypes.object.isRequired,
  onPlayWordAudio: PropTypes.func.isRequired,
};

/* ------------------------------------------------------------------ */
/* Sentence                                                           */
/* ------------------------------------------------------------------ */
const Sentence = ({
  sentence,
  onWordClick,
  activeWord,
  wordDefinitions,
  onPlaySentenceAudio,
  onPlayWordAudio,
}) => {
  const words = sentence.text.split(" ");

  return (
    <div className="relative">
      <div className="flex items-center mb-2">
        <p className={`text-lg leading-relaxed w-fit text-gray-800`}>
          {words.map((word, index) => (
            <ClickableWord
              key={index}
              word={word}
              isLast={index === words.length - 1}
              onWordClick={onWordClick}
              activeWord={activeWord}
              wordDefinitions={wordDefinitions}
              onPlayWordAudio={onPlayWordAudio}
            />
          ))}
        </p>

        {sentence.audioUrl && (
          <button
            onClick={() => onPlaySentenceAudio(sentence.audioUrl)}
            className="ml-2 p-2 bg-blue-100 hover:bg-blue-200 rounded-full"
            title="تشغيل الجملة"
          >
            <Volume2 size={16} className="text-blue-600" />
          </button>
        )}
      </div>
    </div>
  );
};

Sentence.propTypes = {
  sentence: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    audioUrl: PropTypes.string,
    translationAr: PropTypes.string,
  }).isRequired,
  onWordClick: PropTypes.func.isRequired,
  activeWord: PropTypes.string,
  wordDefinitions: PropTypes.object.isRequired,
  onPlaySentenceAudio: PropTypes.func.isRequired,
  onPlayWordAudio: PropTypes.func.isRequired,
};

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */
export function ShowLessonFirstRound() {
  const { levelId, lessonId } = useParams();
  const levelIdNum = Number(levelId);
  const lessonIdNum = Number(lessonId);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedWordData, setSelectedWordData] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState(null);
  const [activeWord, setActiveWord] = useState(null);

  const currentLevel = readingData.find((level) => level.id === levelIdNum);
  const currentLesson =
    currentLevel?.lessons.find((lesson) => lesson.id === lessonIdNum) || null;

  // TTS voices
  const [voices, setVoices] = useState([]);
  const audioRef = useRef(null);

  /* ---------------- Voices ---------------- */
  useEffect(() => {
    if (!supportsTTS) return;
    const loadVoices = () =>
      setVoices(window.speechSynthesis.getVoices() || []);
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const pickVoice = useCallback(() => {
    if (!voices.length) return null;
    const byName =
      voices.find(
        (v) =>
          (v.name || "")
            .toLowerCase()
            .includes(PREFERRED_VOICE_NAME.toLowerCase()) ||
          (v.voiceURI || "")
            .toLowerCase()
            .includes(PREFERRED_VOICE_NAME.toLowerCase())
      ) || null;
    if (byName) return byName;
    const byLang = voices.find((v) =>
      (v.lang || "")
        .toLowerCase()
        .startsWith(PREFERRED_VOICE_LANG.toLowerCase())
    );
    if (byLang) return byLang;
    return voices.find((v) => (v.lang || "").startsWith("en")) || voices[0];
  }, [voices]);

  const speak = useCallback(
    (text) => {
      const toSay = (text || "").trim();
      if (!toSay) return;

      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }

      if (supportsTTS) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(toSay);
          const v = pickVoice();
          if (v) utter.voice = v;
          utter.lang = v?.lang || PREFERRED_VOICE_LANG || "en-US";
          utter.rate = 1;
          utter.pitch = 1;
          utter.volume = 1;
          window.speechSynthesis.speak(utter);
          return;
        } catch (e) {
          console.error("TTS failed, fallback to MP3:", e);
        }
      }

      const url = `https://cdn13674550.b-cdn.net/SNA-audio/words/${toSay.toLowerCase()}.mp3`;
      audioRef.current = new Audio(url);
      try {
        audioRef.current.playbackRate = 1;
      } catch {}
      audioRef.current.play().catch((err) => {
        console.error("TTS+MP3 fallback failed:", err);
      });
    },
    [pickVoice]
  );

  const playSentenceAudio = useCallback((audioUrl) => {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    try {
      audio.playbackRate = 1;
    } catch {}
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  }, []);

  const playWordAudio = useCallback(
    (word) => {
      const clean = (word || "").replace(/[^\w'-]/g, "");
      if (!clean) return;
      speak(clean);
    },
    [speak]
  );

  /* ---------------- Word click (open/close popover) ---------------- */
  const handleWordClick = useCallback((wordData, position) => {
    setSelectedWordData((prev) => {
      if (prev && prev.word === wordData.word) {
        setPopoverOpen(false);
        setActiveWord(null);
        setPopoverPosition(null);
        return null;
      } else {
        setPopoverOpen(true);
        setActiveWord(wordData.word);
        setPopoverPosition(position);
        return wordData;
      }
    });
  }, []);

  const closePopover = () => {
    setPopoverOpen(false);
    setActiveWord(null);
    setSelectedWordData(null);
    setPopoverPosition(null);
  };

  /* ---------------- Cleanup ---------------- */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, []);

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Lesson not found
          </h2>
          <p className="text-gray-500">
            The requested lesson could not be found.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const NEXT_ROUND_URL = `/reading/show-lesson-second-round/${levelId}/${lessonId}`;

  return (
    <div className="min-h-screen relative">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/reading"
              className="p-2 text-[var(--secondary-color)] hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={29} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
            <img
              src={currentLevel.image}
              alt={currentLevel.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 ">
              {currentLesson.title}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base line-clamp-2">
              {currentLesson.description}
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-24">
          {currentLesson.storyData.content.map((sentence) => (
            <Sentence
              key={sentence.id}
              sentence={sentence}
              onWordClick={handleWordClick}
              activeWord={activeWord}
              wordDefinitions={currentLesson.wordDefinitions}
              onPlaySentenceAudio={playSentenceAudio}
              onPlayWordAudio={playWordAudio}
            />
          ))}
        </div>
      </div>

      {/* Word Popover */}
      <WordPopover
        isOpen={popoverOpen}
        selectedWordData={selectedWordData}
        position={popoverPosition}
        onClose={closePopover}
        onPlayWordAudio={playWordAudio}
      />

      {/* Next round button */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="absolute inset-0 rounded-full bg-[var(--primary-color)] blur-lg opacity-60 animate-pulse"></div>
        <Link
          to={NEXT_ROUND_URL}
          className="relative arabic_font text-sm font-medium px-5 py-3 rounded-full bg-[var(--primary-color)] text-white hover:bg-[var(--secondary-color)] active:scale-[.98] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
        >
          <span className="arabic_font">الذهاب إلى الجولة التالية</span>
          <span className="inline-block animate-bounce">👉</span>
        </Link>
      </div>
    </div>
  );
}