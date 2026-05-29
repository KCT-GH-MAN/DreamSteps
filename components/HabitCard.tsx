"use client";

import { memo, ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, History, Pencil, Trash2 } from "lucide-react";

interface HabitCardProps {
  habit: {
    id: number;
    title: string;
    minutes: number;
    completed: boolean;
  };
  icon: ReactNode;
  frequencyLabel: string;
  surfaceClassName: string;
  isCelebrating: boolean;
  startFocusLabel: string;
  detailsLabel: string;
  editLabel: string;
  deleteLabel: string;
  completeLabel: string;
  minutesLabel: string;
  onComplete: () => void;
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartFocus: () => void;
}

function HabitCard({
  habit,
  icon,
  frequencyLabel,
  surfaceClassName,
  isCelebrating,
  startFocusLabel,
  detailsLabel,
  editLabel,
  deleteLabel,
  completeLabel,
  minutesLabel,
  onComplete,
  onViewDetails,
  onEdit,
  onDelete,
  onStartFocus,
}: HabitCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`rounded-[26px] border p-4 transition-all duration-500 sm:rounded-[32px] sm:p-5 ${
        isCelebrating
          ? "border-[#7EE2B8]/40 bg-[#7EE2B8]/10 shadow-[0_0_40px_rgba(126,226,184,0.12)] scale-[1.01]"
          : `border-white/5 ${surfaceClassName}`
      }`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 sm:h-14 sm:w-14">
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className={`break-words text-base font-bold leading-snug sm:text-lg ${
                habit.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {habit.title}
            </h4>
            <p className="mt-1 text-[11px] font-bold uppercase leading-snug text-gray-500 sm:text-xs">
              {habit.minutes} {minutesLabel} · {frequencyLabel}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-0.5 sm:gap-2">
          <button
            type="button"
            aria-label={`${detailsLabel} ${habit.title}`}
            onClick={onViewDetails}
            className="p-1.5 text-gray-500 transition-colors hover:text-white sm:p-2"
          >
            <History size={17} />
          </button>

          <button
            type="button"
            aria-label={`${editLabel} ${habit.title}`}
            onClick={onEdit}
            className="p-1.5 text-gray-500 transition-colors hover:text-white sm:p-2"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            aria-label={`${deleteLabel} ${habit.title}`}
            onClick={onDelete}
            className="p-1.5 opacity-50 transition-opacity hover:opacity-100 sm:p-2"
          >
            <Trash2 size={17} />
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            aria-label={`${completeLabel} ${habit.title}`}
            onClick={onComplete}
            className={`p-1.5 transition-all sm:p-2 ${
              habit.completed
                ? "text-[#7EE2B8] scale-110"
                : "text-gray-500 hover:text-white"
            }`}
          >
            <motion.div
              animate={
                isCelebrating
                  ? {
                      scale: [1, 1.35, 1],
                      rotate: [0, -8, 8, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              <Check size={24} strokeWidth={3} />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {!habit.completed && (
        <button
          type="button"
          onClick={onStartFocus}
          className="mt-4 w-full rounded-2xl bg-white/5 py-3 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:bg-white/10"
        >
          {startFocusLabel}
        </button>
      )}
    </motion.div>
  );
}

export default memo(HabitCard);
