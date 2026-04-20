import { createClient } from '@supabase/supabase-js';

// Service-role client: bypasses RLS. Use only in server-side code that
// cannot supply a user JWT (webhooks, background jobs).
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
