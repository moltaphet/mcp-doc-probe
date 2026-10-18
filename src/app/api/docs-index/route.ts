import { NextResponse } from "next/server";
import { DOC_FALLBACK, LLMS_URL } from "@/lib/audit-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(LLMS_URL, { signal: AbortSignal.timeout(6500), next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`llms.txt returned HTTP ${response.status}`);
    const text = await response.text();
    const links = [...text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)];
    const live = links.map((match) => {
      const url = match[2];
      const path = url.replace(/[?#].*$/, "").replace(/\.md$/, "");
      const parts = path.replace("https://docs.pharos.xyz/", "").split("/");
      const section = parts[0] || "Documentation";
      return { title: match[1], url: path, section, category: section.replace(/-/g, " "), source: "live" };
    }).filter((entry) => entry.url.includes("docs.pharos.xyz"));
    if (!live.length) throw new Error("No documentation links found in llms.txt");
    return NextResponse.json({ source: "live", fetchedAt: new Date().toISOString(), count: live.length, entries: live, raw: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown index fetch error";
    return NextResponse.json({ source: "curated-fallback", fetchedAt: new Date().toISOString(), count: DOC_FALLBACK.length, entries: DOC_FALLBACK.map((entry) => ({ ...entry, source: "fallback" })), error: message });
  }
}
