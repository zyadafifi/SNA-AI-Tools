import { useEffect, useState } from "react";
import { readingData } from "../../config/readingData/readingData";
import { Loading } from "../../components/Loading";
import { Error } from "../../components/Error";
import { useParams } from "react-router-dom";
import { ShowLessonsBySlugHeader } from "./Components/ShowLessonsBySlugHeader";
import { ShowLessonsBySlugListening } from "./Components/ShowLessonsBySlugListening";
import { ShowLessonsBySlugPronounce } from "./Components/ShowLessonsBySlugPronounce";
import { ShowLessonsBySlugReading } from "./Components/ShowLessonsBySlugReading";
import { ShowLessonsBySlugWriting } from "./Components/ShowLessonsBySlugWriting";

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

  const pronounceLesson = data.pronounce?.lessons?.find(
    (lesson) => lesson.slug == slug
  );

  const listeningLesson = data.listening?.lessons?.find(
    (lesson) => lesson.slug == slug
  );

  const writingLesson = data.writing?.topics?.find(
    (lesson) => lesson.slug == slug
  );

  const readingLesson = readingData?.find((lesson) => lesson.slug == slug);

  return (
    <div>
      <div>
        <ShowLessonsBySlugHeader />
      </div>
      <div className="section-padding">
        {listeningLesson && (
          <div className="relative">
            <div className="absolute px-7 py-1 z-10 top-3 left-0 rounded-tr-full rounded-br-full  bg-[var(--primary-color)] ">
              <p className="text-white text-lg">Listening</p>
            </div>
            <ShowLessonsBySlugListening listeningLesson={listeningLesson} />
          </div>
        )}
        {pronounceLesson && (
          <div className="relative">
            <div className="absolute px-7 py-1 z-10 top-3 left-0 rounded-tr-full rounded-br-full  bg-[var(--primary-color)] ">
              <p className="text-white text-lg">Pronunciation</p>
            </div>
            <ShowLessonsBySlugPronounce pronounceLesson={pronounceLesson} />
          </div>
        )}
        {readingLesson && (
          <div className="relative">
            <div className="absolute px-7 py-1 z-10 top-3 left-0 rounded-tr-full rounded-br-full  bg-[var(--primary-color)] ">
              <p className="text-white text-lg">Reading</p>
            </div>
            <ShowLessonsBySlugReading readingLesson={readingLesson} />
          </div>
        )}
        {writingLesson && (
          <div className="relative">
            <div className="absolute px-7 py-1 z-10 top-3 left-0 rounded-tr-full rounded-br-full  bg-[var(--primary-color)] ">
              <p className="text-white text-lg">writing</p>
            </div>
            <ShowLessonsBySlugWriting writingLesson={writingLesson} />
          </div>
        )}
      </div>
    </div>
  );
};
