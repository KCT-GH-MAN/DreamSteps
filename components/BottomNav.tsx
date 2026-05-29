"use client";
import { memo } from "react";


import { BarChart3, House } from "lucide-react";

type ActiveTab = "home" | "stats";

interface BottomNavProps {
  activeTab: ActiveTab;
  surfaceClassName: string;
  homeLabel: string;
  statsLabel: string;
  onChangeTab: (tab: ActiveTab) => void;
}

function BottomNav({
  activeTab,
  surfaceClassName,
  homeLabel,
  statsLabel,
  onChangeTab,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className={`fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-between rounded-[22px] border border-white/5 ${surfaceClassName} p-1 shadow-2xl backdrop-blur-xl will-change-transform md:max-w-xl sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:w-[calc(100%-32px)] sm:rounded-[28px] sm:p-2`}
    >
      <button
        type="button"
        onClick={() => onChangeTab("home")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[18px] py-2.5 text-sm font-black transition-all duration-300 sm:rounded-[20px] sm:py-4 ${
          activeTab === "home"
            ? "bg-white text-black"
            : "text-gray-500 hover:text-white"
        }`}
      >
        <House size={17} />
        {homeLabel}
      </button>

      <button
        type="button"
        onClick={() => onChangeTab("stats")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[18px] py-2.5 text-sm font-black transition-all duration-300 sm:rounded-[20px] sm:py-4 ${
          activeTab === "stats"
            ? "bg-white text-black"
            : "text-gray-500 hover:text-white"
        }`}
      >
        <BarChart3 size={17} />
        {statsLabel}
      </button>
    </nav>
  );
}

export default memo(BottomNav);
