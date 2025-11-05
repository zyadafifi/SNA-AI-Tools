import React from "react";
import { FaChevronLeft } from "react-icons/fa";

const MobileBackButton = ({ onBackClick }) => {
  return (
    <div className="absolute top-20 left-5 z-[1020]">
      <button
        onClick={onBackClick}
        className="w-11 h-11 rounded-full bg-[#ffc515] border border-white text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-100 -mt-5 "
      >
        <FaChevronLeft size={20} />
      </button>
    </div>
  );
};

export default MobileBackButton;
