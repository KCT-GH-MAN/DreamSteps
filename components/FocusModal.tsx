"use client";

import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  PartyPopper,
  CloudRain,
  Coffee,
  Waves,
  Trees,
  Flame,
  Radio,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
} from "lucide-react";

type Language = "vi" | "en";

interface FocusModalProps {
  open: boolean;
  minutes: number;
  onClose: () => void;

  /**
   * Optional: truyền tên habit từ HomePage nếu muốn.
   * Không truyền vẫn chạy như bản cũ.
   */
  title?: string;

  /**
   * Optional: callback khi hoàn thành phiên focus.
   * Trả về số phút đã hoàn thành để Page ghi analytics.
   */
  onComplete?: (minutes: number) => void;

  /**
   * Optional: nếu muốn tự chạy timer khi mở modal.
   */
  autoStart?: boolean;
  sessionType?: string;
  language?: Language;
  testDurationSeconds?: number;
}

type AmbientSound = {
  id: string;
  label: string;
  icon: ElementType;
  audioUrl?: string;
};

const FOCUS_MODAL_TEXT = {
  vi: {
    ambientSound: "Âm thanh nền",
    on: "Bật",
    off: "Tắt",
    pause: "Tạm dừng",
    play: "Tiếp tục",
    reset: "Làm lại",
    close: "Đóng",
    deepFocusOn: "Bật Deep Focus",
    deepFocusOff: "Tắt Deep Focus",
    deepQuote: "Khóa mục tiêu, khắc dấu ấn!",
    keepGoing: "Tiếp tục nào!",
    youDidIt: "Bạn đã làm được rồi đấy!",
    completionTitle: "Hoàn thành rồi.",
    completionSubtitle: "Một bước nhỏ vẫn được tính.",
    startLine: "Hãy bắt đầu. Đừng đợi tới khi cảm thấy sẵn sàng!",
    runningLine: "Đang tập trung. Giữ nhịp này!",
    pausedLine: "Đã tạm dừng. Quay lại khi sẵn sàng.",
    confirmClose: (minutesLeft: number) =>
      `Còn khoảng ${minutesLeft} phút nữa. Đừng bỏ cuộc!`,
  },

  en: {
    ambientSound: "Ambient Sound",
    on: "On",
    off: "Off",
    pause: "Pause",
    play: "Play",
    reset: "Reset",
    close: "Close",
    deepFocusOn: "Turn on Deep Focus",
    deepFocusOff: "Turn off Deep Focus",
    deepQuote: "Deep focus, deep impact.",
    keepGoing: "Keep going!",
    youDidIt: "You did it!",
    completionTitle: "Completed.",
    completionSubtitle: "A small step still counts.",
    startLine: "Just begin. No need to wait until you feel ready!",
    runningLine: "Focused now. Keep the rhythm.",
    pausedLine: "Paused. Resume when you're ready.",
    confirmClose: (minutesLeft: number) =>
      `About ${minutesLeft} minutes left. Don't give up!`,
  },
} as const;

const COMPLIMENTS = {
  vi: [
    "Kỷ luật là sức mạnh! Bạn có thể tự hào về chính mình! 🔥",
    "Động lực chỉ giúp bạn bắt đầu. Kỷ luật mới là thứ giữ bạn đi tiếp. 🔥",
    "Không ai thay đổi cuộc đời chỉ bằng vài ngày cố gắng hứng khởi cả. 💪",
    "Bạn kiểm soát thói quen, hoặc để thói quen kiểm soát cuộc sống của mình. ⚡",
    "Kết quả hôm nay chính là cái giá của sự trì hoãn ngày hôm qua. ⏳",
    "Những ngày không muốn làm mới là lúc thói quen thật sự được tạo ra. 🚀",
    "Tiến bộ chậm vẫn tốt hơn đứng yên rồi tự an ủi bản thân. 🎯",
    "Không cần hoàn hảo. Nhưng nếu cứ bỏ cuộc, sẽ chẳng có gì thay đổi. ✨",
    "Sự thoải mái hiện tại thường đổi lấy sự hối tiếc về sau. 🔥",
    "Bạn không thiếu tiềm năng. Bạn chỉ thiếu sự đều đặn. 💯",
    "Mỗi lần trì hoãn là thêm một ngày cuộc sống vẫn y nguyên như cũ. ⚠️",
  ],
  en: [
    "Discipline is power. You can be proud of yourself! 🔥",
    "Motivation helps you start. Discipline keeps you going. 🔥",
    "No one changes their life with only a few excited days. 💪",
    "You control your habits, or your habits control your life. ⚡",
    "Today’s result is the price of yesterday’s delay. ⏳",
    "The days you don’t feel like doing it are where habits are truly built. 🚀",
    "Slow progress is still better than standing still. 🎯",
    "You don’t need to be perfect. But quitting changes nothing. ✨",
    "Comfort now often becomes regret later. 🔥",
    "You don’t lack potential. You just need consistency. 💯",
    "Every delay is one more day your life stays the same. ⚠️",
  ],
} as const;

const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: "rain",
    label: "Rain",
    icon: CloudRain,
    audioUrl: "/sounds/rain.mp3",
  },
  {
    id: "forest",
    label: "Forest",
    icon: Trees,
    audioUrl: "/sounds/forest.mp3",
  },
  {
    id: "cafe",
    label: "Cafe",
    icon: Coffee,
    audioUrl: "/sounds/cafe.mp3",
  },
  {
    id: "waves",
    label: "Waves",
    icon: Waves,
    audioUrl: "/sounds/waves.mp3",
  },
  {
    id: "brown",
    label: "Brown Noise",
    icon: Radio,
    audioUrl: "/sounds/brown-noise.mp3",
  },
  {
    id: "fireplace",
    label: "Fireplace",
    icon: Flame,
    audioUrl: "/sounds/fireplace.mp3",
  },
];


const SESSION_THEMES = {
  tiny: {
    glow: "bg-sky-500/10",
    accent: "text-sky-300",
    label: "Tiny Start",
  },
  recovery: {
    glow: "bg-emerald-500/10",
    accent: "text-emerald-300",
    label: "Recovery Focus",
  },
  gentle: {
    glow: "bg-violet-500/10",
    accent: "text-violet-300",
    label: "Gentle Focus",
  },
  deep: {
    glow: "bg-blue-600/10",
    accent: "text-blue-300",
    label: "Deep Focus",
  },
  momentum: {
    glow: "bg-orange-500/10",
    accent: "text-orange-300",
    label: "Momentum Focus",
  },
} as const;



const APP_THEMES = {
  midnight: {
    background: "bg-[#0F1115]",
    card: "bg-[#171A21]",
    gradient: "from-[#7C9EFF] to-[#9B8CFF]",
    glow: "shadow-[0_20px_60px_rgba(124,158,255,0.25)]",
  },
  forest: {
    background: "bg-[#0E1512]",
    card: "bg-[#16211C]",
    gradient: "from-[#4ADE80] to-[#22C55E]",
    glow: "shadow-[0_20px_60px_rgba(74,222,128,0.22)]",
  },
  sunset: {
    background: "bg-[#16110F]",
    card: "bg-[#211815]",
    gradient: "from-[#FB923C] to-[#F472B6]",
    glow: "shadow-[0_20px_60px_rgba(251,146,60,0.24)]",
  },
  arctic: {
    background: "bg-[#0D141A]",
    card: "bg-[#172129]",
    gradient: "from-[#67E8F9] to-[#60A5FA]",
    glow: "shadow-[0_20px_60px_rgba(103,232,249,0.22)]",
  },
} as const;


const FOCUS_STATS_KEY = "ds-focus-stats";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function getRandomCompliment(language: Language) {
  const compliments = COMPLIMENTS[language];

  return compliments[Math.floor(Math.random() * compliments.length)];
}

function saveCompletedFocusSession(minutes: number) {
  try {
    const raw = localStorage.getItem(FOCUS_STATS_KEY);
    const current = raw
      ? JSON.parse(raw)
      : {
          totalSessions: 0,
          totalMinutes: 0,
          completedSessions: 0,
        };

    const next = {
      totalSessions: Number(current.totalSessions || 0) + 1,
      totalMinutes: Number(current.totalMinutes || 0) + minutes,
      completedSessions: Number(current.completedSessions || 0) + 1,
      lastCompletedAt: new Date().toISOString(),
    };

    localStorage.setItem(FOCUS_STATS_KEY, JSON.stringify(next));
  } catch {
    // Không để lỗi localStorage làm crash UI focus.
  }
}

export default function FocusModal({
  open,
  minutes,
  onClose,
  title = "Focusing Session",
  onComplete,
  autoStart = false,
  sessionType = "gentle",
  language = "vi",
  testDurationSeconds,
}: FocusModalProps) {
  const text = FOCUS_MODAL_TEXT[language];
  const totalSeconds = useMemo(
    () => testDurationSeconds ?? Math.max(1, minutes) * 60,
    [minutes, testDurationSeconds]
  );

  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(false);

  const [showCompliment, setShowCompliment] = useState(false);
  const [currentCompliment, setCurrentCompliment] = useState("");

  const [deepFocus, setDeepFocus] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const progress = totalSeconds === 0 ? 0 : 1 - timeLeft / totalSeconds;
  const circleRadius = 108;
  const circumference = 2 * Math.PI * circleRadius;
  const hasStarted = timeLeft < totalSeconds;
  const focusStatusLine = isActive
    ? text.runningLine
    : hasStarted
    ? text.pausedLine
    : text.startLine;
  const currentTheme = SESSION_THEMES[sessionType as keyof typeof SESSION_THEMES] ?? SESSION_THEMES.gentle;
  const localizedSessionLabel =
    language === "vi"
      ? sessionType === "tiny"
        ? "Bắt đầu nhỏ"
        : sessionType === "recovery"
        ? "Focus phục hồi"
        : sessionType === "deep"
        ? "Focus sâu"
        : sessionType === "momentum"
        ? "Focus theo đà"
        : "Focus nhẹ"
      : currentTheme.label;
  const appTheme = (typeof window !== "undefined"
    ? localStorage.getItem("ds-theme")
    : "midnight") || "midnight";

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(totalSeconds);
      setIsActive(autoStart);
      setShowCompliment(false);
      setCurrentCompliment("");
      setDeepFocus(false);
      const rememberedSound =
        typeof window !== "undefined"
          ? localStorage.getItem("ds-last-sound")
          : null;

      const adaptiveSound =
        sessionType === "recovery"
          ? "forest"
          : sessionType === "deep"
          ? "brown"
          : sessionType === "momentum"
          ? "cafe"
          : "rain";

      setSelectedSound(rememberedSound || adaptiveSound);
      setSoundEnabled(false);
      setHasCompleted(false);
      setShowCloseConfirm(false);
    }
  }, [open, totalSeconds, autoStart, sessionType]);

  useEffect(() => {
    if (!open) {
      audioRef.current?.pause();
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      audioRef.current?.pause();
    };
  }, [open]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (!open || timeLeft !== 0 || showCompliment || hasCompleted) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsActive(false);
    setHasCompleted(true);
    setCurrentCompliment(getRandomCompliment(language));
    setShowCompliment(true);
    saveCompletedFocusSession(minutes);
    onComplete?.(minutes);
  }, [open, timeLeft, showCompliment, hasCompleted, minutes, onComplete, language]);

  useEffect(() => {
    const selected = AMBIENT_SOUNDS.find((sound) => sound.id === selectedSound);

    if (!open || !selected?.audioUrl) {
      audioRef.current?.pause();
      return;
    }

    const expectedSrc = `${window.location.origin}${selected.audioUrl}`;

    if (!audioRef.current || audioRef.current.src !== expectedSrc) {
      audioRef.current?.pause();
      audioRef.current = new Audio(selected.audioUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0;
    }

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    if (soundEnabled) {
      localStorage.setItem("ds-last-sound", selected.id);

      audioRef.current.play().catch(() => {
        setSoundEnabled(false);
      });

      fadeIntervalRef.current = setInterval(() => {
        if (!audioRef.current) return;

        audioRef.current.volume = Math.min(
          0.35,
          audioRef.current.volume + 0.03
        );
      }, 60);
    } else {
      fadeIntervalRef.current = setInterval(() => {
        if (!audioRef.current) return;

        audioRef.current.volume = Math.max(
          0,
          audioRef.current.volume - 0.03
        );

        if (audioRef.current.volume <= 0.01) {
          audioRef.current.pause();

          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
        }
      }, 60);
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [open, selectedSound, soundEnabled]);

  const resetSession = () => {
    setTimeLeft(totalSeconds);
    setIsActive(false);
    setShowCompliment(false);
    setCurrentCompliment("");
    setHasCompleted(false);
  };

  const handleClose = () => {
    if (isActive && timeLeft > 0) {
      setShowCloseConfirm(true);
      return;
    }

    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence mode="wait">
      <div key="focus-modal-root" className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-md"
          onClick={handleClose}
        />

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          className={`relative ${APP_THEMES[appTheme as keyof typeof APP_THEMES]?.card || "bg-[#171A21]"} w-full ${
  deepFocus ? "max-w-2xl" : "max-w-sm md:max-w-lg"
} max-h-[calc(100dvh-24px)] overflow-y-auto rounded-[30px] border border-white/10 p-4 text-center shadow-[0_30px_60px_rgba(0,0,0,0.5)] sm:rounded-[40px] sm:p-6 md:p-8`}
        >
          {!showCompliment && (
            <div className="absolute right-5 top-5 z-10 flex gap-2 sm:right-8 sm:top-8">
              <button
                type="button"
                aria-label={deepFocus ? text.deepFocusOff : text.deepFocusOn}
                onClick={() => setDeepFocus((prev) => !prev)}
                className="p-1 text-gray-600 transition-colors hover:text-white"
              >
                {deepFocus ? <Maximize2 size={22} /> : <Minimize2 size={22} />}
              </button>

              <button
                type="button"
                aria-label={text.close}
                onClick={handleClose}
                className="p-1 text-gray-600 transition-colors hover:text-white"
              >
                <X size={25} />
              </button>
            </div>
          )}

          <span
            className={`text-[10px] font-black uppercase tracking-[0.3em] text-[#7C9EFF] ${
              deepFocus ? "opacity-0" : ""
            }`}
            title={title}
          >
            {title === "Tiny Start" ? localizedSessionLabel : title || localizedSessionLabel}
          </span>

          <div className="relative my-6 flex justify-center sm:my-9">
            <div className="relative flex h-[min(52vw,210px)] w-[min(52vw,210px)] items-center justify-center sm:h-[236px] sm:w-[236px]">
              <svg
                viewBox="0 0 260 260"
                className="absolute inset-0 h-full w-full -rotate-90"
              >
                <circle
                  cx="130"
                  cy="130"
                  r={circleRadius}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="14"
                  fill="transparent"
                />
                <circle
                  cx="130"
                  cy="130"
                  r={circleRadius}
                  stroke="currentColor"
                  strokeWidth="14"
                  fill="transparent"
                  strokeLinecap="round"
                  className="text-[#7C9EFF]"
                  strokeDasharray={circumference}
                  strokeDashoffset={(1 - progress) * circumference}
                />
              </svg>

              <div className="relative z-10 flex max-w-[210px] flex-col items-center justify-center text-center">
                <div className="max-w-full whitespace-nowrap px-2 text-[44px] font-black italic leading-tight tracking-[-0.08em] text-white tabular-nums sm:text-[56px]">
                  {formatTime(timeLeft)}
                </div>

                
              </div>

              <div
                className={`absolute inset-0 ${currentTheme.glow} rounded-full blur-[55px] transition-opacity duration-500 -z-10 ${
                  isActive ? "opacity-100" : "opacity-55"
                }`}
              />
            </div>
          </div>

          {!showCompliment && (
            <>
              <div className="mx-auto flex max-w-[220px] items-center justify-center gap-5">
                <button
                  type="button"
                  aria-label="Reset phiên focus"
                  onClick={resetSession}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-gray-500 transition-all hover:bg-white/10 hover:text-white sm:h-12 sm:w-12"
                >
                  <RotateCcw size={22} />
                </button>

                <button
                  type="button"
                  aria-label={isActive ? "Tạm dừng phiên focus" : "Bắt đầu phiên focus"}
                  onClick={() => setIsActive((prev) => !prev)}
                  className={`flex h-16 w-16 items-center justify-center rounded-[24px] transition-all shadow-xl sm:h-20 sm:w-20 sm:rounded-[28px] ${
                    isActive
                      ? "scale-95 bg-white text-black shadow-white/10"
                      : "scale-100 bg-[#7C9EFF] text-white shadow-[#7C9EFF]/30"
                  }`}
                >
                  {isActive ? (
                    <Pause size={30} fill="currentColor" />
                  ) : (
                    <Play size={30} fill="currentColor" className="ml-1.5" />
                  )}
                </button>
              </div>

              <p
                className={`mt-5 rounded-2xl px-4 py-2.5 text-xs font-bold leading-relaxed transition-colors ${
                  isActive
                    ? "bg-[#7C9EFF]/10 text-[#AFC2FF]"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                <span className="block">{focusStatusLine}</span>
              </p>
            </>
          )}

          {!deepFocus && !showCompliment && (
            <div className="mt-6 rounded-[24px] border border-white/5 bg-white/[0.025] p-3.5 sm:mt-7 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-gray-500">
                    {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </span>

                  <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                    {text.ambientSound}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Bật tắt âm thanh"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-black transition-colors ${
                    soundEnabled
                      ? "bg-[#7C9EFF]/15 text-[#AFC2FF]"
                      : "bg-white/5 text-gray-500 hover:text-white"
                  }`}
                >
                  {soundEnabled ? text.on : text.off}
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {AMBIENT_SOUNDS.map((sound) => {
                  const Icon = sound.icon;
                  const active = selectedSound === sound.id;

                  return (
                    <button
                      key={sound.id}
                      type="button"
                      aria-label={sound.label}
                      title={sound.label}
                      onClick={() => {
                        setSelectedSound(sound.id);
                        setSoundEnabled(true);
                      }}
                      className={`relative mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border transition-all sm:h-12 sm:w-12 ${
                        active
                          ? "border-[#7C9EFF] bg-[#7C9EFF]/20 text-white"
                          : "border-white/5 bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon size={20} />
                      {active && soundEnabled && (
                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#AFC2FF] shadow-[0_0_10px_rgba(124,158,255,0.9)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!showCompliment && (
            <p className="mt-7 text-gray-600 text-xs font-bold italic opacity-60">
              {text.deepQuote}
            </p>
          )}

          <AnimatePresence>
            {showCompliment && (
              <motion.div
                key="focus-completion"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden rounded-[34px] border border-white/10 bg-[#171A21] px-6 py-8 text-center shadow-2xl sm:rounded-[40px]"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#7EE2B8]/10 text-[#7EE2B8] shadow-[0_18px_45px_rgba(126,226,184,0.16)]">
                  <PartyPopper
                    size={34}
                    fill="#7EE2B8"
                    strokeWidth={0}
                  />
                </div>

                <h3 className="max-w-[12ch] text-[34px] font-black italic leading-[0.95] tracking-[-0.04em] text-white sm:text-[38px]">
                  {text.youDidIt}
                </h3>

                <p className="mt-5 max-w-[24ch] text-balance text-center text-[18px] font-black leading-[1.35] tracking-[-0.02em] text-[#7EE2B8] transition-all duration-1000 sm:text-[20px]">
                  {currentCompliment}
                </p>

                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-7 w-full max-w-[220px] rounded-full bg-[#7EE2B8] px-8 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-black shadow-lg shadow-[#7EE2B8]/15 transition-all hover:scale-[1.03]"
                >
                  {text.keepGoing}
                </button>
              </motion.div>
            )}
  
          <AnimatePresence key="focus-close-confirm-presence">
            {showCloseConfirm && (
              <motion.div
                key="focus-close-confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[120] flex items-center justify-center bg-black/70 px-5 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 12 }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  className="w-full max-w-sm rounded-[32px] border border-white/10 bg-[#171A21] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#AFC2FF]">
                    {language === "vi" ? "Phiên đang chạy" : "Session in progress"}
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-white">
                    {language === "vi" ? "Dừng phiên tập trung?" : "Stop focus session?"}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-gray-400">
                    {language === "vi"
                      ? `Còn khoảng ${Math.ceil(timeLeft / 60)} phút nữa trong phiên này.`
                      : `About ${Math.ceil(timeLeft / 60)} minutes left in this session.`}
                  </p>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCloseConfirm(false)}
                      className="flex-1 rounded-2xl bg-white/5 py-3.5 text-sm font-black text-gray-200 transition-colors hover:bg-white/10"
                    >
                      {language === "vi" ? "Tiếp tục" : "Continue"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCloseConfirm(false);
                        setIsActive(false);
                        onClose();
                      }}
                      className="flex-1 rounded-2xl border border-red-400/20 bg-red-500/15 py-3.5 text-sm font-black text-red-200 transition-colors hover:bg-red-500/20"
                    >
                      {language === "vi" ? "Dừng" : "Stop"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
