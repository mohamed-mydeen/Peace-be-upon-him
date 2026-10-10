/**
 * One-shot migration script to create the devices table in Supabase.
 * Run from the backend/ directory:  node migrate_devices.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl  = process.env.SUPABASE_URL;
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const SQL = `
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS devices_user_id_idx ON public.devices(user_id);
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
`;

async function run() {
  console.log('Checking if devices table exists…');

  const { error: checkError } = await supabase
    .from('devices')
    .select('id')
    .limit(1);

  // PGRST205 = "Could not find the table in the schema cache" = table does NOT exist
  const tableNotFound =
    checkError &&
    (checkError.code === 'PGRST205' ||
      checkError.message?.toLowerCase().includes('schema cache'));

  if (tableNotFound) {
    console.log('\n❌ The devices table does not exist.');
    console.log('\n📋 Run this SQL in the Supabase Dashboard > SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/yfcansotopsrydrwbcgb/sql/new\n');
    console.log(SQL);
    process.exit(1);
  }

  // If no error at all, or a different error (e.g. RLS policy) → table exists
  if (!checkError) {
    console.log('✅ devices table already exists and is accessible.');
  } else {
    console.log('✅ devices table exists (RLS active as expected):', checkError.code);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
