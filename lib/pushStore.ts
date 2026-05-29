import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type webpush from "web-push";

export type StoredPushSubscription = {
  endpoint: string;
  subscription: webpush.PushSubscription;
  reminderTime: string;
  morningReminderTime: string;
  eveningReflectionTime: string;
  reengageAfterDays: number;
  timezone: string;
  language: "vi" | "en";
  lastSentDate: string | null;
  lastMorningSentDate: string | null;
  lastEveningSentDate: string | null;
  lastReengageSentDate: string | null;
  lastSeenAt: string;
  updatedAt: string;
};

type PushSubscriptionRow = {
  endpoint: string;
  subscription: webpush.PushSubscription;
  reminder_time: string;
  morning_reminder_time: string | null;
  evening_reflection_time: string | null;
  reengage_after_days: number | null;
  timezone: string;
  language: "vi" | "en";
  last_sent_date: string | null;
  last_morning_sent_date: string | null;
  last_evening_sent_date: string | null;
  last_reengage_sent_date: string | null;
  last_seen_at: string | null;
  updated_at: string;
};

const STORE_DIR = path.join(process.cwd(), ".dreamsteps");
const STORE_PATH = path.join(STORE_DIR, "push-subscriptions.json");
const SUPABASE_TABLE = "push_subscriptions";

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return {
    restUrl: `${normalizeSupabaseUrl(url)}/rest/v1/${SUPABASE_TABLE}`,
    serviceRoleKey,
  };
}

function toStoredSubscription(row: PushSubscriptionRow): StoredPushSubscription {
  return {
    endpoint: row.endpoint,
    subscription: row.subscription,
    reminderTime: row.reminder_time,
    morningReminderTime: row.morning_reminder_time ?? "06:00",
    eveningReflectionTime: row.evening_reflection_time ?? row.reminder_time ?? "21:00",
    reengageAfterDays: row.reengage_after_days ?? 3,
    timezone: row.timezone,
    language: row.language,
    lastSentDate: row.last_sent_date,
    lastMorningSentDate: row.last_morning_sent_date,
    lastEveningSentDate: row.last_evening_sent_date ?? row.last_sent_date,
    lastReengageSentDate: row.last_reengage_sent_date,
    lastSeenAt: row.last_seen_at ?? row.updated_at,
    updatedAt: row.updated_at,
  };
}

function toSupabaseRow(
  item: Omit<StoredPushSubscription, "endpoint" | "updatedAt">
) {
  return {
    endpoint: item.subscription.endpoint,
    subscription: item.subscription,
    reminder_time: item.reminderTime,
    morning_reminder_time: item.morningReminderTime,
    evening_reflection_time: item.eveningReflectionTime,
    reengage_after_days: item.reengageAfterDays,
    timezone: item.timezone,
    language: item.language,
    last_sent_date: item.lastSentDate,
    last_morning_sent_date: item.lastMorningSentDate,
    last_evening_sent_date: item.lastEveningSentDate,
    last_reengage_sent_date: item.lastReengageSentDate,
    last_seen_at: item.lastSeenAt,
    updated_at: new Date().toISOString(),
  };
}

async function supabaseRequest(path = "", init: RequestInit = {}) {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Supabase is not configured");
  }

  const response = await fetch(`${config.restUrl}${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${message}`);
  }

  return response;
}

async function readFileStore(): Promise<StoredPushSubscription[]> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is StoredPushSubscription => {
      return (
        item &&
        typeof item.endpoint === "string" &&
        item.subscription &&
        typeof item.subscription.endpoint === "string" &&
        typeof item.reminderTime === "string" &&
        typeof item.morningReminderTime === "string" &&
        typeof item.eveningReflectionTime === "string" &&
        typeof item.reengageAfterDays === "number" &&
        typeof item.timezone === "string" &&
        (item.language === "vi" || item.language === "en")
      );
    });
  } catch {
    return [];
  }
}

async function writeFileStore(items: StoredPushSubscription[]) {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(items, null, 2), "utf8");
}

async function upsertFileSubscription(
  item: Omit<StoredPushSubscription, "endpoint" | "updatedAt">
) {
  const items = await readFileStore();
  const endpoint = item.subscription.endpoint;
  const nextItem: StoredPushSubscription = {
    ...item,
    endpoint,
    updatedAt: new Date().toISOString(),
  };
  const nextItems = [
    ...items.filter((existing) => existing.endpoint !== endpoint),
    nextItem,
  ];

  await writeFileStore(nextItems);
  return nextItem;
}

export async function upsertSubscription(
  item: Omit<StoredPushSubscription, "endpoint" | "updatedAt">
) {
  if (!getSupabaseConfig()) {
    return upsertFileSubscription(item);
  }

  const row = toSupabaseRow(item);

  await supabaseRequest("?on_conflict=endpoint", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(row),
  });

  return {
    endpoint: row.endpoint,
    subscription: row.subscription,
    reminderTime: row.reminder_time,
    timezone: row.timezone,
    language: row.language,
    lastSentDate: row.last_sent_date,
    updatedAt: row.updated_at,
  };
}

export async function removeSubscription(endpoint: string) {
  if (!getSupabaseConfig()) {
    const items = await readFileStore();
    await writeFileStore(items.filter((item) => item.endpoint !== endpoint));
    return;
  }

  await supabaseRequest(`?endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: "DELETE",
  });
}

export async function listSubscriptions() {
  if (!getSupabaseConfig()) {
    return readFileStore();
  }

  const response = await supabaseRequest(
    "?select=endpoint,subscription,reminder_time,morning_reminder_time,evening_reflection_time,reengage_after_days,timezone,language,last_sent_date,last_morning_sent_date,last_evening_sent_date,last_reengage_sent_date,last_seen_at,updated_at",
    {
      method: "GET",
    }
  );
  const rows = (await response.json()) as PushSubscriptionRow[];

  return rows.map(toStoredSubscription);
}

export async function markSubscriptionSent(endpoint: string, date: string) {
  return markSubscriptionNotificationSent(endpoint, "evening", date);
}

export async function markSubscriptionNotificationSent(
  endpoint: string,
  type: "morning" | "evening" | "reengage",
  date: string
) {
  const dateFieldByType = {
    morning: "lastMorningSentDate",
    evening: "lastEveningSentDate",
    reengage: "lastReengageSentDate",
  } as const;
  const dbDateFieldByType = {
    morning: "last_morning_sent_date",
    evening: "last_evening_sent_date",
    reengage: "last_reengage_sent_date",
  } as const;

  if (!getSupabaseConfig()) {
    const items = await readFileStore();

    await writeFileStore(
      items.map((item) =>
        item.endpoint === endpoint
          ? {
              ...item,
              [dateFieldByType[type]]: date,
              lastSentDate: type === "evening" ? date : item.lastSentDate,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
    return;
  }

  await supabaseRequest(`?endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: "PATCH",
    body: JSON.stringify({
      [dbDateFieldByType[type]]: date,
      ...(type === "evening" ? { last_sent_date: date } : {}),
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function markSubscriptionSeen(endpoint: string) {
  const now = new Date().toISOString();

  if (!getSupabaseConfig()) {
    const items = await readFileStore();

    await writeFileStore(
      items.map((item) =>
        item.endpoint === endpoint
          ? {
              ...item,
              lastSeenAt: now,
              updatedAt: now,
            }
          : item
      )
    );
    return;
  }

  await supabaseRequest(`?endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: "PATCH",
    body: JSON.stringify({
      last_seen_at: now,
      updated_at: now,
    }),
  });
}
