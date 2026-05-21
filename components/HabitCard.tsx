"use client";

import { memo, ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";

interface HabitCardProps {
  habit: {
    id: number;
    title: string;
    minutes: number;
    completed: boolean;
    reminderTime?: string;
  };
  icon: ReactNode;
  frequencyLabel: string;
  surfaceClassName: string;
  isCelebrating: boolean;
  startFocusLabel: string;
  deleteLabel: string;
  completeLabel: string;
  minutesLabel: string;
  onComplete: () => void;
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
  deleteLabel,
  completeLabel,
  minutesLabel,
  onComplete,
  onDelete,
  onStartFocus,
}: HabitCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`rounded-[32px] border p-5 transition-all duration-500 ${
        isCelebrating
          ? "border-[#7EE2B8]/40 bg-[#7EE2B8]/10 shadow-[0_0_40px_rgba(126,226,184,0.12)] scale-[1.01]"
          : `border-white/5 ${surfaceClassName}`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-4 items-center">
          <div className="h-14 w-14 flex items-center justify-center bg-white/5 rounded-2xl">
            {icon}
          </div>

          <div className="min-w-0">
            <h4
              className={`break-words text-lg font-bold ${
                habit.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {habit.title}
            </h4>
            <p className="text-xs text-gray-500 uppercase leading-relaxed">
              {habit.minutes} {minutesLabel} · {frequencyLabel}

              {habit.reminderTime && (
                <span className="block mt-1 text-[#AFC2FF]">
                  ⏰ {habit.reminderTime}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label={`${deleteLabel} ${habit.title}`}
            onClick={onDelete}
            className="opacity-50 hover:opacity-100 p-2 transition-opacity"
          >
            <Trash2 size={18} />
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            aria-label={`${completeLabel} ${habit.title}`}
            onClick={onComplete}
            className={`p-2 transition-all ${
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
              <Check size={26} strokeWidth={3} />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {!habit.completed && (
        <button
          type="button"
          onClick={onStartFocus}
          className="mt-4 w-full bg-white/5 hover:bg-white/10 transition-colors py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"
        >
          {startFocusLabel}
        </button>
      )}
    </motion.div>
  );
}

export default memo(HabitCard);
