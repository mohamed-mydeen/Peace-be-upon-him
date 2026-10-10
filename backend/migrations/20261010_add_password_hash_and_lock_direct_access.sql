-- Non-destructive migration for the existing Supabase project.
-- It does not delete, recreate, or alter existing profile/history data.
-- Passwords are never stored here: only a one-way scrypt hash is stored.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Browser clients have no direct database access. The existing Express backend
-- uses its server-only service role after verifying a signed app session.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Remove the known legacy open policies. With RLS enabled and no direct client
-- policies, anon/authenticated PostgREST access is denied by default.
DROP POLICY IF EXISTS "Anyone can register" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role manages activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users read own profile" ON public.users;
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
DROP POLICY IF EXISTS "Users insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users read own history" ON public.user_activity;
DROP POLICY IF EXISTS "Users add own history" ON public.user_activity;
DROP POLICY IF EXISTS "Users update own history" ON public.user_activity;
DROP POLICY IF EXISTS "Users delete own history" ON public.user_activity;
