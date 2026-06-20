import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : process.env.SUPABASE_URL) || "https://placeholder.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY : process.env.SUPABASE_PUBLISHABLE_KEY) || "placeholder-key";

if (SUPABASE_URL === "https://placeholder.supabase.co" || SUPABASE_PUBLISHABLE_KEY === "placeholder-key") {
  console.warn("[Supabase] Running with placeholder credentials. Please check your .env configuration.");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
