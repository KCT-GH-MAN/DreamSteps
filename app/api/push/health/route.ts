import { NextResponse } from "next/server";
import { listSubscriptions } from "@/lib/pushStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    supabaseUrl: Boolean(process.env.SUPABASE_URL),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    nextPublicVapidPublicKey: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    vapidPublicKey: Boolean(process.env.VAPID_PUBLIC_KEY),
    vapidPrivateKey: Boolean(process.env.VAPID_PRIVATE_KEY),
    vapidSubject: Boolean(process.env.VAPID_SUBJECT),
    cronSecret: Boolean(process.env.CRON_SECRET),
  };
  const requiredEnvOk = Object.entries(checks)
    .filter(([key]) => key !== "cronSecret")
    .every(([, value]) => value);
  let subscriptionCount: number | null = null;
  let storeError: string | null = null;

  try {
    const subscriptions = await listSubscriptions();
    subscriptionCount = subscriptions.length;
  } catch (error) {
    storeError = error instanceof Error ? error.message : "Unknown push store error";
  }

  return NextResponse.json(
    {
      ok: requiredEnvOk && !storeError,
      checks,
      subscriptionCount,
      storeError,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
