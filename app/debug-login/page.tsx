"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
export default function DebugLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  async function go() {
    setErr("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    else router.push(params.get("next") || "/dashboard");
  }
  return (
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h1>Debug login (temporary)</h1>
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: "block", width: "100%", margin: "12px 0", padding: 8 }} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: "block", width: "100%", margin: "12px 0", padding: 8 }} />
      <button onClick={go} style={{ padding: "8px 24px" }}>Sign in</button>
      {err && <p style={{ color: "red" }}>{err}</p>}
    </div>
  );
}
