This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase setup

Phase 2 includes the typed Supabase browser/server clients and the initial database migration.

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` to the project URL from Supabase Project Settings > API.
3. Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the project publishable/anon key from the same page.
4. Run `supabase db push` from the project root after linking the local Supabase project, or run `supabase/migrations/202608190001_initial_schema.sql` in the Supabase SQL Editor.

Do not commit `.env.local` or service-role keys.


## AI backend

The FastAPI service lives in `backend/main.py` and powers the tutor, quiz, and study-plan screens.

1. Install backend dependencies with `C:/Users/Dharshini/AppData/Local/Programs/Python/Python314/python.exe -m pip install -r backend/requirements.txt`.
2. Add `OPENAI_API_KEY` and optionally `AI_MODEL` to `.env.local` for the backend process.
3. Start it with `C:/Users/Dharshini/AppData/Local/Programs/Python/Python314/python.exe -m uvicorn backend.main:app --reload --port 8000`.
4. Keep `NEXT_PUBLIC_AI_API_URL=http://127.0.0.1:8000` in the Next.js environment.

Without `OPENAI_API_KEY`, the backend returns a clear `503` configuration error and the frontend displays it instead of showing fake AI content.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
