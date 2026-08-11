import { createClient } from '@supabase/supabase-js'
import { requireEnv } from './env'

export const createAdminClient = () =>
  createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  )
