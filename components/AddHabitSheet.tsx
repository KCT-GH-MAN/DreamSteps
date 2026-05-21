"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ComponentType } from "react";

type HabitFrequency = "daily" | "weekly" | "monthly";

interface AddHabitSheetProps<IconName extends string> {
  open: boolean;
  surfaceClassName: string;
  iconMap: Record<IconName, ComponentType<{ size?: number; className?: string }>>;
  weekDays: { value: number; label: string }[];
  monthDays: number[];
  newTitle: string;
  newMinutes: string;
  newIcon: IconName;
  newFrequency: HabitFrequency;
  newReminderTime: string;
  newDaysOfWeek: number[];
  newDaysOfMonth: number[];
  labels: {
    create: string;
    newHabit: string;
    titlePlaceholder: string;
    minutesPlaceholder: string;
    frequencyDaily: string;
    frequencyWeekly: string;
    frequencyMonthly: string;
    reminderTime: string;
    chooseWeekDays: string;
    chooseMonthDays: string;
    createHabit: string;
    closeForm: string;
  };
  onClose: () => void;
  onChangeTitle: (value: string) => void;
  onChangeMinutes: (value: string) => void;
  onChangeIcon: (value: IconName) => void;
  onChangeFrequency: (value: HabitFrequency) => void;
  onChangeReminderTime: (value: string) => void;
  onToggleWeekDay: (day: number) => void;
  onToggleMonthDay: (day: number) => void;
  onCreate: () => void;
}

export default function AddHabitSheet<IconName extends string>({
  open,
  surfaceClassName,
  iconMap,
  weekDays,
  monthDays,
  newTitle,
  newMinutes,
  newIcon,
  newFrequency,
  newReminderTime,
  newDaysOfWeek,
  newDaysOfMonth,
  labels,
  onClose,
  onChangeTitle,
  onChangeMinutes,
  onChangeIcon,
  onChangeFrequency,
  onChangeReminderTime,
  onToggleWeekDay,
  onToggleMonthDay,
  onCreate,
}: AddHabitSheetProps<IconName>) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 flex items-end justify-center z-[110]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%", scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 24,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) {
                onClose();
              }
            }}
            className={`relative ${surfaceClassName} w-full max-w-md md:max-w-xl max-h-[92dvh] overflow-y-auto px-5 sm:px-6 pb-10 pt-4 rounded-t-[42px] border-t border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,0.45)]`}
          >
            <div className="mb-5 flex justify-center">
              <div className="h-1.5 w-14 rounded-full bg-white/10" />
            </div>

            <div className="flex items-center justify-between mb-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                  {labels.create}
                </p>
                <h2 className="mt-1 text-2xl font-black">{labels.newHabit}</h2>
              </div>

              <button
                type="button"
                aria-label={labels.closeForm}
                onClick={onClose}
                className="h-11 w-11 bg-white/5 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <input
              className="w-full h-14 px-5 bg-white/5 rounded-2xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#7C9EFF] text-[15px]"
              placeholder={labels.titlePlaceholder}
              value={newTitle}
              onChange={(event) => onChangeTitle(event.target.value)}
            />

            <input
              type="number"
              min={1}
              className="w-full h-14 px-5 bg-white/5 rounded-2xl mb-7 focus:outline-none focus:ring-2 focus:ring-[#7C9EFF] text-[15px]"
              placeholder={labels.minutesPlaceholder}
              value={newMinutes}
              onChange={(event) => onChangeMinutes(event.target.value)}
            />

            <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-1">
              {[
                { value: "daily", label: labels.frequencyDaily },
                { value: "weekly", label: labels.frequencyWeekly },
                { value: "monthly", label: labels.frequencyMonthly },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onChangeFrequency(item.value as HabitFrequency)}
                  className={`rounded-xl px-3 py-3 text-xs font-black uppercase transition-all ${
                    newFrequency === item.value
                      ? "bg-[#7C9EFF] text-white"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {newFrequency === "weekly" && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  {labels.chooseWeekDays}
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => onToggleWeekDay(day.value)}
                      className={`rounded-xl py-3 text-xs font-black transition-all ${
                        newDaysOfWeek.includes(day.value)
                          ? "bg-[#7C9EFF] text-white"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {newFrequency === "monthly" && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  {labels.chooseMonthDays}
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => onToggleMonthDay(day)}
                      className={`rounded-xl py-2 text-xs font-black transition-all ${
                        newDaysOfMonth.includes(day)
                          ? "bg-[#7C9EFF] text-white"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                {labels.reminderTime}
              </p>

              <input
                type="time"
                value={newReminderTime}
                onChange={(event) => onChangeReminderTime(event.target.value)}
                className="w-full h-14 px-5 bg-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C9EFF] text-[15px]"
              />
            </div>

            <div className="grid grid-cols-6 gap-3 mb-8">
              {(Object.keys(iconMap) as IconName[]).map((key) => {
                const Icon = iconMap[key] as ComponentType<{ size?: number; className?: string }>;

                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={`Chọn icon ${key}`}
                    onClick={() => onChangeIcon(key)}
                    className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                      newIcon === key
                        ? "bg-[#7C9EFF] text-white"
                        : "bg-white/5 text-gray-500"
                    }`}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onCreate}
              className="w-full bg-[#7C9EFF] py-4 rounded-[20px] font-black text-base tracking-wide hover:brightness-110 transition-all shadow-[0_10px_30px_rgba(124,158,255,0.3)] active:scale-[0.99]"
            >
              {labels.createHabit}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
