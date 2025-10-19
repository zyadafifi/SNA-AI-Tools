import { useEffect, useState } from "react";
import { readingData } from "../../config/readingData/readingData";
import { Loading } from "../../components/Loading";
import { Error } from "../../components/Error";
import { useParams } from "react-router-dom";

export const ShowLessonsBySlug = () => {
  const { slug } = useParams();
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
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState(null);

  const fetchData = async (url, key) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load data");
      const json = await res.json();
      setData((p) => ({ ...p, [key]: json }));
      setErrors((p) => ({ ...p, [key]: null }));
    } catch (e) {
      setErrors((p) => ({ ...p, [key]: e.message }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  };

  useEffect(() => {
    fetchData("/assets/pronounceData.json", "pronounce");
    fetchData("/assets/writingData.json", "writing");
    fetchData("/assets/listeningData.json", "listening");
  }, []);

  if (errors.pronounce || errors.writing || errors.listening) {
    return (
      <>
        <Error
          errorMassage={errors.pronounce || errors.writing || errors.listening}
        />
      </>
    );
  }

  if (loading.pronounce || loading.writing || loading.listening) {
    return <Loading height={"100vh"} />;
  }

  // البحث عن الدروس - مع التأكد من وجود exercises للـ pronounce
  const pronounceLesson = data.pronounce?.lessons?.find(
    (lesson) => lesson.slug === slug && lesson.exercises && lesson.exercises.length > 0
  );
  
  const listeningLesson = data.listening?.lessons?.find(
    (lesson) => lesson.slug === slug && lesson.topics && lesson.topics.length > 0
  );
  
  const writingLesson = data.writing?.topics?.find(
    (lesson) => lesson.slug === slug
  );
  
  const readingLesson = readingData?.find((lesson) => lesson.slug === slug);

  console.log(pronounceLesson, "pronounce");
  console.log(listeningLesson, "listening");
  console.log(writingLesson, "writing");
  console.log(readingLesson, "reading");

  const handlePlayAudio = (audioUrl) => {
    setIsPlaying(true);
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => setIsPlaying(false);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  // عرض درس النطق (فيه exercises)
  if (pronounceLesson && pronounceLesson.exercises) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(pronounceLesson.difficulty)}`}>
                    {pronounceLesson.difficulty}
                  </span>
                  <span className="flex items-center gap-2 text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {pronounceLesson.duration}
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-3">{pronounceLesson.title}</h1>
                <p className="text-blue-100 text-lg">{pronounceLesson.description}</p>
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">التمارين ({pronounceLesson.exercises.length})</h2>
              <div className="text-sm text-gray-600">التمرين {currentExercise + 1} من {pronounceLesson.exercises.length}</div>
            </div>
            
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {pronounceLesson.exercises.map((ex, idx) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setCurrentExercise(idx);
                      setSelectedChoice(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      currentExercise === idx
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {pronounceLesson.exercises[currentExercise] && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-100">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handlePlayAudio(pronounceLesson.exercises[currentExercise].audio)}
                      className="flex-shrink-0 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      {isPlaying ? (
                        <svg className="w-7 h-7 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0a5 5 0 007.072 0" />
                        </svg>
                      ) : (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">استمع واختر الجملة الصحيحة</p>
                      <p className="text-xl font-semibold text-gray-900">{pronounceLesson.exercises[currentExercise].text}</p>
                    </div>
                  </div>
                </div>

                {pronounceLesson.exercises[currentExercise].choices && (
                  <div className="grid gap-3">
                    {pronounceLesson.exercises[currentExercise].choices.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedChoice(idx)}
                        className={`p-4 rounded-xl text-left transition-all border-2 ${
                          selectedChoice === idx
                            ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                            selectedChoice === idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-base">{choice}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // عرض درس الاستماع (فيه topics)
  if (listeningLesson && listeningLesson.topics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.586a5 5 0 010-7.072m2.828 9.9a9 9 0 010-12.728M6.343 6.343a10.657 10.657 0 000 15.072m11.314-15.072a10.657 10.657 0 010 15.072" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white bg-opacity-20">
                    الدرس {listeningLesson.lessonNumber}
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-3">{listeningLesson.title}</h1>
                <p className="text-purple-100 text-lg">{listeningLesson.topics.length} مواضيع رئيسية</p>
              </div>
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-4">
            {listeningLesson.topics.map((topic) => (
              <div key={topic.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <button
                  onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <i className={`${topic.icon} text-purple-600 text-2xl`}></i>
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{topic.title}</h3>
                      <p className="text-gray-600 text-sm">{topic.description}</p>
                    </div>
                  </div>
                  <svg 
                    className={`w-6 h-6 text-gray-400 transition-transform ${expandedTopic === topic.id ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedTopic === topic.id && topic.conversations && (
                  <div className="px-6 pb-6 space-y-3">
                    {topic.conversations.map((conv) => (
                      <div key={conv.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-100">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{conv.title}</h4>
                            <p className="text-sm text-gray-600">{conv.description}</p>
                          </div>
                        </div>
                        {conv.sentences && conv.sentences.length > 0 && (
                          <div className="space-y-2">
                            {conv.sentences.map((sentence) => (
                              <div key={sentence.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                                <button
                                  onClick={() => handlePlayAudio(sentence.audio)}
                                  className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  </svg>
                                </button>
                                <p className="flex-1 text-gray-800">{sentence.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // عرض درس القراءة
  if (readingLesson) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
            <div className="flex items-start gap-6">
              {readingLesson.image && (
                <img
                  src={readingLesson.image}
                  alt={readingLesson.levelTitle}
                  className="w-24 h-24 rounded-xl object-cover shadow-lg ring-4 ring-white ring-opacity-30"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  {readingLesson.levelKey && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white text-green-600">
                      {readingLesson.levelKey}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-3">{readingLesson.levelTitle}</h1>
                <p className="text-green-100 text-lg">{readingLesson.levelDescription}</p>
              </div>
            </div>
          </div>

          {/* Stories Grid */}
          {readingLesson.lessons && readingLesson.lessons.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {readingLesson.lessons.map((story, idx) => (
                <div key={story.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-bold text-green-600">{idx + 1}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{story.description}</p>
                    <button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg">
                      ابدأ القراءة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // عرض درس الكتابة
  if (writingLesson) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white bg-opacity-20">
                    Writing
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-3">{writingLesson.title}</h1>
                <p className="text-orange-100 text-lg">{writingLesson.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // لو مفيش درس موجود  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">الدرس غير موجود</h2>
        <p className="text-gray-600">لم يتم العثور على درس بهذا الرابط</p>
      </div>
    </div>
  );
};