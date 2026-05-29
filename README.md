# DreamSteps

DreamSteps is a calm habit, focus, reflection, and progress companion built with Next.js.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run test:e2e
npm run build
```

## Push Reminders

Push reminders use Web Push VAPID keys, Supabase storage, and a scheduled request to the reminder endpoint.

1. Create a Supabase project.
2. Run `supabase/push_subscriptions.sql` in the Supabase SQL editor.
3. Add the variables from `.env.example` to Vercel Project Settings.
4. Deploy to Vercel.
5. On Vercel Hobby, use an external cron service to call `/api/push/reminders` every 10 minutes. Vercel Cron on Hobby only supports once-per-day schedules.

Local development falls back to `.dreamsteps/push-subscriptions.json` if Supabase env vars are empty.
