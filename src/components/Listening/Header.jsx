import { Link } from "react-router-dom";
import logoImage from "/assets/images/sna logo.png";

const Header = ({ onToggleTips }) => {
  return (
    <div className="w-full sticky top-0 z-[1020]">
      {/* Mobile - Old Styling */}
      <div className="md:hidden w-full max-w-md mx-auto px-4">
        <div className="bg-gradient-to-r from-[#ffc515] to-[#ffd84d] rounded-b-2xl rounded-t-2xl py-4 mt-4">
          <div className="flex justify-between items-center px-4 sm:px-6">
            <div className="flex items-center cursor-pointer">
              <Link to="/" className="flex items-center">
                <img
                  src={logoImage}
                  alt="SNA Academy Logo"
                  className="h-6 w-auto"
                />
              </Link>
            </div>
            <button
              className="text-gray-800 border border-gray-800 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm cursor-pointer transition-all duration-300 hover:bg-[#ffd84d] hover:border-gray-400"
              onClick={onToggleTips}
            >
              Tips & Help
            </button>
          </div>
        </div>
      </div>

      {/* Desktop - New Styling */}
      <div className="hidden md:block">
        <div className="px-4 py-4">
          <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
            <div className="bg-gradient-to-r from-[#ffc515] to-[#ffd84d] rounded-b-2xl rounded-t-2xl py-3 sm:py-4 px-4 flex justify-between items-center">
              <div className="flex items-center cursor-pointer">
                <Link to="/" className="flex items-center">
                  <img
                    src={logoImage}
                    alt="SNA Academy Logo"
                    className="h-6 w-auto"
                  />
                </Link>
              </div>
              <button
                className="text-gray-800 border border-gray-800 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm cursor-pointer transition-all duration-300 hover:bg-[#ffd84d] hover:border-gray-400"
                onClick={onToggleTips}
              >
                Tips & Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
