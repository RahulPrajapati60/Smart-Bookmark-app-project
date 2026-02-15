# Smart Bookmark App

A simple, private, real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.  
Users can sign in with Google, add/delete bookmarks, and see updates instantly across tabs — all bookmarks are 100% private to each user.

**Live Demo:** smart-bookmark-app-project.vercel.app  

**GitHub Repo:** https://github.com/RahulPrajapati60/Smart-Bookmark-app-project.git

## Features (All Requirements Met)

1. Google OAuth login only (no email/password)
2. Logged-in user can add bookmark (title + URL)
3. Bookmarks are private per user (RLS enforced)
4. Realtime updates across tabs 
5. Delete own bookmarks
6. Deployed on Vercel with live URL

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- Supabase (Auth, PostgreSQL, Realtime)
- Tailwind CSS
- Deployed on Vercel

## Problems Faced & How I Solved Them

| # | Problem | Description | How Solved |
|---|---------|-------------|------------|
| 1 | Vercel build fail: "createMiddlewareClient not exported from @supabase/ssr" | Old deprecated helper used in middleware | Replaced with `createServerClient` + manual cookie handling (request.cookies & response.cookies) |
| 2 | "cookies().getAll is not a function" / "cookies() returns a Promise" | Next.js 15+ makes cookies() async | Used `await cookies()` and `getAll()/setAll()` pattern in middleware & layout |
| 3 | Blank page after login | Session not persisting or hydration mismatch | Fixed layout with await cookies() + client-side session check + safe redirect |
| 4 | Realtime not working  | Subscription status CLOSED / CHANNEL_ERROR / mismatch bindings | Added `supabase.realtime.setAuth(session.access_token)` before subscribing + filtered by user_id |
| 5 | 403 Forbidden on add/select/delete | RLS blocking requests | Created correct policies: `auth.uid() = user_id` for SELECT/INSERT/DELETE (authenticated role only) |
| 6 | "mismatch between server and client bindings for postgres changes" | Realtime events dropped | Explicitly set auth token for realtime on session load/change |
| 7 | Google login not redirecting / flow state expired | Callback URL mismatch | Ensured exact `redirectTo` + added Vercel URL in Google Console & Supabase settings |

## How to Run Locally

1. Clone repo
   ```bash
   git clone https://github.com/RahulPrajapati60/Smart-Bookmark-app-project.git
   cd Smart-Bookmark-app
