import { Link, useParams } from "react-router-dom";
import logoDark from "/assets/images/logoDark.png";

export const ShowLessonsBySlugHeader = () => {
  const { slug } = useParams();
  return (
    <div className="py-4 px-6 bg-[var(--primary-color)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[var(--main-text-color)] font-medium text-lg md:text-3xl capitalize">
          {slug.replaceAll("-", " ")}
        </h2>
        <Link to={"/"} className="w-32 md:w-40">
          <img className="w-full" src={logoDark} alt="logo" />
        </Link>
      </div>
    </div>
  );
};
