import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

if (SUPABASE_URL === "https://placeholder.supabase.co" || SUPABASE_SERVICE_ROLE_KEY === "placeholder-key") {
  console.warn("[Supabase Admin] Running with placeholder credentials.");
}

export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    storage: undefined,
    persistSession: false,
    autoRefreshToken: false,
  }
});
