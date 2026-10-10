-- Non-destructive migration: anonymous device identity and user counter.
-- Never drops, recreates, or alters existing tables or data.

-- 1. Devices table — one row per unique device installation.
--    No personal data: only a client-generated UUID and timestamp.
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY,           -- Client-generated device UUID (crypto.randomUUID)
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Index for fast lookup
CREATE INDEX IF NOT EXISTS devices_user_id_idx ON public.devices(user_id);

-- 3. Row Level Security — direct PostgREST access blocked (same as other tables)
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
-- No client-facing policies: all writes go through the Express service-role backend.
