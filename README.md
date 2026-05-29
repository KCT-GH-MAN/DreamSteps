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

Push reminders use Web Push VAPID keys, Supabase storage, and a Vercel Cron job.

1. Create a Supabase project.
2. Run `supabase/push_subscriptions.sql` in the Supabase SQL editor.
3. Add the variables from `.env.example` to Vercel Project Settings.
4. Deploy to Vercel.
5. Vercel Cron will call `/api/push/reminders` every 10 minutes.

Local development falls back to `.dreamsteps/push-subscriptions.json` if Supabase env vars are empty.
