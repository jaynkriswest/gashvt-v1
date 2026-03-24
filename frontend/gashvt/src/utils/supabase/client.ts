import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.error("CRITICAL: Supabase URL or Anon Key is missing in .env.local")
  }

  return createBrowserClient(url!, anonKey!)
}