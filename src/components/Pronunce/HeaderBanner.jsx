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
    const currentLesson = getCurrentLesson();
    navigate(`/pronounce/topics/${currentLesson}`);
  };

  return (
    <div className="header-banner">
      <div className="header-banner-content">
        {/* Left Section - Title and CTA */}
        <div className="header-left">
          <div className="header-title">
            <h1 className="header-main-title">Test Your</h1>
            <h1 className="header-sub-title">Pronunciation</h1>
          </div>

          <button className="header-cta-button" onClick={handleTryNow}>
            <span className="cta-text">Try Now</span>
            <IoIosArrowForward className="cta-arrow" />
          </button>
        </div>

        {/* Right Section - Panda Mascot */}
        <div className="header-right">
          <div className="panda-mascot">
            <div className="panda-body">
              <div className="panda-head">
                <div className="panda-ears"></div>
                <div className="panda-face">
                  <div className="panda-eyes">
                    <div className="panda-eye left-eye"></div>
                    <div className="panda-eye right-eye"></div>
                  </div>
                  <div className="panda-sunglasses">
                    <div className="sunglass-lens left-lens"></div>
                    <div className="sunglass-bridge"></div>
                    <div className="sunglass-lens right-lens"></div>
                  </div>
                  <div className="panda-nose"></div>
                  <div className="panda-mouth"></div>
                </div>
              </div>
            </div>

            <div className="daily-challenge-sign">
              <div className="sign-stick left-stick"></div>
              <div className="sign-board">
                <div className="sign-text">Daily</div>
                <div className="sign-text">Challenge</div>
              </div>
              <div className="sign-stick right-stick"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBanner;