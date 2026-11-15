# Shared feedback setup

1. Create or choose a Supabase project.
2. In its SQL Editor, run [`feedbacks.sql`](./feedbacks.sql). The table permits public reads and inserts, and does not permit public updates or deletes.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` plus `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project's Connect/API settings. A publishable key (or legacy anon key) is intended for browser use. Never put a secret or service-role key in a `NEXT_PUBLIC_` variable.
4. Rebuild and deploy the static site so the public browser configuration is included.

The site calls Supabase's REST endpoint directly because this project is a static export and has no server API routes. Row-level security is enabled by the SQL script. Public inserts are intentional for this feedback feature.
