import { NextResponse } from "next/server";
import { upsertSubscription } from "@/lib/pushStore";

export const runtime = "nodejs";

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
    timezone:
      typeof body.timezone === "string" ? body.timezone : "Asia/Bangkok",
    language: body.language === "en" ? "en" : "vi",
    lastSentDate: null,
  });

  return NextResponse.json({ ok: true });
}
