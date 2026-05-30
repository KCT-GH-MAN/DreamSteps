"use client";
import { memo } from "react";


import { motion } from "framer-motion";
import { Play } from "lucide-react";

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
  actionLabel: string;
  suggestedSession: FocusSession;
  accentTextClassName: string;
  accentBorderClassName: string;
  accentBgClassName: string;
  onStartSuggested: () => void;
}

function SmartFocusCard({
  title,
  suggestedLabel,
  minutesLabel,
  actionLabel,
  suggestedSession,
  accentTextClassName,
  accentBorderClassName,
  accentBgClassName,
  onStartSuggested,
}: SmartFocusCardProps) {
  return (
    <section className="mt-5 sm:mt-6">
      <div className="mb-2.5 flex items-center justify-between sm:mb-3">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
          {title}
        </h3>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="button"
        aria-label={`${suggestedLabel}: ${suggestedSession.title}`}
        title={`${actionLabel}: ${suggestedSession.title}`}
        onClick={onStartSuggested}
        className={`group w-full rounded-[24px] border ${accentBorderClassName} ${accentBgClassName} p-4 text-left shadow-[0_0_30px_rgba(124,158,255,0.1)] transition-all duration-700 hover:border-white/20 hover:bg-white/[0.08] sm:rounded-[30px] sm:p-5`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={`text-[10px] font-black uppercase tracking-[0.22em] ${accentTextClassName}`}
              >
                {suggestedLabel}
              </p>

              <span
                className={`rounded-full bg-gradient-to-br ${suggestedSession.accent} px-2.5 py-1 text-[10px] font-black text-white/90`}
              >
                {suggestedSession.minutes} {minutesLabel}
              </span>
            </div>

            <h3 className="mt-2 text-base font-black leading-tight sm:text-xl">
              {suggestedSession.title}
            </h3>

            <p className="mt-1 max-w-[32ch] text-xs leading-relaxed text-gray-400 text-pretty sm:text-sm">
              {suggestedSession.description}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black shadow-[0_12px_30px_rgba(255,255,255,0.12)] transition-transform group-hover:scale-105">
            <Play size={19} fill="currentColor" className="ml-0.5" />
          </div>
        </div>
      </motion.button>
    </section>
  );
}

export default memo(SmartFocusCard);
