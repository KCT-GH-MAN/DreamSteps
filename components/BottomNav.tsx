"use client";

import { BarChart3, House } from "lucide-react";

type ActiveTab = "home" | "stats";

interface BottomNavProps {
  activeTab: ActiveTab;
  surfaceClassName: string;
  homeLabel: string;
  statsLabel: string;
  onChangeTab: (tab: ActiveTab) => void;
}

export default function BottomNav({
  activeTab,
  surfaceClassName,
  homeLabel,
  statsLabel,
  onChangeTab,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className={`fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 z-50 flex w-[calc(100%-32px)] max-w-md md:max-w-xl -translate-x-1/2 items-center justify-between rounded-[28px] border border-white/5 ${surfaceClassName} p-2 backdrop-blur-xl shadow-2xl`}
    >
      <button
        type="button"
        onClick={() => onChangeTab("home")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[20px] py-3.5 sm:py-4 text-sm font-black transition-all duration-300 ${
          activeTab === "home"
            ? "bg-white text-black"
            : "text-gray-500 hover:text-white"
        }`}
      >
        <House size={18} />
        {homeLabel}
      </button>

      <button
        type="button"
        onClick={() => onChangeTab("stats")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[20px] py-3.5 sm:py-4 text-sm font-black transition-all duration-300 ${
          activeTab === "stats"
            ? "bg-white text-black"
            : "text-gray-500 hover:text-white"
        }`}
      >
        <BarChart3 size={18} />
        {statsLabel}
      </button>
    </nav>
  );
}
