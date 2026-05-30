"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Clock3, Flame, History, Sparkles, X } from "lucide-react";

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

function formatHistoryDayNumber(date: string, locale: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(locale, {
    day: "2-digit",
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
  const scheduleText = `${minutes} ${labels.minutes} · ${labels.scheduledFor} ${frequencyLabel}`;
  const summaryItems = [
    {
      icon: CalendarCheck,
      value: totalCompletions,
      label: labels.totalCompletions,
      className: "text-[#7EE2B8]",
    },
    {
      icon: Clock3,
      value: totalMinutes,
      label: labels.totalMinutes,
      className: "text-[#AFC2FF]",
    },
    {
      icon: Flame,
      value: currentStreak,
      label: labels.currentStreak,
      className: "text-orange-300",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center">
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
            className={`relative ${surfaceClassName} max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-[32px] border-t border-white/10 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_80px_rgba(0,0,0,0.45)] sm:px-5 md:max-w-xl`}
          >
            <div className="mb-3 flex justify-center">
              <div className="h-1.5 w-12 rounded-full bg-white/10" />
            </div>

            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                  {labels.historyTitle}
                </p>
                <h2 className="mt-1 break-words text-[24px] font-black leading-tight sm:text-[26px]">
                  {title}
                </h2>
                <p className="mt-2 inline-flex max-w-full items-center rounded-full bg-white/[0.055] px-3 py-1.5 text-[11px] font-black uppercase leading-snug text-gray-400">
                  <span className="truncate">{scheduleText}</span>
                </p>
              </div>

              <button
                type="button"
                aria-label={labels.close}
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10 sm:h-11 sm:w-11"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-[24px] border border-white/5 bg-white/[0.035] p-3">
              <div className="grid grid-cols-3 gap-1.5">
                {summaryItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-white/[0.035] px-2.5 py-3 text-center"
                    >
                      <Icon size={16} className={`mx-auto ${item.className}`} />
                      <p className="mt-2 text-2xl font-black leading-none">
                        {item.value}
                      </p>
                      <p className="mt-1.5 text-[9px] font-black uppercase leading-tight text-gray-500">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2.5 flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.045]">
                  <History size={17} className="text-gray-500" />
                </div>
                <p className="min-w-0 flex-1 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
                  {labels.lastCompleted}
                </p>
                <p className="max-w-[45%] truncate text-sm font-black text-gray-300">
                  {lastCompleted
                    ? formatHistoryDate(lastCompleted.date, locale)
                    : labels.neverCompleted}
                </p>
              </div>
            </div>

            <section className="mt-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  {labels.recentActivity}
                </h3>
                <span className="shrink-0 text-xs font-black text-gray-600">
                  14 {labels.days}
                </span>
              </div>

              <div className="mt-3 rounded-[22px] border border-white/5 bg-white/[0.025] p-2.5">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {historyDays.map((day, index) => (
                    <div
                      key={`history-day-${day.date || index}-${index}`}
                      className="flex min-w-0 flex-col items-center gap-1.5"
                    >
                      <div
                        aria-label={`${formatHistoryDate(day.date, locale)} · ${day.minutes} ${labels.minutes}`}
                        title={`${formatHistoryDate(day.date, locale)} · ${day.minutes} ${labels.minutes}`}
                        className={`h-7 w-full rounded-xl border border-white/5 sm:h-8 ${
                          day.completed
                            ? "bg-[#7EE2B8] shadow-[0_0_22px_rgba(126,226,184,0.18)]"
                            : "bg-white/5"
                        }`}
                      />
                      <span className="text-[10px] font-black text-gray-600">
                        {formatHistoryDayNumber(day.date, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {history.length === 0 && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.045] px-4 py-3.5">
                  <Sparkles size={18} className="mt-0.5 shrink-0 text-[#AFC2FF]" />
                  <p className="text-sm font-bold leading-relaxed text-gray-500">
                    {labels.noHistory}
                  </p>
                </div>
              )}
            </section>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
