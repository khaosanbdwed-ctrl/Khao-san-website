import { createClient } from '@supabase/supabase-js'
import { requireEnv } from './env'

/**
 * Anon client with no cookie binding, for public content only.
 *
 * The menu page used the SSR client from `./server`, which calls `cookies()`.
 * Reading cookies opts a route out of static rendering entirely, so `export
 * const revalidate` on that page was silently doing nothing and all three menu
 * queries ran on every single request. The menu is public data — RLS grants
 * anon SELECT on all three tables — so there is nothing to bind a session to.
 *
 * Use `./server` when the request's session actually matters, and this when the
 * content is the same for everyone.
 */
export const createPublicClient = () =>
  createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    { auth: { persistSession: false } },
  )
