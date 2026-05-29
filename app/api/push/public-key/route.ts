import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/pushServer";

export function GET() {
  return NextResponse.json({
    publicKey: getVapidPublicKey(),
  });
}
