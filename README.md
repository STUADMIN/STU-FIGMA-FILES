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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Auth setup (Supabase + GitHub)

1) Create a Supabase project at https://supabase.com
2) In Supabase, go to Authentication → Providers → GitHub and enable it.
   - Set Authorization callback URL to: `http://localhost:3000/auth/callback`
   - Copy Client ID and Client Secret from your GitHub OAuth App into Supabase
3) Copy `.env.local.example` to `.env.local` and fill:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4) Install deps and run the app:

```
npm install
npm run dev
```

5) Visit `http://localhost:3000/login` and click "Continue with GitHub".

- Middleware automatically keeps your session fresh.
- `/protected` requires an authenticated user and will redirect to `/login` if not signed in.

## Seeding Supabase (organizations + people + Lisa auth user)

1) Open your project: https://supabase.com/dashboard/project/gnkxmrkqatofrrvkprxe
2) Go to SQL → New query.
3) Copy the contents of `supabase/seed.sql` from this repo and paste into the editor.
4) Click Run. It will:
   - Create `public.organizations` and `public.people`
   - Insert your provided organizations and people
   - Create the auth user `lisa.terry@stu.com` with password `Qwertyuiop1!` (email confirmed)
5) Optional: To add Timmy as an auth user, uncomment the block at the end and set the email you want, then Run again.

You can verify rows under Table Editor → `organizations` / `people`, and check Lisa under Authentication → Users.
