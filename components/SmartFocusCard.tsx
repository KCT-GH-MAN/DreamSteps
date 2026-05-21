"use client";
import { memo } from "react";


import { motion } from "framer-motion";

type FocusSession = {
  id: string;
  title: string;
  description: string;
  minutes: number;
  accent: string;
};

interface SmartFocusCardProps {
  title: string;
  suggestedLabel: string;
  minutesLabel: string;
  suggestedSession: FocusSession;
  surfaceClassName: string;
  accentTextClassName: string;
  accentBorderClassName: string;
  accentBgClassName: string;
  onStartSuggested: () => void;
}

function SmartFocusCard({
  title,
  suggestedLabel,
  minutesLabel,
  suggestedSession,
  surfaceClassName,
  accentTextClassName,
  accentBorderClassName,
  accentBgClassName,
  onStartSuggested,
}: SmartFocusCardProps) {
  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
          {title}
        </h3>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={onStartSuggested}
        className={`w-full rounded-[30px] border ${accentBorderClassName} ${accentBgClassName} p-5 text-left shadow-[0_0_30px_rgba(124,158,255,0.1)] transition-all duration-700`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={`text-[10px] font-black uppercase tracking-[0.22em] ${accentTextClassName}`}
            >
              {suggestedLabel}
            </p>

            <h3 className="mt-2 text-xl font-black leading-tight">
              {suggestedSession.title}
            </h3>

            <p className="mt-1 max-w-[32ch] text-sm leading-relaxed text-gray-400 text-pretty">
              {suggestedSession.description}
            </p>
          </div>

          <div
            className={`shrink-0 rounded-2xl bg-gradient-to-br ${suggestedSession.accent} px-3.5 py-3 text-sm font-black sm:px-4`}
          >
            {suggestedSession.minutes} {minutesLabel}
          </div>
        </div>
      </motion.button>
    </section>
  );
}

export default memo(SmartFocusCard);
