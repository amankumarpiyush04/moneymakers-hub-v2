const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// Admin client — has service role, used server-side only
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { 
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws }
  }
);

// Anon client — used for verifying user tokens
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    realtime: { transport: ws }
  }
);

module.exports = { supabase, supabaseAdmin };

