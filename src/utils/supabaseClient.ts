import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase URL or SERVICE_ROLE_KEY not configured. Upload endpoints will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
