"use client";

import { memo, ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Clock3, History, Pencil, Play, Trash2 } from "lucide-react";

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
  const [frequencyText, detailText] = frequencyLabel.split(" · ");
  const actionButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] text-gray-500 transition-colors hover:bg-white/10 hover:text-white sm:h-10 sm:w-10";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`rounded-[22px] border p-3.5 transition-all duration-500 sm:rounded-[28px] sm:p-5 ${
        isCelebrating
          ? "border-[#7EE2B8]/40 bg-[#7EE2B8]/10 shadow-[0_0_40px_rgba(126,226,184,0.12)] scale-[1.01]"
          : `border-white/5 ${surfaceClassName}`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 sm:h-14 sm:w-14">
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className={`break-words text-base font-black leading-tight sm:text-lg ${
                habit.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {habit.title}
            </h4>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-black uppercase leading-snug text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Clock3 size={13} />
                {habit.minutes} {minutesLabel}
              </span>
              <span className="text-gray-700">·</span>
              <span>
                {frequencyText}
              </span>
              {detailText && (
                <>
                  <span className="text-gray-700">·</span>
                  <span>{detailText}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-4 gap-1 sm:gap-1.5">
          <button
            type="button"
            aria-label={`${detailsLabel} ${habit.title}`}
            onClick={onViewDetails}
            className={actionButtonClass}
          >
            <History size={17} />
          </button>

          <button
            type="button"
            aria-label={`${editLabel} ${habit.title}`}
            onClick={onEdit}
            className={actionButtonClass}
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            aria-label={`${deleteLabel} ${habit.title}`}
            onClick={onDelete}
            className={`${actionButtonClass} opacity-60 hover:opacity-100`}
          >
            <Trash2 size={17} />
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            aria-label={`${completeLabel} ${habit.title}`}
            onClick={onComplete}
            className={`${actionButtonClass} transition-all ${
              habit.completed
                ? "text-[#7EE2B8] scale-105"
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
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.055] px-4 text-sm font-black transition-colors hover:bg-white/10 sm:mt-4"
        >
          <Play size={16} fill="currentColor" />
          {startFocusLabel}
        </button>
      )}
    </motion.div>
  );
}

export default memo(HabitCard);
