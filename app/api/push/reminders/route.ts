import { NextResponse } from "next/server";
import { listSubscriptions, markSubscriptionSent, removeSubscription } from "@/lib/pushStore";
import { configureWebPush } from "@/lib/pushServer";

export const runtime = "nodejs";

function getLocalDateParts(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function getPayload(language: "vi" | "en") {
  return JSON.stringify({
    title: "DreamSteps",
    body:
      language === "vi"
        ? "Den gio nhac DreamSteps. Mo app de hoan thanh mot buoc nho hom nay."
        : "One small step today still counts. Open DreamSteps.",
    url: "/",
  });
}

async function handleReminderRun() {
  const webpush = configureWebPush();
  const subscriptions = await listSubscriptions();
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (item) => {
      const local = getLocalDateParts(item.timezone);

      if (item.lastSentDate === local.date || local.time < item.reminderTime) {
        return;
      }

      try {
        await webpush.sendNotification(item.subscription, getPayload(item.language));
        await markSubscriptionSent(item.endpoint, local.date);
        sent += 1;
      } catch (error) {
        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof error.statusCode === "number"
            ? error.statusCode
            : null;

        if (statusCode === 404 || statusCode === 410) {
          await removeSubscription(item.endpoint);
        }
      }
    })
  );

  return sent;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (token !== cronSecret && bearerToken !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const sent = await handleReminderRun();
  return NextResponse.json({ ok: true, sent });
}

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && request.headers.get("x-cron-secret") !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sent = await handleReminderRun();
  return NextResponse.json({ ok: true, sent });
}
