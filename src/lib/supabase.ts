import { createClient } from "@supabase/supabase-js";
import { mockSupabaseClient } from "./mockSupabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Determinasi mode mock: aktif jika flag bernilai 'true' atau jika credential belum dikonfigurasi
export const isMockMode = 
  process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
  !supabaseUrl ||
  supabaseUrl.includes('placeholder') ||
  supabaseUrl.includes('dummy');

export const supabase = isMockMode
  ? (mockSupabaseClient as any)
  : createClient(supabaseUrl, supabaseAnonKey);
