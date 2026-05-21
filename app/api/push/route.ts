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

const SUBSCRIPTION_KEY = "dreamsteps:push-subscriptions";

export async function POST(request: Request) {
  const subscription = (await request.json()) as webpush.PushSubscription;

  const existing =
    (await redis.get<webpush.PushSubscription[]>(SUBSCRIPTION_KEY)) || [];

  const alreadyExists = existing.some(
    (item) => item.endpoint === subscription.endpoint
  );

  if (!alreadyExists) {
    existing.push(subscription);
    await redis.set(SUBSCRIPTION_KEY, existing);
  }

  return NextResponse.json({
    ok: true,
    totalSubscriptions: existing.length,
  });
}

export async function PUT(request: Request) {
  const subscriptions =
    (await redis.get<webpush.PushSubscription[]>(SUBSCRIPTION_KEY)) || [];

  if (subscriptions.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No subscriptions saved yet." },
      { status: 400 }
    );
  }

  const payload = await request.json().catch(() => ({
    title: "DreamSteps",
    body: "Một bước nhỏ cho hôm nay nhé 🌱",
  }));

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: payload.title || "DreamSteps",
          body: payload.body || "Một bước nhỏ cho hôm nay nhé 🌱",
          url: payload.url || "/",
        })
      )
    )
  );

  return NextResponse.json({
    ok: true,
    sent: results.filter((result) => result.status === "fulfilled").length,
    total: subscriptions.length,
  });
}
