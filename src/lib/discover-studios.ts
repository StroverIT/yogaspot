import type { Studio, YogaClass } from "@/data/mock-data";
import type { DiscoverStudio, YogaLevel, YogaType } from "@/types/studio-discovery";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=800&auto=format&fit=crop&q=80",
] as const;

/** Map class yoga types to discover filter union */
const CLASS_TYPE_TO_DISCOVER: Partial<Record<string, YogaType>> = {
  Хатха: "Хата",
  Виняса: "Виняса",
  Ин: "Йин",
  Аштанга: "Аштанга",
  Бикрам: "Хот йога",
  Кундалини: "Кундалини",
  Ресторативна: "Релаксация",
  Пауър: "Power Yoga",
  Пренатална: "Пренатална",
  "Аеро йога": "Виняса",
};

function studioLevelFromClasses(studioId: string, classes: YogaClass[]): YogaLevel {
  const diffs = classes.filter((c) => c.studioId === studioId).map((c) => c.difficulty);
  if (diffs.length === 0) return "all";
  const set = new Set(diffs);
  if (set.size === 1) {
    if (set.has("начинаещ")) return "beginner";
    if (set.has("напреднал")) return "advanced";
    if (set.has("среден")) return "intermediate";
  }
  return "all";
}

function locationFromAddress(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 2) return `${parts[parts.length - 1]}, ${parts[0]}`;
  return address;
}

function amenitiesFromStudio(studio: Studio): DiscoverStudio["amenities"] {
  const a = studio.amenities;
  const out: DiscoverStudio["amenities"] = [];
  if (a.parking) out.push("Паркинг");
  if (a.shower) out.push("Душ");
  if (a.changingRoom) out.push("Съблекалня");
  if (a.equipmentRental) out.push("Постелки");
  return out;
}

/** YYYY-MM-DD in Europe/Sofia — matches stored class dates for “next upcoming” on the server. */
function todayYmdEuropeSofia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function nextClassForStudio(studioId: string, classes: YogaClass[]): string | undefined {
  const todayStr = todayYmdEuropeSofia();
  const list = classes
    .filter((c) => c.studioId === studioId && c.date >= todayStr)
    .sort((a, b) =>
      a.date !== b.date ? a.date.localeCompare(b.date) : a.startTime.localeCompare(b.startTime),
    );
  if (list.length === 0) return undefined;
  const c = list[0];
  return `${c.startTime} – ${c.name}`;
}

function stylesForStudio(studioId: string, classes: YogaClass[]): YogaType[] {
  const types = new Set<YogaType>();
  for (const c of classes) {
    if (c.studioId !== studioId) continue;
    const mapped = CLASS_TYPE_TO_DISCOVER[c.yogaType];
    if (mapped) types.add(mapped);
  }
  return Array.from(types);
}

function firstUsableImageUrl(images: string[] | undefined, index: number): string {
  const url = images?.find((u) => typeof u === "string" && u.trim().length > 0);
  if (url) return url.trim();
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
}

/** Build discover cards from catalog DTOs (DB-backed via `getPublicCatalog`). */
export function buildDiscoverStudiosFromPayload(studios: Studio[], classes: YogaClass[]): DiscoverStudio[] {
  return studios.map((s, index) => ({
    id: s.id,
    name: s.name,
    image: firstUsableImageUrl(s.images, index),
    rating: s.rating,
    reviewCount: s.reviewCount,
    location: locationFromAddress(s.address),
    address: s.address,
    styles: stylesForStudio(s.id, classes),
    level: studioLevelFromClasses(s.id, classes),
    amenities: amenitiesFromStudio(s),
    isHidden: false,
    createdAt: new Date(s.createdAt),
    lat: s.lat,
    lng: s.lng,
    nextClass: nextClassForStudio(s.id, classes),
  }));
}
