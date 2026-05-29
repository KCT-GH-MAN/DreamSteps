"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Clock3, Flame, History, X } from "lucide-react";

type HabitHistoryEntry = {
  date: string;
  minutes: number;
  completedAt: string;
};

type HabitHistoryDay = {
  date: string;
  completed: boolean;
  minutes: number;
};

interface HabitDetailSheetProps {
  open: boolean;
  title: string;
  frequencyLabel: string;
  minutes: number;
  surfaceClassName: string;
  history: HabitHistoryEntry[];
  historyDays: HabitHistoryDay[];
  currentStreak: number;
  labels: {
    historyTitle: string;
    scheduledFor: string;
    totalCompletions: string;
    totalMinutes: string;
    currentStreak: string;
    recentActivity: string;
    lastCompleted: string;
    neverCompleted: string;
    noHistory: string;
    minutes: string;
    days: string;
    close: string;
  };
  locale: string;
  onClose: () => void;
}

function formatHistoryDate(date: string, locale: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function HabitDetailSheet({
  open,
  title,
  frequencyLabel,
  minutes,
  surfaceClassName,
  history,
  historyDays,
  currentStreak,
  labels,
  locale,
  onClose,
}: HabitDetailSheetProps) {
  const totalCompletions = history.length;
  const totalMinutes = history.reduce((sum, entry) => sum + entry.minutes, 0);
  const lastCompleted = history.at(-1);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[115] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${labels.historyTitle} ${title}`}
            initial={{ y: "100%", scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 24,
            }}
            className={`relative ${surfaceClassName} max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[42px] border-t border-white/10 px-5 pb-10 pt-4 shadow-[0_-20px_80px_rgba(0,0,0,0.45)] md:max-w-xl`}
          >
            <div className="mb-5 flex justify-center">
              <div className="h-1.5 w-14 rounded-full bg-white/10" />
            </div>

            <div className="mb-7 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                  {labels.historyTitle}
                </p>
                <h2 className="mt-1 break-words text-2xl font-black">{title}</h2>
                <p className="mt-2 text-sm font-bold text-gray-500">
                  {minutes} {labels.minutes} · {labels.scheduledFor} {frequencyLabel}
                </p>
              </div>

              <button
                type="button"
                aria-label={labels.close}
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/5 px-4 py-4">
                <CalendarCheck size={18} className="text-[#7EE2B8]" />
                <p className="mt-3 text-xl font-black">{totalCompletions}</p>
                <p className="mt-1 text-[11px] font-bold uppercase text-gray-500">
                  {labels.totalCompletions}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 px-4 py-4">
                <Clock3 size={18} className="text-[#AFC2FF]" />
                <p className="mt-3 text-xl font-black">{totalMinutes}</p>
                <p className="mt-1 text-[11px] font-bold uppercase text-gray-500">
                  {labels.totalMinutes}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 px-4 py-4">
                <Flame size={18} className="text-orange-300" />
                <p className="mt-3 text-xl font-black">{currentStreak}</p>
                <p className="mt-1 text-[11px] font-bold uppercase text-gray-500">
                  {labels.currentStreak}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
              <div className="flex items-center gap-3">
                <History size={18} className="text-gray-500" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                    {labels.lastCompleted}
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-300">
                    {lastCompleted
                      ? formatHistoryDate(lastCompleted.date, locale)
                      : labels.neverCompleted}
                  </p>
                </div>
              </div>
            </div>

            <section className="mt-7">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                {labels.recentActivity}
              </h3>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {historyDays.map((day, index) => (
                  <div key={`history-day-${day.date || index}-${index}`} className="flex flex-col items-center gap-2">
                    <div
                      title={`${formatHistoryDate(day.date, locale)} · ${day.minutes} ${labels.minutes}`}
                      className={`h-9 w-9 rounded-2xl border border-white/5 ${
                        day.completed
                          ? "bg-[#7EE2B8] shadow-[0_0_22px_rgba(126,226,184,0.18)]"
                          : "bg-white/5"
                      }`}
                    />
                    <span className="text-[10px] font-bold text-gray-600">
                      {formatHistoryDate(day.date, locale)}
                    </span>
                  </div>
                ))}
              </div>

              {history.length === 0 && (
                <p className="mt-5 rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold leading-relaxed text-gray-500">
                  {labels.noHistory}
                </p>
              )}
            </section>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
