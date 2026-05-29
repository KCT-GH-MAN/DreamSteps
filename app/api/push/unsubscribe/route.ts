import { NextResponse } from "next/server";
import { removeSubscription } from "@/lib/pushStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();

  if (typeof body?.endpoint !== "string") {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  await removeSubscription(body.endpoint);
  return NextResponse.json({ ok: true });
}
