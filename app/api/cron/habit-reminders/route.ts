import { NextResponse } from "next/server";
import webpush from "web-push";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "",
  token:
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    "",
});

webpush.setVapidDetails(
  "mailto:rml1ttx@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

type HabitReminder = {
  id: number;
  title: string;
  minutes: number;
  reminderTime: string;
  frequency: "daily" | "weekly" | "monthly";
  daysOfWeek?: number[];
  daysOfMonth?: number[];
};

const SUBSCRIPTION_KEY = "dreamsteps:push-subscriptions";
const REMINDERS_KEY = "dreamsteps:habit-reminders";
const SENT_PREFIX = "dreamsteps:sent-reminder";

function getVietnamNow() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
    })
  );
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isReminderDueToday(reminder: HabitReminder, now: Date) {
  if (reminder.frequency === "daily") return true;

  if (reminder.frequency === "weekly") {
    return reminder.daysOfWeek?.includes(now.getDay()) ?? false;
  }

  if (reminder.frequency === "monthly") {
    return reminder.daysOfMonth?.includes(now.getDate()) ?? false;
  }

  return true;
}

export async function GET() {
  const now = getVietnamNow();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  const today = getLocalDateKey(now);

  const subscriptions =
    (await redis.get<webpush.PushSubscription[]>(SUBSCRIPTION_KEY)) || [];
  const reminders = (await redis.get<HabitReminder[]>(REMINDERS_KEY)) || [];

  if (subscriptions.length === 0 || reminders.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      currentTime,
      reminders: reminders.length,
      subscriptions: subscriptions.length,
    });
  }

  const dueReminders = reminders.filter((reminder) => {
    return (
      reminder.reminderTime === currentTime &&
      isReminderDueToday(reminder, now)
    );
  });

  let sent = 0;

  for (const reminder of dueReminders) {
    const sentKey = `${SENT_PREFIX}:${today}:${reminder.id}:${reminder.reminderTime}`;
    const alreadySent = await redis.get(sentKey);

    if (alreadySent) continue;

    const payload = JSON.stringify({
      title: "DreamSteps",
      body: `Đến giờ ${reminder.title} ${reminder.minutes} phút rồi 🌱`,
      url: "/",
    });

    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(subscription, payload)
      )
    );

    sent += results.filter((result) => result.status === "fulfilled").length;

    await redis.set(sentKey, "true", {
      ex: 60 * 60 * 24 * 2,
    });
  }

  return NextResponse.json({
    ok: true,
    currentTime,
    dueReminders: dueReminders.length,
    sent,
  });
}
