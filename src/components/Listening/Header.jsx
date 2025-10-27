import { Link } from "react-router-dom";
import logoImage from "/assets/images/sna logo.png";

const Header = ({ onToggleTips }) => {
  return (
    <div className="bg-gradient-to-r from-[#ffc515] to-[#ffd84d] sticky top-0 z-[1020] rounded-b-2xl mt-4 sm:mt-0">
      <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        <div className="flex items-center cursor-pointer">
          <Link to="/" className="flex items-center">
            <img
              src={logoImage}
              alt="SNA Academy Logo"
              className="h-6 w-auto sm:h-8"
            />
          </Link>
        </div>
        <button
          className="bg-[#ffc515] text-gray-800 border border-gray-300 px-3 py-2 rounded-lg font-semibold text-xs cursor-pointer transition-all duration-300 hover:bg-[#ffd84d] hover:border-gray-400"
          onClick={onToggleTips}
        >
          Tips & Help
        </button>
      </div>
    </div>
  );
};

export default Header;
