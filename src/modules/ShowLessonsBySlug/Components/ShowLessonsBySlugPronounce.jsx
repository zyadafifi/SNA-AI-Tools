import { useState } from "react";
import PropTypes from "prop-types";
import { ChevronDown, MessageCircle } from "lucide-react";
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

export const ShowLessonsBySlugPronounce = ({ pronounceLesson }) => {
  const [openTopicId, setOpenTopicId] = useState(null);

  console.log(pronounceLesson);

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

  const toggleTopic = (topicId) => {
    setOpenTopicId(openTopicId === topicId ? null : topicId);
  };

  return (
    <div className="bg-gradient-to-br from-[var(--third-color)] to-[var(--third-color)] p-6 rounded-3xl mb-5 hover:shadow-2xl transition-all duration-300 border border-white/10">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="group relative  rounded-3xl mb-8 transition-all duration-300">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Icon Section */}
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

            {/* Content Section */}
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
          {/* Bottom Shine */}
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {pronounceLesson.topics?.map((topic) => {
            const isOpen = openTopicId === topic.id;

            return (
              <div
                key={topic.id}
                className="bg-[var(--third-color)] rounded-2xl border border-[var(--primary-color)] overflow-hidden transition-all duration-300 hover:border-[var(--secondary-color)] hover:shadow-lg hover:shadow-purple-500/10"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-[var(--third-color)] transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <FontAwesomeIcon
                        className="text-black text-lg"
                        icon={getTopicIcon(topic.icon)}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 line-clamp-1">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                        {topic.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5 text-[var(--primary-color)]" />
                        <span className="text-xs text-gray-400">
                          {topic.conversations?.length || 0} Conversations
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <ChevronDown
                    className={`w-6 h-6 text-[var(--primary-color)] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Accordion Content */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent mb-4" />

                    {topic.conversations?.map((conversation) => {
                      return (
                        <div
                          key={conversation.id}
                          className="bg-slate-700/30 rounded-xl overflow-hidden border border-slate-600/30 hover:border-purple-500/50 transition-all"
                        >
                          {/* Conversation Header */}
                          <div className="p-4 hover:bg-slate-700/50 transition-all">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                {/* Conversation Number */}
                                <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center rounded-lg shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                  <FontAwesomeIcon
                                    className="text-black text-xs"
                                    icon={getTopicIcon(topic.icon)}
                                  />
                                </div>

                                {/* Conversation Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-semibold mb-1 line-clamp-1 text-sm sm:text-base">
                                    {conversation.title}
                                  </h4>
                                  <p className="text-xs text-gray-400">
                                    {conversation.description}
                                  </p>
                                </div>
                              </div>

                              {/* Play Button */}
                              <button
                                className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg relative bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-110`}
                              ></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
