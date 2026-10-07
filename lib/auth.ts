import { createClient } from "./supabase/server";

/** Refresh the Supabase session from the OAuth callback code. */
export async function exchangeCodeForSession(code: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return { error };
}

export async function getSessionUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
