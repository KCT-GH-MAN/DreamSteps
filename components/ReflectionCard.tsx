"use client";
import { memo } from "react";


import { Sunrise, Sunset } from "lucide-react";

interface ReflectionCardProps {
  type: "morning" | "evening";
  title: string;
  heading: string;
  value: string;
  secondaryValue?: string;
  placeholder: string;
  secondaryPlaceholder?: string;
  surfaceClassName: string;
  onChange: (value: string) => void;
  onSecondaryChange?: (value: string) => void;
}

function ReflectionCard({
  type,
  title,
  heading,
  value,
  secondaryValue,
  placeholder,
  secondaryPlaceholder,
  surfaceClassName,
  onChange,
  onSecondaryChange,
}: ReflectionCardProps) {
  const Icon = type === "morning" ? Sunrise : Sunset;

  return (
    <section
      className={`${
        type === "morning" ? "mt-6" : "mt-10"
      } rounded-[28px] border border-white/5 ${surfaceClassName} p-4 sm:rounded-[32px] sm:p-6`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white/5 p-2.5 text-[#FFD166] sm:p-3">
          <Icon size={18} className="sm:size-5" />
        </div>

        <div className="flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 sm:text-xs">
            {title}
          </p>

          <h3 className="mt-2 text-lg font-black leading-tight sm:text-2xl">
            {heading}
          </h3>

          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="mt-4 w-full rounded-2xl bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7C9EFF] sm:p-4 sm:text-[15px]"
          />

          {secondaryPlaceholder && (
            <input
              value={secondaryValue}
              onChange={(event) =>
                onSecondaryChange?.(event.target.value)
              }
              placeholder={secondaryPlaceholder}
              className="mt-3 w-full rounded-2xl bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7C9EFF] sm:p-4 sm:text-[15px]"
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(ReflectionCard);
