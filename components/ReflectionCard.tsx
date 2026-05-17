"use client";

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

export default function ReflectionCard({
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
      } rounded-[32px] border border-white/5 ${surfaceClassName} p-5 sm:p-6`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white/5 p-3 text-[#FFD166]">
          <Icon size={20} />
        </div>

        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-xl sm:text-2xl font-black leading-tight">
            {heading}
          </h3>

          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="mt-4 w-full rounded-2xl bg-white/5 p-4 text-[15px] text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7C9EFF]"
          />

          {secondaryPlaceholder && (
            <input
              value={secondaryValue}
              onChange={(event) =>
                onSecondaryChange?.(event.target.value)
              }
              placeholder={secondaryPlaceholder}
              className="mt-3 w-full rounded-2xl bg-white/5 p-4 text-[15px] text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7C9EFF]"
            />
          )}
        </div>
      </div>
    </section>
  );
}
