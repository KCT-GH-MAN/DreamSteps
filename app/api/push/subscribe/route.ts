import { NextResponse } from "next/server";
import { upsertSubscription } from "@/lib/pushStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidReminderTime(value: unknown) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.subscription?.endpoint) {
    return NextResponse.json({ error: "Missing subscription" }, { status: 400 });
  }

  await upsertSubscription({
    subscription: body.subscription,
    reminderTime: isValidReminderTime(body.reminderTime)
      ? body.reminderTime
      : "20:00",
    morningReminderTime: isValidReminderTime(body.morningReminderTime)
      ? body.morningReminderTime
      : "06:00",
    eveningReflectionTime: isValidReminderTime(body.eveningReflectionTime)
      ? body.eveningReflectionTime
      : isValidReminderTime(body.reminderTime)
        ? body.reminderTime
        : "21:00",
    reengageAfterDays:
      typeof body.reengageAfterDays === "number" &&
      Number.isInteger(body.reengageAfterDays) &&
      body.reengageAfterDays >= 1 &&
      body.reengageAfterDays <= 30
        ? body.reengageAfterDays
        : 3,
    timezone:
      typeof body.timezone === "string" ? body.timezone : "Asia/Bangkok",
    language: body.language === "en" ? "en" : "vi",
    lastSentDate: null,
    lastMorningSentDate: null,
    lastEveningSentDate: null,
    lastReengageSentDate: null,
    lastSeenAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
