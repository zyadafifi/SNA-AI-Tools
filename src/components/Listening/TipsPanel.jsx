import { useState } from "react";
import {
  Headphones,
  PenTool,
  BookOpen,
  RotateCw,
  Target,
  Zap,
  Music4,
  Type,
  Calendar,
  FileEdit,
  TrendingUp,
  Star,
  Lightbulb,
  Smile,
} from "lucide-react";
import dataService from "../../services/dataService";

const TipsPanel = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("listening");

  if (!isOpen) return null;

  const categories = [
    { id: "listening", name: "Listening", icon: Headphones },
    { id: "writing", name: "Writing", icon: PenTool },
    { id: "general", name: "General", icon: BookOpen },
  ];

  // Map emoji icons to lucide-react components
  const iconMap = {
    "🔄": RotateCw,
    "🎯": Target,
    "🎧": Headphones,
    "⚡": Zap,
    "🎵": Music4,
    "✏️": PenTool,
    "🔤": Type,
    "📖": BookOpen,
    "📚": BookOpen,
    "😌": Smile,
    "📅": Calendar,
    "📝": FileEdit,
    "💪": TrendingUp,
    "🌟": Star,
  };

  const currentTips = dataService.getTipsDatabase()[activeCategory] || [];

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-[1050] flex items-center justify-center ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      } transition-all duration-300`}
    >
      <div
        className="absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-[4px]"
        onClick={onClose}
      ></div>
      <div
        className={`relative bg-white rounded-2xl md:rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.15)] max-w-[600px] w-[95%] md:w-[90%] max-h-[85vh] md:max-h-[80vh] overflow-hidden transform transition-all duration-300 ${
          isOpen ? "scale-100 translate-y-0" : "scale-90 translate-y-[20px]"
        }`}
      >
        <div className="flex items-center justify-between p-4 md:p-6 bg-[#FDCB3E] rounded-t-2xl md:rounded-t-3xl">
          <h3 className="text-lg md:text-2xl font-bold m-0 text-[#334155]">
            Learning Tips
          </h3>
          <button
            className="bg-white/50 border-none text-[#334155] text-xl md:text-2xl w-8 h-8 md:w-10 md:h-10 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-white/70 hover:scale-110"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-4 md:p-6 max-h-[calc(85vh-100px)] md:max-h-[calc(80vh-100px)] overflow-y-auto">
          <div className="flex gap-2 md:gap-3 mb-4 md:mb-6 flex-wrap">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-1.5 md:gap-2 rounded-xl px-3 py-2 md:px-4 md:py-3 cursor-pointer transition-all duration-300 font-semibold ${
                    isActive
                      ? "bg-[#FDCB3E] text-[#334155] shadow-md"
                      : "bg-[#f8fafc] border-2 border-[#cbd5e1] text-[#334155] hover:bg-[#FFF7E6] hover:border-[#FDCB3E]/40"
                  }`}
                >
                  <IconComponent
                    className={`w-4 h-4 md:w-5 md:h-5 ${
                      isActive ? "text-[#334155]" : "text-[#334155]"
                    }`}
                  />
                  <span className="text-xs md:text-sm">{category.name}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 md:gap-4">
            {currentTips.map((tip, index) => {
              const TipIcon = iconMap[tip.icon] || Lightbulb;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-200 to-yellow-100 border border-[#d1d5db] rounded-xl p-4 md:p-5 transition-all duration-300 hover:bg-gradient-to-br hover:from-yellow-100 hover:to-yellow-200 hover:border-[#FDCB3E]/30 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-2 md:mb-3">
                    <TipIcon className="w-5 h-5 md:w-6 md:h-6 text-[#334155] flex-shrink-0" />
                    <span className="font-bold text-[#334155] text-base md:text-lg">
                      {tip.title}
                    </span>
                  </div>
                  <div className="text-[#475569] leading-relaxed text-xs md:text-sm pl-8 md:pl-11">
                    {tip.content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipsPanel;
