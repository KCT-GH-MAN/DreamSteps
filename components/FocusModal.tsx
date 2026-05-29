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
      <div key="focus-modal-root" className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
} max-h-[calc(100dvh-16px)] overflow-hidden rounded-[34px] sm:rounded-[40px] p-4 sm:p-6 md:p-8 border border-white/10 text-center shadow-[0_30px_60px_rgba(0,0,0,0.5)]`}
        >
          {!showCompliment && (
            <div className="absolute top-8 right-8 z-10 flex gap-2">
              <button
                type="button"
                aria-label={deepFocus ? text.deepFocusOff : text.deepFocusOn}
                onClick={() => setDeepFocus((prev) => !prev)}
                className="text-gray-600 hover:text-white transition-colors"
              >
                {deepFocus ? <Maximize2 size={24} /> : <Minimize2 size={24} />}
              </button>

              <button
                type="button"
                aria-label={text.close}
                onClick={handleClose}
                className="text-gray-600 hover:text-white transition-colors"
              >
                <X size={28} />
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

          <div className="relative my-7 sm:my-9 flex justify-center">
            <div className="relative flex h-[220px] w-[220px] sm:h-[236px] sm:w-[236px] items-center justify-center">
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
                <div className="max-w-full whitespace-nowrap text-[48px] sm:text-[56px] font-black italic tracking-[-0.08em] text-white leading-tight tabular-nums px-2">
                  {formatTime(timeLeft)}
                </div>

                
              </div>

              <div className={`absolute inset-0 ${currentTheme.glow} blur-[55px] rounded-full -z-10`} />
            </div>
          </div>

          {!showCompliment && (
            <>
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  aria-label="Reset phiên focus"
                  onClick={resetSession}
                  className="h-12 w-12 rounded-2xl bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  <RotateCcw size={24} />
                </button>

                <button
                  type="button"
                  aria-label={isActive ? "Tạm dừng phiên focus" : "Bắt đầu phiên focus"}
                  onClick={() => setIsActive((prev) => !prev)}
                  className={`h-20 w-20 rounded-[28px] flex items-center justify-center transition-all shadow-xl ${
                    isActive
                      ? "bg-white text-black scale-95"
                      : "bg-[#7C9EFF] text-white shadow-[#7C9EFF]/30 scale-100"
                  }`}
                >
                  {isActive ? (
                    <Pause size={34} fill="currentColor" />
                  ) : (
                    <Play size={34} fill="currentColor" className="ml-1.5" />
                  )}
                </button>

                <div className="w-12" />
              </div>

              <p className="mt-5 rounded-2xl bg-white/5 px-4 py-2.5 text-xs font-bold leading-relaxed text-gray-500">
  <span className="block">{text.startLine}</span>
  <span className="block">
    
  </span>
</p>
            </>
          )}

          {!deepFocus && !showCompliment && (
            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-600">
                  {text.ambientSound}
                </p>

                <button
                  type="button"
                  aria-label="Bật tắt âm thanh"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs font-bold text-gray-400 hover:text-white"
                >
                  {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  {soundEnabled ? text.on : text.off}
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                {AMBIENT_SOUNDS.map((sound) => {
                  const Icon = sound.icon;
                  const active = selectedSound === sound.id;

                  return (
                    <button
  key={sound.id}
  type="button"
  title={sound.label}
  onClick={() => {
    setSelectedSound(sound.id);
    setSoundEnabled(true);
  }}
  className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all ${
    active
      ? "border-[#7C9EFF] bg-[#7C9EFF]/20 text-white"
      : "border-white/5 bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
  }`}
>
  <Icon size={20} />
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
                className="absolute inset-0 bg-[#171A21] rounded-[34px] sm:rounded-[40px] px-6 py-8 flex flex-col items-center justify-center border border-white/10 shadow-2xl z-20 overflow-hidden"
              >
                

                <div className="text-[#7EE2B8] mb-4">
                  <PartyPopper
                    size={48}
                    fill="#7EE2B8"
                    strokeWidth={0}
                    className="mx-auto"
                  />
                </div>

                <h3 className="max-w-[12ch] text-[34px] sm:text-[38px] font-black text-white italic tracking-[-0.04em] mb-4 leading-[0.95]">
                  {text.youDidIt}
                </h3>

                <p className="max-w-[22ch] text-center text-[#7EE2B8] text-[18px] sm:text-[20px] font-black leading-[1.35] tracking-[-0.02em] transition-all duration-1000">
                  {currentCompliment}
                </p>

                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-7 bg-[#7EE2B8] text-black font-black uppercase tracking-widest px-9 py-3.5 rounded-full shadow-lg hover:scale-[1.03] transition-all"
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
