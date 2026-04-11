import type { Studio } from "@/data/mock-data";

/** Prefer stored gallery URLs; otherwise rotate across bundled homepage placeholders (mock ids used `s1`…`s6` → static files). */
export function getStudioCoverSrc(studio: Studio): string {
  for (const u of studio.images ?? []) {
    const raw = typeof u === "string" ? u.trim() : "";
    if (!raw) continue;
    if (raw.startsWith("//")) return `https:${raw}`;
    if (raw.startsWith("/") || /^https?:\/\//i.test(raw)) return raw;
  }
  const n = ([...studio.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 6) + 1;
  return `/homepage/studio-${n}.jpg`;
}
