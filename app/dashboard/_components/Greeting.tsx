"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";

/** Time-aware greeting using the viewer's local timezone (not the server's). */
export default function Greeting({ name, dateStr }: { name: string; dateStr: string }) {
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);
  return <Header title={`${greeting}, ${name.split(" ")[0]}`} subtitle={dateStr} />;
}
