import logoImage from "/assets/images/sna ddd.png";
import homeIcon from "/assets/images/icons/white-home.svg";
import readingIcon from "/assets/images/icons/uuu.png";
import listeningIcon from "/assets/images/icons/u.png";
import pronunciationIcon from "/assets/images/icons/uu.png";
import writingIcon from "/assets/images/icons/uuuu.png";
import { Link } from "react-router-dom";

export const HomeNav = () => {
  const navItems = [
    {
      icon: homeIcon,
      label: "‏تعلَّم",
      color: "text-red-400",
      width: "31px",
      linkTo: "/",
    },
    {
      icon: listeningIcon,
      label: "الاستماع",
      color: "text-yellow-400",
      width: "31px",
      linkTo: "/listening/home",
    },
    {
      icon: pronunciationIcon,
      label: "النطق",
      color: "text-yellow-400",
      width: "31px",
      linkTo: "/pronounce/home",
    },
    {
      icon: readingIcon,
      label: "القراءة",
      color: "text-yellow-400",
      width: "31px",
      linkTo: "/reading",
    },
    {
      icon: writingIcon,
      label: "الكتابة",
      color: "text-yellow-400",
      width: "31px",
      linkTo: "/writing/home",
    },
  ];
  return (
    <>
      {/* Right Sidebar - Hidden on mobile */}
      <aside className="hidden overflow-y-auto md:block w-60  sticky top-0 right-0 h-screen bottom">
        <div className="flex justify-center">
          <Link to="/" className="w-36 my-5 block">
            <img className="w-full" src={logoImage} alt="logo" />
          </Link>
        </div>
        <div className="overflow-hidden backdrop-blur">
          <div>
            {navItems.map((item, idx) => (
              <Link
                to={item.linkTo}
                key={idx}
                className={`w-full mb-3 rounded-l-full py-3 p-6 flex items-center justify-center gap-5 group transition-all duration-300 border border-r-0 border-gray-400 shadow-md hover:shadow-sm hover:border-transparent ${
                  idx == 0
                    ? "bg-[var(--primary-color)] border-transparent"
                    : "hover:bg-[var(--primary-color)] "
                }`}
              >
                <span
                  className={`text-lg text-black/70 arabic_font transition`}
                >
                  {item.label}
                </span>
                <div style={{ width: item.width }}>
                  <img className="w-full" src={item.icon} alt="nav icon" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
      {/* Bottom Navigation - Mobile Only */}
      <nav
        style={{ boxShadow: "0px 0px 12px 0px #0000008f" }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-30"
      >
        <div className="flex items-center justify-between p-2">
          {navItems.map((item, idx) => {
            return (
              <Link
                to={item.linkTo}
                key={idx}
                className={`${
                  idx == 0
                    ? "bg-[var(--primary-color)]"
                    : "hover:bg-[var(--primary-color)]"
                } flex flex-col items-center gap-1 hover:bg-[var(--primary-color)] p-3 rounded-lg transition`}
              >
                <div style={{ width: item.width }}>
                  <img className="w-full" src={item.icon} alt="nav icon" />
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
