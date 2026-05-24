import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && key ? createClient(url, key) : null;

export async function saveAnonymousSession(payload: Record<string, unknown>): Promise<boolean> {
  if (!supabase) {
    // fallback: keep locally
    try {
      const archive = JSON.parse(localStorage.getItem('myqi-archive') || '[]');
      archive.push({ ...payload, created_at: new Date().toISOString() });
      localStorage.setItem('myqi-archive', JSON.stringify(archive.slice(-50)));
    } catch {}
    return false;
  }
  const { error } = await supabase.from('sessions').insert(payload);
  return !error;
}
