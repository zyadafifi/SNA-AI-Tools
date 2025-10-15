import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";

const MobileBackButton = ({ onBackClick }) => {
  return (
    <div className="mobile-back-button">
      <button className="back-btn" onClick={onBackClick}>
        <FaArrowLeftLong size={20} />
      </button>
    </div>
  );
};

export default MobileBackButton;


