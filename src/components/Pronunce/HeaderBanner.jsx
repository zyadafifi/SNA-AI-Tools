import { useNavigate } from "react-router-dom";
import { useProgress } from "../../contexts/ProgressContext";
import { IoIosArrowForward } from "react-icons/io";
import "./HeaderBanner.css";

const HeaderBanner = ({ lessons = [] }) => {
  const navigate = useNavigate();
  const { getLessonProgress, isLessonCompleted, isLessonUnlocked } =
    useProgress();

  // Find the current lesson (first unlocked and not completed lesson)
  const getCurrentLesson = () => {
    if (lessons.length === 0) return 1;

    // Find the first lesson that is unlocked and not completed
    const currentLesson = lessons.find(
      (lesson) => !lesson.locked && !lesson.completed
    );

    return currentLesson ? currentLesson.lessonNumber : 1;
  };

  const handleTryNow = () => {
    window.location.href = "https://sna-english-test.vercel.app/";
  };

  return (
    <div className="header-banner">
      <div className="header-banner-content">
        {/* Left Section - Title and CTA */}
        <div className="header-left">
          <div className="header-title">
            <h1 className="header-main-title">Test Your</h1>
            <h1 className="header-main-title">English Level</h1>
          </div>

          <button className="header-cta-button" onClick={handleTryNow}>
            <span className="cta-text">Try Now</span>
            <IoIosArrowForward className="cta-arrow" />
          </button>
        </div>

        {/* Right Section - Logo Image */}
        <div className="header-right">
          <img
            src="/assets/images/logo.png"
            alt="SNA Logo"
            className="header-logo"
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderBanner;
