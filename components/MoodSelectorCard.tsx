"use client";

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

export default function MoodSelectorCard({
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
      className={`mt-5 rounded-[32px] border border-white/5 ${surfaceClassName} p-5 sm:p-6`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white/5 p-3 text-[#7EE2B8]">
          <Smile size={20} />
        </div>

        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-xl sm:text-2xl font-black leading-tight">
            {heading}
          </h3>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const active = selectedMood === mood.value;

              return (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => onSelectMood(mood.value)}
                  className={`flex items-center gap-2 rounded-2xl border p-3 text-left text-xs font-black transition-all ${
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
