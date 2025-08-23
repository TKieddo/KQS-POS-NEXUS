import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!supabaseUrl || !serviceRoleKey) {
  // Intentionally avoid throwing at import time in dev to not crash the app
  console.warn('Supabase admin client missing env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
}

export const supabaseAdmin = createClient(supabaseUrl || '', serviceRoleKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
})


