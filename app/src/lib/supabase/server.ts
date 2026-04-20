import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-side client uses the service role key so Clerk-authenticated routes
// can read/write without needing a Supabase JWT template. All callers must
// verify the Clerk userId before calling Supabase.
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
