import webpush from "web-push";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:hello@dreamsteps.local";

export function getVapidPublicKey() {
  return publicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}

export function configureWebPush() {
  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}
