import { Link, useParams } from "react-router-dom";
import logoDark from "/assets/images/smallLogoDark.png";

export const ShowLessonsBySlugHeader = () => {
  const { slug } = useParams();
  return (
    <div className="bg-white relative">
      <div className="py-6 px-6 flex items-start justify-between">
        {/* Left side - Lesson title with yellow accent */}
        <div className="flex-1">
          <h2 className="text-[var(--main-text-color)] font-medium text-xl md:text-3xl capitalize mb-2">
            {slug.replaceAll("-", " ")}
          </h2>
          <div className="absolute left-0 inline-block">
            <div className="bg-yellow-400 rounded-tr-full rounded-br-full px-6 py-1">
              <span className="text-white font-medium text-sm md:text-base">
                Lesson tools
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Logo */}
        <Link to={"/"} className="block w-24 md:w-32">
          <img className="w-full" src={logoDark} alt="SNA Academy logo" />
        </Link>
      </div>
    </div>
  );
};
