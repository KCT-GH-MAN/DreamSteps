import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  const checks = {
    supabaseUrl: Boolean(process.env.SUPABASE_URL),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    nextPublicVapidPublicKey: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    vapidPublicKey: Boolean(process.env.VAPID_PUBLIC_KEY),
    vapidPrivateKey: Boolean(process.env.VAPID_PRIVATE_KEY),
    vapidSubject: Boolean(process.env.VAPID_SUBJECT),
    cronSecret: Boolean(process.env.CRON_SECRET),
  };

  return NextResponse.json({
    ok: Object.entries(checks)
      .filter(([key]) => key !== "cronSecret")
      .every(([, value]) => value),
    checks,
  });
}
