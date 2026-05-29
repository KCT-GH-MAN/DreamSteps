"use client";
import { memo } from "react";


import type { LucideIcon } from "lucide-react";
import { Smile } from "lucide-react";

type MoodState = "focused" | "tired" | "distracted" | "motivated";

interface MoodSelectorCardProps {
  title: string;
  heading: string;
  moods: {
    value: MoodState;
    label: string;
    icon: LucideIcon;
  }[];
  selectedMood: MoodState | null;
  message: string;
  surfaceClassName: string;
  onSelectMood: (mood: MoodState) => void;
}

function MoodSelectorCard({
  title,
  heading,
  moods,
  selectedMood,
  message,
  surfaceClassName,
  onSelectMood,
}: MoodSelectorCardProps) {
  return (
    <section
      className={`mt-5 rounded-[28px] border border-white/5 ${surfaceClassName} p-4 sm:rounded-[32px] sm:p-6`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white/5 p-2.5 text-[#7EE2B8] sm:p-3">
          <Smile size={18} className="sm:size-5" />
        </div>

        <div className="flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 sm:text-xs">
            {title}
          </p>

          <h3 className="mt-2 text-lg font-black leading-tight sm:text-2xl">
            {heading}
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const active = selectedMood === mood.value;

              return (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => onSelectMood(mood.value)}
                  className={`flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-xs font-black leading-snug transition-all ${
                    active
                      ? "border-[#7C9EFF] bg-[#7C9EFF]/20 text-white"
                      : "border-white/5 bg-white/5 text-gray-500 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {mood.label}
                </button>
              );
            })}
          </div>

          <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-gray-400 text-pretty">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}

export default memo(MoodSelectorCard);
