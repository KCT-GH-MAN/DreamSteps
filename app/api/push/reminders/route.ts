import { NextResponse } from "next/server";
import {
  listSubscriptions,
  markSubscriptionNotificationSent,
  removeSubscription,
} from "@/lib/pushStore";
import { configureWebPush } from "@/lib/pushServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEDULED_REMINDER_GRACE_MINUTES = 30;

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

function getLocalDate(timezone: string, value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function getDaysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;

  return Math.floor((end - start) / 86_400_000);
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

  return hour * 60 + minute;
}

function isWithinScheduledReminderWindow(currentTime: string, scheduledTime: string) {
  const currentMinutes = timeToMinutes(currentTime);
  const scheduledMinutes = timeToMinutes(scheduledTime);

  if (currentMinutes === null || scheduledMinutes === null) return false;

  const elapsedMinutes = currentMinutes - scheduledMinutes;

  return elapsedMinutes >= 0 && elapsedMinutes <= SCHEDULED_REMINDER_GRACE_MINUTES;
}

function getPayload(language: "vi" | "en", type: "morning" | "evening" | "reengage") {
  const bodyByType =
    language === "vi"
      ? {
          morning: "🌅 Hãy bắt đầu 1 ngày mới bằng việc duy trì những thói quen tốt.",
          evening:
            "🌙 Hãy chậm lại 1 nhịp để nhìn lại 1 ngày đã trôi qua, để chuẩn bị cho ngày mai tốt đẹp hơn.",
          reengage:
            "✨ Đã vài ngày rồi bạn chưa mở ứng dụng DreamSteps. Đừng để các thói quen trở thành ký ức.",
        }
      : {
          morning: "🌅 Start a new day by keeping your good habits alive.",
          evening:
            "🌙 Slow down for a moment to reflect on the day that has passed, so tomorrow can be better.",
          reengage:
            "✨ It has been a few days since you opened DreamSteps. Do not let your habits become memories.",
        };
  const titleByType =
    language === "vi"
      ? {
          morning: "DreamSteps - Khởi động ngày mới",
          evening: "DreamSteps - Nhìn lại hôm nay",
          reengage: "DreamSteps - Quay lại nhé",
        }
      : {
          morning: "DreamSteps - Start Your Day",
          evening: "DreamSteps - Evening Review",
          reengage: "DreamSteps - Come Back",
        };

  return JSON.stringify({
    title: titleByType[type],
    body: bodyByType[type],
    url: "/",
  });
}

async function handleReminderRun() {
  const subscriptions = await listSubscriptions();
  if (subscriptions.length === 0) {
    return 0;
  }

  const webpush = configureWebPush();
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (item) => {
      const local = getLocalDateParts(item.timezone);
      const lastSeenDate = getLocalDate(item.timezone, new Date(item.lastSeenAt));
      const reengageDue =
        getDaysBetween(lastSeenDate, local.date) >= item.reengageAfterDays &&
        item.lastReengageSentDate !== local.date;
      const dueNotifications: Array<"morning" | "evening" | "reengage"> = [];

      if (
        item.lastMorningSentDate !== local.date &&
        isWithinScheduledReminderWindow(local.time, item.morningReminderTime)
      ) {
        dueNotifications.push("morning");
      }

      if (
        item.lastEveningSentDate !== local.date &&
        isWithinScheduledReminderWindow(local.time, item.eveningReflectionTime)
      ) {
        dueNotifications.push("evening");
      }

      if (reengageDue) {
        dueNotifications.push("reengage");
      }

      try {
        for (const type of dueNotifications) {
          await webpush.sendNotification(item.subscription, getPayload(item.language, type));
          await markSubscriptionNotificationSent(item.endpoint, type, local.date);
          sent += 1;
        }
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

async function runReminderRequest() {
  try {
    const sent = await handleReminderRun();
    return NextResponse.json(
      { ok: true, sent },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reminder error";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
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

  return runReminderRequest();
}

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && request.headers.get("x-cron-secret") !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runReminderRequest();
}
