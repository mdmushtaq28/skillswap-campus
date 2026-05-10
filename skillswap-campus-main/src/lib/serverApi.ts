import { supabase } from "@/integrations/supabase/client";

/**
 * Wraps a `createServerFn` call with the current Supabase access token
 * so middleware (`requireSupabaseAuth`) can validate the request.
 * Server fns are typed RPCs — this just attaches the Bearer header.
 */
export async function callAuth<TResult>(
  fn: (opts: { data?: any; headers?: Record<string, string> }) => Promise<TResult>,
  data?: unknown,
): Promise<TResult> {
  const { data: s } = await supabase.auth.getSession();
  const token = s.session?.access_token;
  return fn({
    data,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  } as any);
}