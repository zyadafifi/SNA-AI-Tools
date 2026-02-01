import { HomeNav } from "./Components/HomeNav";
import { HomeMain } from "./Components/HomeMain";
import { SideHome } from "./Components/SideHome";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`lg:hidden fixed top-4 ${isSidebarOpen ? "right-4" : "left-4"} z-50 p-3 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-black hover:bg-white/20 transition-all`}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Left Sidebar - Mobile only (opens via burger) */}
        <aside
          className={`
            lg:hidden h-full fixed top-0 left-0 w-80 z-40
            bg-[var(--main-bg-color)] overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <SideHome />
        </aside>

        {/* Main Content */}
        <main className="w-full bg-gradient-to-br overflow-hidden">
          <HomeMain />
        </main>

        {/* Bottom Navigation - Mobile only */}
        <HomeNav />
      </div>
    </div>
  );
}
