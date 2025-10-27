import logoImage from "/assets/images/sna ddd.png";
import homeIcon from "/assets/images/icons/fbe0c187341c280e161f76fb4cbda1d7.svg";
import readingIcon from "/assets/images/icons/234635.png";
import listeningIcon from "/assets/images/icons/headphones-listening.svg";
import pronunciationIcon from "/assets/images/icons/3b4928101472fce4e9edac920c1b3817.svg";
import writingIcon from "/assets/images/icons/4659027.png";
import loginIcon from "/assets/images/icons/login-image.png";
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
    {
      icon: loginIcon,
      label: "تسجيل الدخول",
      color: "text-yellow-400",
      width: "31px",
      linkTo: "/login",
    },
  ];
  return (
    <>
      {/* Right Sidebar - Hidden on mobile */}
      <aside className="hidden overflow-y-auto bg-white md:block w-64 p-4 sticky top-0 right-0 h-screen bottom border-l-2 border-gray-100">
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
                className={`w-full mb-4 rounded-xl py-2 p-6 flex items-center justify-end gap-5 group transition-all duration-300 ${
                  idx == 0
                    ? "bg-[var(--primary-color)]"
                    : "hover:bg-[var(--primary-color)] "
                }`}
              >
                <span
                  className={`text-black arabic_font transition`}
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
                    ? "bg-[var(--secondary-color)]"
                    : "hover:bg-[var(--secondary-color)] "
                } flex flex-col items-center gap-1 hover:bg-[var(--secondary-color)] p-3 rounded-lg transition`}
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
