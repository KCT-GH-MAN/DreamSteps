import { NextResponse } from "next/server";
import webpush from "web-push";

export const runtime = "nodejs";

let savedSubscription: webpush.PushSubscription | null = null;

webpush.setVapidDetails(
  "mailto:rml1ttx@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function POST(request: Request) {
  const subscription = (await request.json()) as webpush.PushSubscription;

  savedSubscription = subscription;

  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  if (!savedSubscription) {
    return NextResponse.json(
      { ok: false, error: "No push subscription saved yet." },
      { status: 400 }
    );
  }

  const payload = await request.json().catch(() => ({
    title: "DreamSteps",
    body: "Một bước nhỏ cho hôm nay nhé 🌱",
  }));

  await webpush.sendNotification(
    savedSubscription,
    JSON.stringify({
      title: payload.title || "DreamSteps",
      body: payload.body || "Một bước nhỏ cho hôm nay nhé 🌱",
      url: payload.url || "/",
    })
  );

  return NextResponse.json({ ok: true });
}
