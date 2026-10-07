import { createClient } from "./supabase/server";

function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Refresh the Supabase session from the OAuth callback code. */
export async function exchangeCodeForSession(code: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return { error };
}

/** Returns the signed-in user, or null in demo mode / when signed out. */
export async function getSessionUser() {
  if (!configured()) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
