"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/desk");
  }, [router]);
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <p style={{ color: "var(--color-ink-muted)" }}>正在进入档案馆…</p>
    </div>
  );
}
