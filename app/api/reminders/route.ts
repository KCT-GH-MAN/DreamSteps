import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "",
  token:
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    "",
});

type HabitReminder = {
  id: number;
  title: string;
  minutes: number;
  reminderTime: string;
  frequency: "daily" | "weekly" | "monthly";
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  createdAt: string;
};

const REMINDERS_KEY = "dreamsteps:habit-reminders";

export async function POST(request: Request) {
  const incoming = await request.json();

  if (
    !incoming ||
    typeof incoming.id !== "number" ||
    typeof incoming.title !== "string" ||
    typeof incoming.minutes !== "number" ||
    typeof incoming.reminderTime !== "string"
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid reminder payload." },
      { status: 400 }
    );
  }

  const reminders = (await redis.get<HabitReminder[]>(REMINDERS_KEY)) || [];

  const nextReminder: HabitReminder = {
    id: incoming.id,
    title: incoming.title,
    minutes: incoming.minutes,
    reminderTime: incoming.reminderTime,
    frequency:
      incoming.frequency === "weekly" || incoming.frequency === "monthly"
        ? incoming.frequency
        : "daily",
    daysOfWeek: Array.isArray(incoming.daysOfWeek) ? incoming.daysOfWeek : [],
    daysOfMonth: Array.isArray(incoming.daysOfMonth) ? incoming.daysOfMonth : [],
    createdAt: new Date().toISOString(),
  };

  const nextReminders = [
    ...reminders.filter((item) => item.id !== nextReminder.id),
    nextReminder,
  ];

  await redis.set(REMINDERS_KEY, nextReminders);

  return NextResponse.json({
    ok: true,
    totalReminders: nextReminders.length,
  });
}

export async function GET() {
  const reminders = (await redis.get<HabitReminder[]>(REMINDERS_KEY)) || [];

  return NextResponse.json({
    ok: true,
    reminders,
  });
}
