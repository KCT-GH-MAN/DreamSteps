"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from "framer-motion";
import FocusModal from "@/components/FocusModal";
import BottomNav from "@/components/BottomNav";
import HabitCard from "@/components/HabitCard";
import SmartFocusCard from "@/components/SmartFocusCard";
import AddHabitSheet from "@/components/AddHabitSheet";
import ReflectionCard from "@/components/ReflectionCard";
import MoodSelectorCard from "@/components/MoodSelectorCard";
import { useLanguage } from "@/lib/useLanguage";
import type { Language } from "@/lib/translations";
import {
  Flame,
  BookOpen,
  Dumbbell,
  Brain,
  Plus,
  Trash2,
  Coffee,
  Music,
  GlassWater,
  Moon,
  Sun,
  Wind,
  Code,
  Laptop,
  Timer,
  Heart,
  Gamepad2,
  Brush,
  Target,
  Star,
  CalendarDays,
  BarChart3,
  Sparkles,
  Zap,
  BatteryLow,
  CloudLightning,
  Trophy,
} from "lucide-react";

const ICON_MAP = {
  BookOpen,
  Dumbbell,
  Brain,
  Coffee,
  Music,
  GlassWater,
  Moon,
  Sun,
  Wind,
  Code,
  Laptop,
  Flame,
  Timer,
  Heart,
  Gamepad2,
  Brush,
  Target,
  Star,
};

type IconName = keyof typeof ICON_MAP;
type HabitFrequency = "daily" | "weekly" | "monthly";
type ActiveTab = "home" | "stats";
type MoodState = "focused" | "tired" | "distracted" | "motivated";
type ThemeType = "midnight" | "forest" | "sunset" | "arctic";

const THEMES: Record<
  ThemeType,
  {
    background: string;
    surface: string;
    surfaceSoft: string;
    primaryGradient: string;
    primaryShadow: string;
    accentText: string;
    accentBorder: string;
    accentBg: string;
  }
> = {
  midnight: {
    background: "bg-[#0F1115]",
    surface: "bg-[#171A21]",
    surfaceSoft: "bg-white/5",
    primaryGradient: "from-[#7C9EFF] to-[#9B8CFF]",
    primaryShadow: "shadow-[0_20px_60px_rgba(124,158,255,0.25)]",
    accentText: "text-[#AFC2FF]",
    accentBorder: "border-[#7C9EFF]/30",
    accentBg: "bg-[#7C9EFF]/10",
  },
  forest: {
    background: "bg-[#0E1512]",
    surface: "bg-[#16211C]",
    surfaceSoft: "bg-emerald-400/10",
    primaryGradient: "from-[#34D399] to-[#22C55E]",
    primaryShadow: "shadow-[0_20px_60px_rgba(52,211,153,0.22)]",
    accentText: "text-emerald-200",
    accentBorder: "border-emerald-300/25",
    accentBg: "bg-emerald-400/10",
  },
  sunset: {
    background: "bg-[#17110F]",
    surface: "bg-[#241815]",
    surfaceSoft: "bg-orange-400/10",
    primaryGradient: "from-[#FB923C] to-[#F472B6]",
    primaryShadow: "shadow-[0_20px_60px_rgba(251,146,60,0.24)]",
    accentText: "text-orange-200",
    accentBorder: "border-orange-300/25",
    accentBg: "bg-orange-400/10",
  },
  arctic: {
    background: "bg-[#0D141A]",
    surface: "bg-[#172129]",
    surfaceSoft: "bg-cyan-300/10",
    primaryGradient: "from-[#67E8F9] to-[#60A5FA]",
    primaryShadow: "shadow-[0_20px_60px_rgba(103,232,249,0.22)]",
    accentText: "text-cyan-100",
    accentBorder: "border-cyan-200/25",
    accentBg: "bg-cyan-300/10",
  },
};
type FocusSessionType = {
  id: string;
  title: string;
  description: string;
  minutes: number;
  accent: string;
};

function getFocusSessions(t: ReturnType<typeof useLanguage>["t"]): FocusSessionType[] {
  return [
    {
      id: "tiny",
      title: t.focusSessions.tinyTitle,
      description: t.focusSessions.tinyDescription,
      minutes: 2,
      accent: "from-sky-500/30 to-blue-500/10",
    },
    {
      id: "recovery",
      title: t.focusSessions.recoveryTitle,
      description: t.focusSessions.recoveryDescription,
      minutes: 5,
      accent: "from-emerald-500/30 to-green-500/10",
    },
    {
      id: "gentle",
      title: t.focusSessions.gentleTitle,
      description: t.focusSessions.gentleDescription,
      minutes: 10,
      accent: "from-violet-500/30 to-fuchsia-500/10",
    },
    {
      id: "deep",
      title: t.focusSessions.deepTitle,
      description: t.focusSessions.deepDescription,
      minutes: 25,
      accent: "from-blue-600/30 to-indigo-500/10",
    },
    {
      id: "momentum",
      title: t.focusSessions.momentumTitle,
      description: t.focusSessions.momentumDescription,
      minutes: 45,
      accent: "from-orange-500/30 to-pink-500/10",
    },
  ];
}


type Habit = {
  id: number;
  title: string;
  iconName: IconName;
  minutes: number;
  completed: boolean;
  frequency: HabitFrequency;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
};

type DailyAnalytics = {
  date: string;
  focusedMinutes: number;
  completedHabits: number;
};

type AnalyticsData = {
  days: DailyAnalytics[];
};

type TimelineEntry = {
  id: number;
  type: "habit" | "focus" | "reflection";
  title: string;
  subtitle?: string;
  createdAt: string;
};


type DailyReflection = {
  date: string;
  intent: string;
  win: string;
  blocker: string;
  mood: MoodState | null;
};

function getWeekDays(language: Language) {
  return language === "vi"
    ? [
        { value: 1, label: "T2" },
        { value: 2, label: "T3" },
        { value: 3, label: "T4" },
        { value: 4, label: "T5" },
        { value: 5, label: "T6" },
        { value: 6, label: "T7" },
        { value: 0, label: "CN" },
      ]
    : [
        { value: 1, label: "Mon" },
        { value: 2, label: "Tue" },
        { value: 3, label: "Wed" },
        { value: 4, label: "Thu" },
        { value: 5, label: "Fri" },
        { value: 6, label: "Sat" },
        { value: 0, label: "Sun" },
      ];
}

function getMoods(t: ReturnType<typeof useLanguage>["t"]) {
  return [
    { value: "focused", label: t.moods.focused, icon: Target },
    { value: "tired", label: t.moods.tired, icon: BatteryLow },
    { value: "distracted", label: t.moods.distracted, icon: CloudLightning },
    { value: "motivated", label: t.moods.motivated, icon: Flame },
  ];
}

const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

function getDefaultHabits(t: ReturnType<typeof useLanguage>["t"]): Habit[] {
  return [
    {
      id: 1,
      title: t.habits.defaultRead,
      iconName: "BookOpen",
      minutes: 10,
      completed: false,
      frequency: "daily",
    },
    {
      id: 2,
      title: t.habits.defaultWorkout,
      iconName: "Dumbbell",
      minutes: 30,
      completed: false,
      frequency: "weekly",
      daysOfWeek: [1, 3, 5],
    },
  ];
}

const STORAGE_KEYS = {
  habits: "ds-habits",
  momentum: "ds-momentum",
  streak: "ds-streak",
  lastCompleted: "ds-last-completed",
  lastActive: "ds-last-active",
  analytics: "ds-analytics",
  reflections: "ds-reflections",
  timeline: "ds-timeline",
};

function safeParseHabits(value: string | null): Habit[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((habit) => {
        return (
          habit &&
          typeof habit.id === "number" &&
          typeof habit.title === "string" &&
          typeof habit.iconName === "string" &&
          typeof habit.minutes === "number" &&
          typeof habit.completed === "boolean"
        );
      })
      .map((habit) => {
        const frequency: HabitFrequency =
          habit.frequency === "weekly" || habit.frequency === "monthly"
            ? habit.frequency
            : "daily";

        return {
          id: habit.id,
          title: habit.title,
          iconName: habit.iconName in ICON_MAP ? habit.iconName : "Star",
          minutes: Math.max(1, habit.minutes),
          completed: habit.completed,
          frequency,
          daysOfWeek: Array.isArray(habit.daysOfWeek) ? habit.daysOfWeek : [],
          daysOfMonth: Array.isArray(habit.daysOfMonth) ? habit.daysOfMonth : [],
        };
      });
  } catch {
    return [];
  }
}

function getGreetingByHour(
  hour: number,
  greeting: {
    morning: string;
    noon: string;
    noon1: string;
    evening: string;
  }
) {
  if (hour < 11) return greeting.morning;
  if (hour < 14) return greeting.noon;
  if (hour < 18) return greeting.noon1;
  return greeting.evening;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseStoredDate(value: string | null) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function getStartOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function getDayDiff(fromValue: string | null, toValue: string) {
  const fromDate = parseStoredDate(fromValue);
  const toDate = parseStoredDate(toValue);

  if (!fromDate || !toDate) return 0;

  return Math.round(
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getTodayStr() {
  return getLocalDateKey();
}

function isHabitDueToday(habit: Habit, date = new Date()) {
  if (habit.frequency === "daily") return true;

  if (habit.frequency === "weekly") {
    const today = date.getDay();
    return habit.daysOfWeek?.includes(today) ?? false;
  }

  if (habit.frequency === "monthly") {
    const today = date.getDate();
    return habit.daysOfMonth?.includes(today) ?? false;
  }

  return true;
}

function getFrequencyLabel(
  habit: Habit,
  t: ReturnType<typeof useLanguage>["t"],
  weekDays: { value: number; label: string }[] = []
) {
  if (habit.frequency === "daily") return t.habits.daily;

  if (habit.frequency === "weekly") {
    const selected = weekDays
      .filter((day) => habit.daysOfWeek?.includes(day.value))
      .map((day) => day.label)
      .join(", ");

    return selected
      ? `${t.habits.weekly} · ${selected}`
      : t.habits.weekly;
  }

  if (habit.frequency === "monthly") {
    const selected = habit.daysOfMonth?.join(", ");

    return selected
      ? `${t.habits.monthly} · ${selected}`
      : t.habits.monthly;
  }

  return t.habits.daily;
}

function hasCompletedToday(todayStr: string) {
  return localStorage.getItem(STORAGE_KEYS.lastCompleted) === todayStr;
}

function markCompletedToday(todayStr: string) {
  localStorage.setItem(STORAGE_KEYS.lastCompleted, todayStr);
}

function getAnalytics(): AnalyticsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.analytics);
    if (!raw) return { days: [] };

    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.days)) {
      return { days: [] };
    }

    return {
      days: parsed.days
        .filter((day: DailyAnalytics) => {
          return (
            day &&
            typeof day.date === "string" &&
            typeof day.focusedMinutes === "number" &&
            typeof day.completedHabits === "number"
          );
        })
        .slice(-90),
    };
  } catch {
    return { days: [] };
  }
}

function saveAnalytics(data: AnalyticsData) {
  localStorage.setItem(
    STORAGE_KEYS.analytics,
    JSON.stringify({
      days: data.days.slice(-90),
    })
  );
}

function trackDailyProgress(minutes: number) {
  const today = getTodayStr();
  const analytics = getAnalytics();

  const existingDay = analytics.days.find((day) => day.date === today);

  if (existingDay) {
    existingDay.focusedMinutes += minutes;
    existingDay.completedHabits += 1;
  } else {
    analytics.days.push({
      date: today,
      focusedMinutes: minutes,
      completedHabits: 1,
    });
  }

  saveAnalytics(analytics);
}

function trackFocusOnly(minutes: number) {
  const today = getTodayStr();
  const analytics = getAnalytics();

  const existingDay = analytics.days.find((day) => day.date === today);

  if (existingDay) {
    existingDay.focusedMinutes += minutes;
  } else {
    analytics.days.push({
      date: today,
      focusedMinutes: minutes,
      completedHabits: 0,
    });
  }

  saveAnalytics(analytics);
}

function getLast7DaysAnalytics(analytics: AnalyticsData) {
  const today = getStartOfDay(new Date());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    const dateStr = getLocalDateKey(date);
    const existing = analytics.days.find((day) => day.date === dateStr);

    return {
      date: dateStr,
      focusedMinutes: existing?.focusedMinutes ?? 0,
      completedHabits: existing?.completedHabits ?? 0,
    };
  });
}

function getWeeklyStats(analytics: AnalyticsData) {
  const last7Days = getLast7DaysAnalytics(analytics);

  const totalMinutes = last7Days.reduce(
    (sum, day) => sum + day.focusedMinutes,
    0
  );

  const totalHabits = last7Days.reduce(
    (sum, day) => sum + day.completedHabits,
    0
  );

  const activeDays = last7Days.filter(
    (day) => day.focusedMinutes > 0 || day.completedHabits > 0
  ).length;

  return {
    totalMinutes,
    totalHabits,
    activeDays,
  };
}

function getHeatmapIntensity(minutes: number) {
  if (minutes === 0) return "bg-white/5";
  if (minutes < 20) return "bg-[#7C9EFF]/30";
  if (minutes < 45) return "bg-[#7C9EFF]/60";
  return "bg-[#7C9EFF]";
}

function getRecoveryMessage(
  lastCompletedDate: string | null,
  t: ReturnType<typeof useLanguage>["t"]
) {
  if (!lastCompletedDate) return null;

  const diffDays = getDayDiff(lastCompletedDate, getTodayStr());

  if (diffDays >= 2) {
    return t.habits.recoveryMessage;
  }

  return null;
}

function getEmptyStateMessage(
  t: ReturnType<typeof useLanguage>["t"]
) {
  const hour = new Date().getHours();

  if (hour < 11) {
    return t.habits.emptyMorning;
  }

  if (hour < 18) {
    return t.habits.emptyAfternoon;
  }

  return t.habits.emptyEvening;
}


function getTimeline(): TimelineEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.timeline);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.slice(-50).reverse();
  } catch {
    return [];
  }
}

function addTimelineEntry(entry: Omit<TimelineEntry, "id" | "createdAt">) {
  const current = getTimeline().reverse();

  current.push({
    ...entry,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  });

  localStorage.setItem(
    STORAGE_KEYS.timeline,
    JSON.stringify(current.slice(-50))
  );
}


function createEmptyReflection(): DailyReflection {
  return {
    date: getTodayStr(),
    intent: "",
    win: "",
    blocker: "",
    mood: null,
  };
}

function getReflections(): DailyReflection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.reflections);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item: DailyReflection) => {
        return (
          item &&
          typeof item.date === "string" &&
          typeof item.intent === "string" &&
          typeof item.win === "string" &&
          typeof item.blocker === "string" &&
          (item.mood === null ||
            item.mood === "focused" ||
            item.mood === "tired" ||
            item.mood === "distracted" ||
            item.mood === "motivated")
        );
      })
      .slice(-30);
  } catch {
    return [];
  }
}

function saveReflection(reflection: DailyReflection) {
  const reflections = getReflections();
  const existingIndex = reflections.findIndex((item) => item.date === reflection.date);

  if (existingIndex >= 0) {
    reflections[existingIndex] = reflection;
  } else {
    reflections.push(reflection);
  }

  localStorage.setItem(STORAGE_KEYS.reflections, JSON.stringify(reflections.slice(-30)));
}

function getTodayReflection() {
  const today = getTodayStr();
  const existing = getReflections().find((item) => item.date === today);

  return existing ?? createEmptyReflection();
}

function getMoodMessage(
  mood: MoodState | null,
  t: ReturnType<typeof useLanguage>["t"]
) {
  if (mood === "focused") return t.moods.focusedMessage;
  if (mood === "tired") return t.moods.tiredMessage;
  if (mood === "distracted") return t.moods.distractedMessage;
  if (mood === "motivated") return t.moods.motivatedMessage;
  return t.moods.defaultMessage;
}

function getSuggestedFocusByMood(
  mood: MoodState | null,
  t: ReturnType<typeof useLanguage>["t"]
) {
  if (mood === "tired") {
    return {
      minutes: 5,
      title: t.focusSessions.recoveryTitle,
      label: t.focusSessions.recoveryLabel,
    };
  }

  if (mood === "distracted") {
    return {
      minutes: 2,
      title: t.focusSessions.tinyTitle,
      label: t.focusSessions.tinyLabel,
    };
  }

  if (mood === "focused") {
    return {
      minutes: 25,
      title: t.focusSessions.deepTitle,
      label: t.focusSessions.deepLabel,
    };
  }

  if (mood === "motivated") {
    return {
      minutes: 45,
      title: t.focusSessions.momentumTitle,
      label: t.focusSessions.momentumLabel,
    };
  }

  return {
    minutes: 10,
    title: t.focusSessions.gentleTitle,
    label: t.focusSessions.gentleLabel,
  };
}


function getFocusSessionById(id: string, sessions: FocusSessionType[]) {
  return sessions.find((session) => session.id === id) ?? sessions[2];
}

function getSessionTypeByMood(mood: MoodState | null) {
  if (mood === "tired") return "recovery";
  if (mood === "distracted") return "tiny";
  if (mood === "focused") return "deep";
  if (mood === "motivated") return "momentum";
  return "gentle";
}

function getThemeByMood(mood: MoodState | null): ThemeType {
  if (mood === "tired") return "forest";
  if (mood === "focused") return "arctic";
  if (mood === "motivated") return "sunset";
  return "midnight";
}

function shouldShowEveningReflection() {
  return new Date().getHours() >= 18;
}



function getTimelineDisplayEntry(
  entry: TimelineEntry,
  t: ReturnType<typeof useLanguage>["t"]
) {
  let title = entry.title;
  let subtitle = entry.subtitle;

  if (title.startsWith("Completed ")) {
    title = `${t.habits.completedHabit} ${title.replace("Completed ", "")}`;
  }

  if (subtitle?.endsWith(" minutes")) {
    subtitle = subtitle.replace(" minutes", ` ${t.habits.completedSubtitle}`);
  }

  if (title === "Updated evening reflection") {
    title = t.reflection.updatedEveningReflection;
  }

  if (title === "Updated morning intent") {
    title = t.reflection.updatedMorningIntent;
  }

  return {
    ...entry,
    title,
    subtitle,
  };
}

function AnimatedFlame() {
  return (
    <motion.div
      animate={{
        scale: [1, 1.03, 1],
        y: [0, -1.5, 0],
      }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative flex items-center justify-center"
    >
      <motion.div
        animate={{
          opacity: [0.25, 0.45, 0.25],
          scale: [0.9, 1.15, 0.9],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-14 w-14 rounded-full bg-orange-400/30 blur-2xl"
      />

      <svg
        width="42"
        height="52"
        viewBox="0 0 42 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_18px_rgba(251,146,60,0.55)]"
      >
        <path
          d="M21 2C25 10 36 15 36 28C36 41 29 50 21 50C13 50 6 41 6 28C6 19 11 13 16 8C18 14 20 17 21 2Z"
          fill="url(#outerFlame)"
        />

        <path
          d="M21 15C25 20 29 24 29 31C29 39 25 45 21 45C17 45 13 39 13 31C13 25 16 21 19 18C20 21 20 23 21 15Z"
          fill="url(#innerFlame)"
        />

        <defs>
          <linearGradient id="outerFlame" x1="21" y1="2" x2="21" y2="50">
            <stop stopColor="#FFF7CC" />
            <stop offset="0.35" stopColor="#FDBA74" />
            <stop offset="0.7" stopColor="#F97316" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>

          <linearGradient id="innerFlame" x1="21" y1="15" x2="21" y2="45">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.45" stopColor="#FDE68A" />
            <stop offset="1" stopColor="#FB923C" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}


function AnimatedCounter({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.45,
    });

    const unsubscribe = rounded.on("change", (latest) => {
      setDisplay(Number(latest));
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [motionValue, rounded, value]);

  return <>{display}</>;
}


export default function HomePage() {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [greeting, setGreeting] = useState("Chào buổi tối 🌙");
  const [openFocus, setOpenFocus] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [selectedHabitTitle, setSelectedHabitTitle] = useState("Focus Session");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("gentle");
  const [showWelcome, setShowWelcome] = useState(false);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [momentum, setMomentum] = useState(0);
  const [celebratingHabitId, setCelebratingHabitId] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({ days: [] });
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [dailyReflection, setDailyReflection] =
    useState<DailyReflection>(createEmptyReflection());
  const completedHabitIdsRef = useRef<Set<number>>(new Set());

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMinutes, setNewMinutes] = useState("10");
  const [newIcon, setNewIcon] = useState<IconName>("BookOpen");
  const [newFrequency, setNewFrequency] = useState<HabitFrequency>("daily");
  const [newDaysOfWeek, setNewDaysOfWeek] = useState<number[]>([new Date().getDay()]);
  const [newDaysOfMonth, setNewDaysOfMonth] = useState<number[]>([new Date().getDate()]);

  const todayHabits = habits.filter((habit) => isHabitDueToday(habit));
  const futureHabits = habits.filter((habit) => !isHabitDueToday(habit));
  const weeklyHeatmap = getLast7DaysAnalytics(analytics);
  const weeklyStats = getWeeklyStats(analytics);
  const weekDays = getWeekDays(language);
  const recoveryMessage = getRecoveryMessage(lastCompletedDate, t);
  const hasCompletedAnyToday = todayHabits.some((habit) => habit.completed);
  const focusSessions = getFocusSessions(t);
  const moods = getMoods(t);
  const suggestedSessionType = getSessionTypeByMood(dailyReflection.mood);
  const suggestedSession = getFocusSessionById(suggestedSessionType, focusSessions);
  const allTodayHabitsDone =
    todayHabits.length > 0 && todayHabits.every((habit) => habit.completed);
  const showEveningReflection = shouldShowEveningReflection();
  const latestReflections = getReflections().slice(-5).reverse();
  const todayTimeline = timeline.filter((entry) => {
    return getLocalDateKey(new Date(entry.createdAt)) === getTodayStr();
  });
  const adaptiveTheme = getThemeByMood(dailyReflection.mood);
  const currentTheme = THEMES[adaptiveTheme];

  const refreshAppData = useCallback(() => {
    const now = new Date();
    const todayStr = getTodayStr();

    completedHabitIdsRef.current.clear();
    setGreeting(getGreetingByHour(now.getHours(), t.greeting));

    const savedHabits = safeParseHabits(localStorage.getItem(STORAGE_KEYS.habits));
    const savedMomentum = Number(localStorage.getItem(STORAGE_KEYS.momentum) || 0);
    const savedStreak = Number(localStorage.getItem(STORAGE_KEYS.streak) || 0);
    const savedLastCompleted = localStorage.getItem(STORAGE_KEYS.lastCompleted);
    const savedLastActive = localStorage.getItem(STORAGE_KEYS.lastActive);

    if (savedLastActive !== todayStr) {
      const resetHabits =
        savedHabits.length > 0
          ? savedHabits.map((habit) => ({
              ...habit,
              completed: false,
            }))
          : getDefaultHabits(t);

      setHabits(resetHabits);
      localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(resetHabits));
      localStorage.setItem(STORAGE_KEYS.lastActive, todayStr);
    } else {
      setHabits(savedHabits.length > 0 ? savedHabits : getDefaultHabits(t));
    }

    if (savedLastCompleted) {
      const diffDays = getDayDiff(savedLastCompleted, todayStr);

      // Cho phép nghỉ 1 ngày, nhưng bỏ 2 ngày thì streak sẽ mất khi mở app vào ngày thứ 3.
      if (diffDays >= 3) {
        setStreak(0);
        localStorage.setItem(STORAGE_KEYS.streak, "0");
      } else {
        setStreak(savedStreak);
      }
    } else {
      setStreak(savedStreak);
    }

    setMomentum(Number.isFinite(savedMomentum) ? savedMomentum : 0);
    setLastCompletedDate(savedLastCompleted);
    setAnalytics(getAnalytics());
    setTimeline(getTimeline());
    setDailyReflection(getTodayReflection());
    setIsLoaded(true);
  }, [language, t.greeting]);

  useEffect(() => {
    const hasSeenWelcome =
      typeof window !== "undefined"
        ? localStorage.getItem("ds-welcome-seen")
        : "true";

    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshAppData();

    const handleVisibilityChange = () => {
      if (!document.hidden) refreshAppData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshAppData]);


  useEffect(() => {
    if (!mounted || !isLoaded) return;

    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
    localStorage.setItem(STORAGE_KEYS.momentum, momentum.toString());
  }, [habits, momentum, mounted, isLoaded]);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("ds-theme", adaptiveTheme);
  }, [adaptiveTheme, mounted]);


  useEffect(() => {
    if (!mounted || !isLoaded) return;

    const resetIfDateChanged = () => {
      const todayStr = getTodayStr();
      const savedLastActive = localStorage.getItem(STORAGE_KEYS.lastActive);

      if (savedLastActive === todayStr) return;

      setHabits((currentHabits) => {
        const resetHabits =
          currentHabits.length > 0
            ? currentHabits.map((habit) => ({
                ...habit,
                completed: false,
              }))
            : getDefaultHabits(t);

        localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(resetHabits));
        localStorage.setItem(STORAGE_KEYS.lastActive, todayStr);

        return resetHabits;
      });

      const savedLastCompleted = localStorage.getItem(STORAGE_KEYS.lastCompleted);
      const savedStreak = Number(localStorage.getItem(STORAGE_KEYS.streak) || 0);
      const diffDays = getDayDiff(savedLastCompleted, todayStr);

      if (savedLastCompleted && diffDays >= 3) {
        setStreak(0);
        localStorage.setItem(STORAGE_KEYS.streak, "0");
      } else {
        setStreak(savedStreak);
      }
    };

    resetIfDateChanged();

    const intervalId = window.setInterval(resetIfDateChanged, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [mounted, isLoaded, t]);

  const updateReflection = (updates: Partial<DailyReflection>) => {
    setDailyReflection((prev) => {
      const next = {
        ...prev,
        ...updates,
        date: getTodayStr(),
      };

      saveReflection(next);

      

      return next;
    });
  };

  const toggleWeekDay = (day: number) => {
    setNewDaysOfWeek((prev) => {
      if (prev.includes(day)) return prev.filter((item) => item !== day);
      return [...prev, day];
    });
  };

  const toggleMonthDay = (day: number) => {
    setNewDaysOfMonth((prev) => {
      if (prev.includes(day)) return prev.filter((item) => item !== day);
      return [...prev, day];
    });
  };

  const addHabit = () => {
    const title = newTitle.trim();
    if (!title) return;

    const minutes = Math.max(1, parseInt(newMinutes, 10) || 10);

    const fallbackWeekDay = new Date().getDay();
    const fallbackMonthDay = new Date().getDate();

    const habit: Habit = {
      id: Date.now(),
      title,
      iconName: newIcon,
      minutes,
      completed: false,
      frequency: newFrequency,
      daysOfWeek:
        newFrequency === "weekly"
          ? newDaysOfWeek.length > 0
            ? newDaysOfWeek
            : [fallbackWeekDay]
          : [],
      daysOfMonth:
        newFrequency === "monthly"
          ? newDaysOfMonth.length > 0
            ? newDaysOfMonth
            : [fallbackMonthDay]
          : [],
    };

    setHabits((prev) => [...prev, habit]);
    setNewTitle("");
    setNewMinutes("10");
    setNewIcon("BookOpen");
    setNewFrequency("daily");
    setNewDaysOfWeek([fallbackWeekDay]);
    setNewDaysOfMonth([fallbackMonthDay]);
    setIsAdding(false);
  };

  const deleteHabit = (habitId: number) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
  };

  const completeHabit = (habit: Habit) => {
    if (habit.completed || completedHabitIdsRef.current.has(habit.id)) return;

    const currentHabit = habits.find((item) => item.id === habit.id);

    if (!currentHabit || currentHabit.completed) return;

    completedHabitIdsRef.current.add(currentHabit.id);

    const todayStr = getTodayStr();

    const updatedHabits = habits.map((item) =>
      item.id === currentHabit.id ? { ...item, completed: true } : item
    );

    const updatedDueToday = updatedHabits.filter((item) => isHabitDueToday(item));
    const allDoneToday =
      updatedDueToday.length > 0 && updatedDueToday.every((item) => item.completed);

    const shouldIncreaseStreak = allDoneToday && !hasCompletedToday(todayStr);

    setHabits(updatedHabits);

    if (shouldIncreaseStreak) {
      const savedStreak = Number(localStorage.getItem(STORAGE_KEYS.streak) || 0);
      const newStreak = savedStreak + 1;

      setStreak(newStreak);
      setLastCompletedDate(todayStr);

      localStorage.setItem(STORAGE_KEYS.streak, newStreak.toString());
      markCompletedToday(todayStr);
    }

    setCelebratingHabitId(currentHabit.id);

    setTimeout(() => {
      setCelebratingHabitId(null);
    }, 700);

    setMomentum((prev) => prev + currentHabit.minutes);

    addTimelineEntry({
      type: "habit",
      title: `${t.habits.completedHabit} ${currentHabit.title}`,
      subtitle: `${currentHabit.minutes} ${t.habits.completedSubtitle}`,
    });

    setTimeline(getTimeline());

    trackDailyProgress(currentHabit.minutes);
    setAnalytics(getAnalytics());
  };

  const handleFocusComplete = (minutes: number) => {
    trackFocusOnly(minutes);
    setAnalytics(getAnalytics());
    setTimeline(getTimeline());
  };

  const renderIcon = (iconName: IconName, completed: boolean) => {
    const IconComp = ICON_MAP[iconName] || Star;
    const iconClass = completed ? "text-[#7EE2B8]" : "text-gray-400";

    return <IconComp size={26} className={iconClass} />;
  };

  if (!mounted) return null;

  return (
    <main className={`min-h-screen ${currentTheme.background} text-white flex justify-center px-4 py-5 sm:p-5 font-sans transition-colors duration-700`}>
      <div className="w-full max-w-md md:max-w-2xl pb-32">
        <header className="flex justify-between items-start pt-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">
              {activeTab === "home" ? greeting : t.progressStats}
            </p>
            <h1 className="text-4xl font-black mt-1">
              {activeTab === "home" ? t.common.appName : t.common.stats}
            </h1>
          </motion.div>

          <div className="flex items-center gap-2">
            <button
  type="button"
  onClick={() => {
    const confirmed = window.confirm(
      language === "vi"
        ? "Xóa toàn bộ dữ liệu DreamSteps?"
        : "Delete all DreamSteps data?"
    );

    if (!confirmed) return;

    Object.keys(localStorage)
      .filter((key) => key.startsWith("ds-"))
      .forEach((key) => localStorage.removeItem(key));

    window.location.reload();
  }}
  className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-red-300 transition-all hover:bg-red-500/15"
>
  RESET
</button>
            <button
              type="button"
              aria-label={t.common.changeLanguage}
              onClick={toggleLanguage}
              className="rounded-2xl border border-white/5 bg-white/5 px-3.5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-gray-300 transition-colors hover:bg-white/10"
            >
              {language === "vi" ? "VI" : "EN"}
            </button>

            {activeTab === "home" && (
              <button
                type="button"
                aria-label={t.header.addHabit}
                onClick={() => setIsAdding(true)}
                className="bg-white/5 p-3.5 rounded-2xl border border-white/5 shadow-lg hover:bg-white/10 transition-colors"
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
              
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
            >
              <div className={`sticky top-0 z-40 -mx-5 mt-4 ${currentTheme.background} px-5 py-4 transition-colors duration-700`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-[35px] bg-gradient-to-br ${currentTheme.primaryGradient} p-8 flex justify-between items-center ${currentTheme.primaryShadow} transition-all duration-700`}
                >
                <div>
                  <h2 className="text-5xl font-black italic tracking-tighter">
                    <AnimatedCounter value={momentum} />
                    <span className="text-lg font-medium ml-2 opacity-80">{t.common.shortMinutes}</span>
                  </h2>

                  <motion.div
                    key={streak}
                    initial={{ scale: 0.92, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="mt-4 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase inline-block shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    🔥 <AnimatedCounter value={streak} /> Day Streak
                  </motion.div>
                </div>

                <div className="relative h-16 w-16 rounded-[22px] bg-white/20 flex items-center justify-center overflow-hidden">
                  <motion.div
                    animate={{
                      opacity: [0.2, 0.45, 0.2],
                      scale: [0.85, 1.25, 0.85],
                    }}
                    transition={{
                      duration: 1.7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-orange-300/30 blur-2xl"
                  />
                  <AnimatedFlame />
                </div>
                </motion.div>
              </div>

              {recoveryMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-[28px] border border-[#7C9EFF]/20 bg-[#7C9EFF]/10 p-5"
                >
                  <p className="text-sm font-bold leading-relaxed text-[#AFC2FF]">
                    {recoveryMessage}
                  </p>
                </motion.div>
              )}

              <ReflectionCard
                type="morning"
                title={t.reflection.morningTitle}
                heading={t.reflection.morningHeading}
                value={dailyReflection.intent}
                placeholder={t.reflection.morningPlaceholder}
                surfaceClassName={currentTheme.surface}
                onChange={(value) => updateReflection({ intent: value })}
              />

              <MoodSelectorCard
                title={t.reflection.currentStateTitle}
                heading={t.reflection.currentStateHeading}
                moods={moods}
                selectedMood={dailyReflection.mood}
                message={getMoodMessage(dailyReflection.mood, t)}
                surfaceClassName={currentTheme.surface}
                onSelectMood={(mood) => updateReflection({ mood })}
              />

              
              <SmartFocusCard
                title={t.focusSessions.smartFocus}
                suggestedLabel={t.focusSessions.suggestedForYou}
                
                
                minutesLabel={t.common.shortMinutes}
                
                suggestedSession={suggestedSession}
                
                surfaceClassName={currentTheme.surface}
                accentTextClassName={currentTheme.accentText}
                accentBorderClassName={currentTheme.accentBorder}
                accentBgClassName={currentTheme.accentBg}
               
                onStartSuggested={() => {
                  setSelectedMinutes(suggestedSession.minutes);
                  setSelectedHabitTitle(suggestedSession.title);
                  setSelectedSessionType(suggestedSession.id);
                  localStorage.setItem("ds-last-session-type", suggestedSession.id);
                  setOpenFocus(true);
                }}
                
              />



              {allTodayHabitsDone && (
                <div className="mt-5 rounded-[28px] border border-[#7EE2B8]/20 bg-[#7EE2B8]/10 p-5">
                  <div className="flex items-center gap-3">
                    <Trophy size={22} className="text-[#7EE2B8]" />
                    <p className="text-sm font-bold leading-relaxed text-[#BDF7DE]">
                      {t.habits.allDone}
                    </p>
                  </div>
                </div>
              )}

              <section className="mt-12">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-black">{t.todayHabits}</h3>
                  <div className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-gray-500">
                    {todayHabits.filter((habit) => habit.completed).length}/{todayHabits.length}
                  </div>
                </div>

                {todayHabits.length === 0 ? (
                  <div className={`rounded-[32px] border border-white/5 ${currentTheme.surface} p-6 text-center`}>
                    <CalendarDays size={28} className="mx-auto text-gray-500" />
                    <p className="mt-3 text-sm font-bold text-gray-400">
                      {t.habits.noHabitsToday}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      {getEmptyStateMessage(t)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {todayHabits.map((habit) => (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          icon={renderIcon(habit.iconName, habit.completed)}
                          frequencyLabel={getFrequencyLabel(habit, t, weekDays)}
                          surfaceClassName={currentTheme.surface}
                          isCelebrating={celebratingHabitId === habit.id}
                          onComplete={() => completeHabit(habit)}
                          onDelete={() => deleteHabit(habit.id)}
                          startFocusLabel={t.habits.startFocus}
                          deleteLabel={t.habits.deleteHabit}
                          completeLabel={t.habits.completeHabit}
                          minutesLabel={t.common.shortMinutes}
                          onStartFocus={() => {
                            setSelectedMinutes(habit.minutes);
                            setSelectedHabitTitle(habit.title);
                            setOpenFocus(true);
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>

              {futureHabits.length > 0 && (
                <section className="mt-10">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-600 mb-4">
                    {t.notToday}
                  </h3>

                  <div className="space-y-3">
                    {futureHabits.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between rounded-[24px] border border-white/5 bg-white/[0.03] px-5 py-4"
                      >
                        <div>
                          <p className="font-bold text-gray-400">{habit.title}</p>
                          <p className="mt-1 text-xs uppercase text-gray-600">
                            {habit.minutes} {t.common.shortMinutes} · {getFrequencyLabel(habit, t, weekDays)}
                          </p>
                        </div>

                        <button
                          type="button"
                          aria-label={`Xoá thói quen ${habit.title}`}
                          onClick={() => deleteHabit(habit.id)}
                          className="p-2 text-gray-600 hover:text-white"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <ReflectionCard
                type="evening"
                title={t.reflection.eveningTitle}
                heading={
                  showEveningReflection
                    ? t.reflection.eveningHeading
                    : t.reflection.eveningLaterHeading
                }
                value={dailyReflection.win}
                secondaryValue={dailyReflection.blocker}
                placeholder={t.reflection.winPlaceholder}
                secondaryPlaceholder={t.reflection.blockerPlaceholder}
                surfaceClassName={currentTheme.surface}
                onChange={(value) => updateReflection({ win: value })}
                onSecondaryChange={(value) =>
                  updateReflection({ blocker: value })
                }
              />
            </motion.div>
          ) : (
            <motion.section
              key="stats"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="mt-10 space-y-5"
            >
              <div className={`rounded-[32px] border border-white/5 ${currentTheme.surface} p-6`}>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                      {t.stats.consistency}
                    </p>
                    <h3 className="mt-1 text-xl font-black">{t.stats.weeklyHeatmap}</h3>
                  </div>

                  <BarChart3 size={22} className="text-gray-600" />
                </div>

                <div className="grid grid-cols-7 gap-3">
                  {weeklyHeatmap.map((day, index) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`h-10 w-10 rounded-2xl border border-white/5 ${getHeatmapIntensity(
                          day.focusedMinutes
                        )}`}
                        title={`${day.focusedMinutes} ${t.common.minutes}`}
                      />

                      <span className="mt-2 text-[10px] font-bold uppercase text-gray-600">
                        {new Date(day.date)
                          .toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", { weekday: "short" })
                          .replace("Th ", "")}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-gray-600">
                  <span>{t.common.low}</span>

                  <div className="flex gap-3 items-start">
                    <div className="h-3 w-3 rounded-full bg-white/5" />
                    <div className="h-3 w-3 rounded-full bg-[#7C9EFF]/30" />
                    <div className="h-3 w-3 rounded-full bg-[#7C9EFF]/60" />
                    <div className="h-3 w-3 rounded-full bg-[#7C9EFF]" />
                  </div>

                  <span>{t.common.high}</span>
                </div>
              </div>

              <div className={`rounded-[32px] border border-white/5 ${currentTheme.surface} p-6`}>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white/5 p-3 text-[#7EE2B8]">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                      {t.stats.reflection}
                    </p>

                    <h3 className="mt-2 text-2xl font-black leading-tight">
                      {t.stats.weekFocusSummary.replace("{minutes}", String(weeklyStats.totalMinutes))}
                    </h3>

                    <p className="mt-4 text-sm leading-relaxed text-gray-400">
                      {weeklyStats.activeDays >= 5
                        ? t.stats.reviewPositive
                        : t.stats.reviewSubtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase text-gray-500">{t.stats.habits}</p>
                    <p className="mt-1 text-xl font-black">{weeklyStats.totalHabits}</p>
                  </div>

                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase text-gray-500">{t.stats.activeDays}</p>
                    <p className="mt-1 text-xl font-black">{weeklyStats.activeDays}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-[32px] border border-white/5 ${currentTheme.surface} p-6`}>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  {t.stats.lifetime}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 px-5 py-4">
                    <p className="text-xs uppercase text-gray-500">{t.stats.totalFocus}</p>
                    <p className="mt-2 text-2xl font-black">{momentum}</p>
                    <p className="text-xs text-gray-600">{t.common.minutes}</p>
                  </div>

                  <div className="rounded-2xl bg-white/5 px-5 py-4">
                    <p className="text-xs uppercase text-gray-500">{t.stats.currentStreak}</p>
                    <p className="mt-2 text-2xl font-black">{streak}</p>
                    <p className="text-xs text-gray-600">{t.common.days}</p>
                  </div>
                </div>
              </div>


              <div className={`rounded-[32px] border border-white/5 ${currentTheme.surface} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                      {t.stats.sessionTimeline}
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      {t.stats.todayJourney}
                    </h3>
                  </div>

                  <Timer size={20} className="text-gray-600" />
                </div>

                {todayTimeline.length === 0 ? (
                  <p className="mt-5 text-sm leading-relaxed text-gray-500">
                    {t.stats.noTimeline}
                  </p>
                ) : (
                  <div className="mt-5 max-h-[250px] space-y-4 overflow-y-auto hide-scrollbar py-2 pl-2 pr-1">
                    {todayTimeline.slice(0, 8).map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex gap-4"
                      >
                        <div className="mt-1 flex flex-col items-center">
  <div
    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ${
      entry.type === "habit"
        ? "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20"
        : entry.type === "focus"
        ? "bg-[#7C9EFF]/10 text-[#AFC2FF] ring-[#7C9EFF]/20"
        : "bg-violet-400/10 text-violet-200 ring-violet-300/20"
    }`}
  >
    <span className="h-2 w-2 rounded-full bg-current" />
  </div>

  {index !== todayTimeline.slice(0, 8).length - 1 && (
    <div className="mt-2 h-full min-h-[110px] w-px bg-white/5" />
  )}
</div>

                        <div className="flex-1 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
                          <p className="text-sm font-bold text-white">
                            {entry.title}
                          </p>

                          {entry.subtitle && (
                            <p className="mt-1 text-sm leading-relaxed text-gray-400">
                              {entry.subtitle}
                            </p>
                          )}

                          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-gray-600">
                            {new Date(entry.createdAt).toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`rounded-[32px] border border-white/5 ${currentTheme.surface} p-6`}>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  {t.stats.recentReflections}
                </p>

                {latestReflections.length === 0 ? (
                  <p className="mt-4 text-sm leading-relaxed text-gray-500">
                    {t.stats.noReflections}
                  </p>
                ) : (
                  <div className="mt-5 max-h-[250px] space-y-4 overflow-y-auto hide-scrollbar py-2 pl-2 pr-1">
                    {latestReflections.map((item, index) => (
  <motion.div
    key={item.date}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className="flex gap-4 items-start"
  >
    <div className="mt-1 flex flex-col items-center">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-400/10 text-orange-200 ring-1 ring-orange-300/20">
        <Flame size={12} fill="currentColor" />
      </div>

      {index !== latestReflections.length - 1 && (
        <div className="mt-2 h-full min-h-[72px] w-px bg-white/5" />
      )}
    </div>

    <div className="flex-1 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
      <p className="text-xs font-black uppercase text-gray-600">
        {new Date(item.date).toLocaleDateString(
          language === "vi" ? "vi-VN" : "en-US",
          {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
          }
        )}
      </p>

      {item.intent && (
        <p className="mt-2 text-sm text-gray-300">
          {language === "vi" ? "Ý định" : "Intent"}: {item.intent}
        </p>
      )}

      {item.win && (
        <p className="mt-1 text-sm text-gray-400">
          {language === "vi" ? "Điểm tốt" : "Win"}: {item.win}
        </p>
      )}

      {item.blocker && (
        <p className="mt-1 text-sm text-gray-500">
          {language === "vi" ? "Lý do trì hoãn" : "Blocker"}: {item.blocker}
        </p>
      )}
    </div>
  </motion.div>
))}
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <BottomNav
        activeTab={activeTab}
        surfaceClassName={currentTheme.surface}
        homeLabel={t.common.home}
        statsLabel={t.common.stats}
        onChangeTab={setActiveTab}
      />

      <AddHabitSheet
        open={isAdding}
        surfaceClassName={currentTheme.surface}
        iconMap={ICON_MAP}
        weekDays={weekDays}
        monthDays={MONTH_DAYS}
        newTitle={newTitle}
        newMinutes={newMinutes}
        newIcon={newIcon}
        newFrequency={newFrequency}
        newDaysOfWeek={newDaysOfWeek}
        newDaysOfMonth={newDaysOfMonth}
        labels={{
          create: t.addHabit.create,
          newHabit: t.addHabit.newHabit,
          titlePlaceholder: t.addHabit.titlePlaceholder,
          minutesPlaceholder: t.addHabit.minutesPlaceholder,
          frequencyDaily: t.habits.daily,
          frequencyWeekly: t.habits.weekly,
          frequencyMonthly: t.habits.monthly,
          chooseWeekDays: t.addHabit.chooseWeekDays,
          chooseMonthDays: t.addHabit.chooseMonthDays,
          createHabit: t.addHabit.createHabit,
          closeForm: t.addHabit.closeForm,
        }}
        onClose={() => setIsAdding(false)}
        onChangeTitle={setNewTitle}
        onChangeMinutes={setNewMinutes}
        onChangeIcon={setNewIcon}
        onChangeFrequency={setNewFrequency}
        onToggleWeekDay={toggleWeekDay}
        onToggleMonthDay={toggleMonthDay}
        onCreate={addHabit}
      />


      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#050609]/95 backdrop-blur-2xl"
            />

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.985 }}
              transition={{
                type: "spring",
                stiffness: 140,
                damping: 22,
              }}
              className={`relative w-full max-w-sm overflow-hidden rounded-[44px] h-[650px] border border-white/[0.08] ${currentTheme.surface} px-8 py-10 text-center shadow-[0_40px_100px_rgba(0,0,0,0.55)]`}
            >
              <motion.div
                aria-hidden="true"
                animate={{
                  opacity: [0.12, 0.26, 0.12],
                  scale: [0.94, 1.08, 0.94],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`absolute pointer-events-none left-1/2 top-8 h-52 w-52 -translate-x-1/2 rounded-full bg-gradient-to-br ${currentTheme.primaryGradient} blur-[95px]`}
              />

              <div className="absolute inset-0 pointer-events-none rounded-[44px] h-[650px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_42%)]" />

              <motion.div
                animate={{
                  y: [0, -5, 0],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
              >
                <motion.div
                  animate={{
                    opacity: [0.2, 0.45, 0.2],
                    scale: [0.9, 1.12, 0.9],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-[28px] bg-orange-300/10 blur-2xl"
                />

                <Flame size={26} className="relative text-white" />
              </motion.div>

              <div className="mt-14">
            <div className="relative z-20 mt-8 flex justify-center">
  <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl">
    <button
      type="button"
      onClick={() => setLanguage("vi")}
      className={`min-w-[64px] rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all ${
        language === "vi"
          ? "bg-white text-black shadow-[0_4px_18px_rgba(255,255,255,0.12)]"
          : "text-gray-500 hover:text-white"
      }`}
    >
      VI
    </button>

    <button
      type="button"
      onClick={() => setLanguage("en")}
      className={`min-w-[64px] rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all ${
        language === "en"
          ? "bg-white text-black shadow-[0_4px_18px_rgba(255,255,255,0.12)]"
          : "text-gray-500 hover:text-white"
      }`}
    >
      EN
    </button>
  </div>
</div>
<br />
              <h2 className="text-[28px] font-black leading-[1.14] tracking-[-0.045em] text-white">
                  {t.welcome.title}
                </h2>

                <p className="mt-5 text-[19px] font-semibold tracking-[-0.03em] text-gray-300">
                  {t.welcome.subtitle}
                </p>
              </div>

              <p className="mx-auto mt-8 min-h-[52px] max-w-[30ch] text-[14px] leading-[1.75] text-gray-500 text-balance">
  {t.welcome.quote}
  <br />
  {t.welcome.quoteSecond}
</p>

              <div className="mt-10 flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-white/15" />
                <div className="h-1.5 w-7 rounded-full bg-white/45" />
                <div className="h-1.5 w-1.5 rounded-full bg-white/15" />
              </div>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("ds-welcome-seen", "true");
                  setShowWelcome(false);

                  setSelectedMinutes(2);
                  setSelectedHabitTitle(t.focusSessions.tinyTitle);
                  setSelectedSessionType("tiny");

                  setTimeout(() => {
                    setOpenFocus(true);
                  }, 220);
                }}
                className="mt-11 mx-auto flex w-fit min-w-[220px] items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.08] px-9 py-3.5 text-sm font-black uppercase tracking-[0.24em] text-white backdrop-blur-xl shadow-[0_12px_40px_rgba(255,255,255,0.06)] transition-all hover:bg-white/[0.11] active:scale-[0.99]"
              >
                {t.welcome.startSmall}
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("ds-welcome-seen", "true");
                  setShowWelcome(false);
                }}
                className="mt-6 text-[12px] font-semibold tracking-[0.01em] text-gray-600 transition-colors hover:text-gray-400"
              >
                {t.welcome.explore}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FocusModal
        open={openFocus}
        minutes={selectedMinutes}
        title={selectedHabitTitle}
        onComplete={handleFocusComplete}
        sessionType={selectedSessionType}
        onClose={() => setOpenFocus(false)}
        language={language}
      />
    </main>
  );
}
