import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ChevronDown, MessageCircle, Lock } from "lucide-react";
import { MdVolumeUp } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faHandshake,
  faComments,
  faGraduationCap,
  faCoffee,
  faConciergeBell,
  faMugHot,
  faList,
  faCogs,
  faBlender,
  faHeart,
  faBookOpen,
  faShoppingBag,
  faSearch,
  faStore,
  faCalendarCheck,
  faUtensils,
  faWineGlass,
  faBus,
  faTaxi,
  faPlane,
  faUserMd,
  faPills,
  faAmbulance,
  faBriefcase,
  faUsers,
  faChartLine,
  faFilm,
  faDumbbell,
  faMusic,
} from "@fortawesome/free-solid-svg-icons";
import { IoPlay } from "react-icons/io5";
import { Link } from "react-router-dom";

export const ShowLessonsBySlugPronounce = ({ pronounceLesson }) => {
  const [openTopicId, setOpenTopicId] = useState(null);
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    // Load progress data from localStorage
    const storageKey = `pronunciationMasterProgress`;
    const data = localStorage.getItem(storageKey);
    if (data) {
      setProgressData(JSON.parse(data));
    }
  }, [pronounceLesson.lessonNumber]);

  const getTopicIcon = (iconName) => {
    const iconMap = {
      "fas fa-handshake": faHandshake,
      "fas fa-comments": faComments,
      "fas fa-graduation-cap": faGraduationCap,
      "fas fa-coffee": faCoffee,
      "fas fa-concierge-bell": faConciergeBell,
      "fas fa-mug-hot": faMugHot,
      "fas fa-list": faList,
      "fas fa-cogs": faCogs,
      "fas fa-blender": faBlender,
      "fas fa-heart": faHeart,
      "fas fa-book-open": faBookOpen,
      "fas fa-shopping-bag": faShoppingBag,
      "fas fa-search": faSearch,
      "fas fa-store": faStore,
      "fas fa-calendar-check": faCalendarCheck,
      "fas fa-utensils": faUtensils,
      "fas fa-wine-glass": faWineGlass,
      "fas fa-bus": faBus,
      "fas fa-taxi": faTaxi,
      "fas fa-plane": faPlane,
      "fas fa-user-md": faUserMd,
      "fas fa-pills": faPills,
      "fas fa-ambulance": faAmbulance,
      "fas fa-briefcase": faBriefcase,
      "fas fa-users": faUsers,
      "fas fa-chart-line": faChartLine,
      "fas fa-film": faFilm,
      "fas fa-dumbbell": faDumbbell,
      "fas fa-music": faMusic,
    };

    return iconMap[iconName] || faBook;
  };

  const toggleTopic = (topicId, isLocked) => {
    if (isLocked) return;
    setOpenTopicId(openTopicId === topicId ? null : topicId);
  };

  // Check if a topic is locked
  const isTopicLocked = (topicId, topicIndex) => {
    if (!progressData) return topicIndex > 0; // Lock all except first if no data
    
    // First topic is always unlocked
    if (topicIndex === 0) return false;

    // Check if previous topic is completed
    const previousTopicId = pronounceLesson.topics[topicIndex - 1]?.id;
    const previousTopicProgress = progressData.topics?.[previousTopicId];
    
    return !previousTopicProgress?.completed;
  };

  // Check if a conversation is locked
  const isConversationLocked = (conversationId, conversationIndex, topicId) => {
    if (!progressData) return conversationIndex > 0;
    
    // First conversation in each topic is always unlocked
    if (conversationIndex === 0) return false;

    // Check if previous conversation is completed
    const topic = pronounceLesson.topics.find(t => t.id === topicId);
    const previousConversationId = topic?.conversations[conversationIndex - 1]?.id;
    const previousConversationProgress = progressData.conversations?.[previousConversationId];
    
    return !previousConversationProgress?.completed;
  };

  return (
    <div className="bg-gradient-to-br from-[var(--third-color)] to-[var(--third-color)] p-6 rounded-3xl mb-5 hover:shadow-2xl transition-all duration-300 border border-white/10">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="group relative rounded-3xl mb-8 transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <MdVolumeUp className="text-3xl text-[var(--main-text-color)]" />
              </div>
              <div className="absolute -bottom-2 -left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
                <p className="text-xs font-bold text-[var(--main-text-color)]">
                  Pronunciation
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1.5 h-8 bg-[var(--primary-color)] rounded-full" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white group-hover:text-[var(--primary-color)] transition-colors">
                    {pronounceLesson.title}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {pronounceLesson.topics?.map((topic, topicIndex) => {
            const isOpen = openTopicId === topic.id;
            const isLocked = isTopicLocked(topic.id, topicIndex);
            const topicProgress = progressData?.topics?.[topic.id];

            return (
              <div
                key={topic.id}
                className={`bg-[var(--third-color)] rounded-2xl border border-[var(--primary-color)] overflow-hidden transition-all duration-300 ${
                  isLocked
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:border-[var(--secondary-color)] hover:shadow-lg hover:shadow-purple-500/10"
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleTopic(topic.id, isLocked)}
                  disabled={isLocked}
                  className={`w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left transition-colors ${
                    isLocked ? "cursor-not-allowed" : "hover:bg-[var(--third-color)]"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center rounded-2xl shadow-lg relative ${
                      !isLocked && "group-hover:scale-110 group-hover:rotate-3"
                    } transition-all duration-300`}>
                      {isLocked ? (
                        <Lock className="text-black text-lg" />
                      ) : (
                        <FontAwesomeIcon
                          className="text-black text-lg"
                          icon={getTopicIcon(topic.icon)}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-1">
                          {topic.title}
                        </h3>
                        {topicProgress?.completed && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                        {isLocked ? "🔒 Complete previous topic to unlock" : topic.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5 text-[var(--primary-color)]" />
                        <span className="text-xs text-gray-400">
                          {topic.conversations?.length || 0} Conversations
                        </span>
                        {topicProgress?.progress > 0 && (
                          <span className="text-xs text-[var(--primary-color)] ml-2">
                            {topicProgress.progress}% Progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  {!isLocked && (
                    <ChevronDown
                      className={`w-6 h-6 text-[var(--primary-color)] shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Accordion Content */}
                {!isLocked && (
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3">
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent mb-4" />

                      {topic.conversations?.map((conversation, conversationIndex) => {
                        const conversationLocked = isConversationLocked(
                          conversation.id,
                          conversationIndex,
                          topic.id
                        );
                        const conversationProgress = progressData?.conversations?.[conversation.id];

                        const ConversationWrapper = conversationLocked ? "div" : Link;
                        const wrapperProps = conversationLocked
                          ? {}
                          : {
                              to: `/pronounce/desktop/${pronounceLesson.lessonNumber}/${topic.id}/${conversation.id}`,
                            };

                        return (
                          <ConversationWrapper
                            {...wrapperProps}
                            key={conversation.id}
                            className={`bg-slate block rounded-xl overflow-hidden border border-[var(--primary-color)] transition-all ${
                              conversationLocked
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:shadow-md"
                            }`}
                          >
                            <div className={`p-4 transition-all ${
                              !conversationLocked && "hover:bg-[var(--third-color)]"
                            }`}>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                  {/* Conversation Icon */}
                                  <div className={`shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center rounded-lg shadow-lg relative ${
                                    !conversationLocked && "group-hover:scale-110 group-hover:rotate-3"
                                  } transition-all duration-300`}>
                                    {conversationLocked ? (
                                      <Lock className="text-black text-xs" />
                                    ) : (
                                      <FontAwesomeIcon
                                        className="text-black text-xs"
                                        icon={getTopicIcon(topic.icon)}
                                      />
                                    )}
                                  </div>

                                  {/* Conversation Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-white font-semibold line-clamp-1 text-sm sm:text-base">
                                        {conversation.title}
                                      </h4>
                                      {conversationProgress?.completed && (
                                        <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                      {conversationLocked
                                        ? "🔒 Complete previous conversation"
                                        : conversation.description}
                                    </p>
                                    {conversationProgress?.score && (
                                      <p className="text-xs text-[var(--primary-color)] mt-1">
                                        Score: {conversationProgress.score}%
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Play Button */}
                                {!conversationLocked && (
                                  <button className="relative w-8 h-8 bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)] flex items-center justify-center rounded-full shadow-lg group-hover:shadow-[var(--primary-color)]/50 group-hover:scale-110 transition-all duration-300">
                                    <IoPlay className="text-xl text-[var(--main-text-color)] ml-1 group-hover:scale-125 transition-transform" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </ConversationWrapper>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ShowLessonsBySlugPronounce.propTypes = {
  pronounceLesson: PropTypes.object,
};