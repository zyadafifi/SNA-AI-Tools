import { useEffect, useState } from "react";
import { readingData } from "../../config/readingData/readingData";
import { Loading } from "../../components/Loading";
import { Error } from "../../components/Error";
import { useParams } from "react-router-dom";
import { ShowLessonsBySlugHeader } from "./Components/ShowLessonsBySlugHeader";
import { ShowLessonsBySlugListening } from "./Components/ShowLessonsBySlugListening";
import { ShowLessonsBySlugPronounce } from "./Components/ShowLessonsBySlugPronounce";

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

  // console.log(readingLesson, "reading");
  // console.log(writingLesson, "writing");

  return (
    <div>
      <div>
        <ShowLessonsBySlugHeader />
      </div>
      <div className="container container-md mx-auto section-padding">
        <ShowLessonsBySlugListening listeningLesson={listeningLesson} />
        <ShowLessonsBySlugPronounce pronounceLesson={pronounceLesson} />
      </div>
    </div>
  );
};
