/**
 * URL and anon/publishable key for Supabase browser + server + middleware.
 * Publishing key (sb_publishable_...) and legacy JWT anon are both accepted by @supabase/supabase-js.
 * Use ANON as fallback if only one var is set in .env.local.
 */
export function getSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
}

export function getSupabaseKey(): string {
  return (
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim() ||
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  );
}
