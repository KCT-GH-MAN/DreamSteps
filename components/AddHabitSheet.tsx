"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
  newDaysOfWeek: number[];
  newDaysOfMonth: number[];
  labels: {
    create: string;
    newHabit: string;
    edit: string;
    editHabit: string;
    titlePlaceholder: string;
    minutesPlaceholder: string;
    frequencyDaily: string;
    frequencyWeekly: string;
    frequencyMonthly: string;
    chooseWeekDays: string;
    chooseMonthDays: string;
    createHabit: string;
    saveHabit: string;
    closeForm: string;
  };
  onClose: () => void;
  onChangeTitle: (value: string) => void;
  onChangeMinutes: (value: string) => void;
  onChangeIcon: (value: IconName) => void;
  onChangeFrequency: (value: HabitFrequency) => void;
  onToggleWeekDay: (day: number) => void;
  onToggleMonthDay: (day: number) => void;
  isEditing: boolean;
  onSubmit: () => void;
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
  newDaysOfWeek,
  newDaysOfMonth,
  labels,
  isEditing,
  onClose,
  onChangeTitle,
  onChangeMinutes,
  onChangeIcon,
  onChangeFrequency,
  onToggleWeekDay,
  onToggleMonthDay,
  onSubmit,
}: AddHabitSheetProps<IconName>) {
  const selectedMonthDay = newDaysOfMonth[0] ?? new Date().getDate();
  const firstMonthDay = monthDays[0] ?? 1;
  const lastMonthDay = monthDays.at(-1) ?? 31;
  const nearbyMonthDays =
    monthDays.length > 0
      ? Array.from({ length: 7 }, (_, index) => {
          const offset = index - 3;
          const day = selectedMonthDay + offset;

          if (day < firstMonthDay) return lastMonthDay - (firstMonthDay - day) + 1;
          if (day > lastMonthDay) return firstMonthDay + (day - lastMonthDay) - 1;
          return day;
        })
      : [];
  const centerMonthDayIndex = Math.floor(nearbyMonthDays.length / 2);
  const changeMonthDay = (direction: -1 | 1) => {
    const nextDay =
      direction === -1
        ? selectedMonthDay <= firstMonthDay
          ? lastMonthDay
          : selectedMonthDay - 1
        : selectedMonthDay >= lastMonthDay
          ? firstMonthDay
          : selectedMonthDay + 1;

    onToggleMonthDay(nextDay);
  };

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
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? labels.editHabit : labels.newHabit}
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
            className={`relative ${surfaceClassName} max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-hidden rounded-t-[34px] border-t border-white/10 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-20px_80px_rgba(0,0,0,0.45)] sm:px-6 md:max-w-xl`}
          >
            <div className="mb-4 flex justify-center">
              <div className="h-1.5 w-14 rounded-full bg-white/10" />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                  {isEditing ? labels.edit : labels.create}
                </p>
                <h2 className="mt-1 text-[22px] font-black leading-tight sm:text-2xl">
                  {isEditing ? labels.editHabit : labels.newHabit}
                </h2>
              </div>

              <button
                type="button"
                aria-label={labels.closeForm}
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <input
              className="mb-3 h-12 w-full rounded-2xl bg-white/5 px-5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7C9EFF] sm:h-[52px]"
              placeholder={labels.titlePlaceholder}
              value={newTitle}
              onChange={(event) => onChangeTitle(event.target.value)}
            />

            <input
              type="number"
              min={1}
              className="mb-4 h-12 w-full rounded-2xl bg-white/5 px-5 text-[15px] [appearance:textfield] focus:outline-none focus:ring-2 focus:ring-[#7C9EFF] sm:h-[52px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder={labels.minutesPlaceholder}
              value={newMinutes}
              onChange={(event) => onChangeMinutes(event.target.value)}
            />

            <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-1">
              {[
                { value: "daily", label: labels.frequencyDaily },
                { value: "weekly", label: labels.frequencyWeekly },
                { value: "monthly", label: labels.frequencyMonthly },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onChangeFrequency(item.value as HabitFrequency)}
                  className={`rounded-xl px-2 py-2.5 text-[11px] font-black uppercase leading-tight transition-all sm:px-3 sm:py-3 sm:text-xs ${
                    newFrequency === item.value
                      ? "bg-[#7C9EFF] text-white"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mb-4 min-h-[134px]">
              {newFrequency === "weekly" && (
                <>
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                    {labels.chooseWeekDays}
                  </p>
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => onToggleWeekDay(day.value)}
                        className={`h-10 rounded-xl text-xs font-black transition-all ${
                          newDaysOfWeek.includes(day.value)
                            ? "bg-[#7C9EFF] text-white"
                            : "bg-white/5 text-gray-500"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {newFrequency === "monthly" && (
                <>
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                    {labels.chooseMonthDays}
                  </p>
                  <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2 sm:grid-cols-[48px_1fr_48px] sm:gap-2.5">
                    <button
                      type="button"
                      aria-label="Previous month day"
                      onClick={() => changeMonthDay(-1)}
                      className="flex h-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.06] text-gray-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="relative flex h-12 items-center justify-center overflow-hidden rounded-2xl border border-[#7C9EFF]/30 bg-[linear-gradient(135deg,rgba(124,158,255,0.22),rgba(255,255,255,0.055))] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_34px_rgba(124,158,255,0.12)]">
                      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={selectedMonthDay}
                          initial={{ opacity: 0, y: 10, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.94 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="relative text-2xl font-black leading-none text-white"
                        >
                          {selectedMonthDay}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    <button
                      type="button"
                      aria-label="Next month day"
                      onClick={() => changeMonthDay(1)}
                      className="flex h-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.06] text-gray-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="mt-2 rounded-2xl border border-white/5 bg-black/10 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="grid grid-cols-7 gap-1.5">
                      {nearbyMonthDays.map((day, index) => {
                        const distance = Math.abs(index - centerMonthDayIndex);
                        const isSelected = selectedMonthDay === day;

                        return (
                          <button
                            key={`${day}-${index}`}
                            type="button"
                            aria-label={`Choose month day ${day}`}
                            onClick={() => onToggleMonthDay(day)}
                            className={`relative flex h-9 items-center justify-center rounded-xl text-sm font-black transition-all ${
                              isSelected
                                ? "bg-[#7C9EFF] text-white shadow-[0_10px_24px_rgba(124,158,255,0.28)]"
                                : distance === 1
                                  ? "bg-white/[0.07] text-gray-300 hover:bg-white/10 hover:text-white"
                                  : "bg-white/[0.04] text-gray-500 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {isSelected && (
                              <motion.span
                                layoutId="selected-month-day"
                                className="absolute inset-0 rounded-xl ring-1 ring-white/25"
                                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                              />
                            )}
                            <span className="relative">{day}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {(Object.keys(iconMap) as IconName[]).map((key) => {
                const Icon = iconMap[key] as ComponentType<{ size?: number; className?: string }>;

                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={`Chọn icon ${key}`}
                    onClick={() => onChangeIcon(key)}
                    className={`flex h-14 items-center justify-center rounded-xl transition-all sm:h-[60px] ${
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
              onClick={onSubmit}
              className="mt-5 w-full rounded-[20px] bg-[#7C9EFF] py-4 text-base font-black tracking-wide shadow-[0_10px_30px_rgba(124,158,255,0.3)] transition-all hover:brightness-110 active:scale-[0.99]"
            >
              {isEditing ? labels.saveHabit : labels.createHabit}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
