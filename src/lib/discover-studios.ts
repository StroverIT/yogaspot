import { mockStudios, mockClasses } from "@/data/mock-data";
import type { DiscoverStudio, YogaLevel, YogaType } from "@/types/studio-discovery";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=800&auto=format&fit=crop&q=80",
] as const;

/** Map mock class yoga types to discover filter union */
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

function studioLevelFromClasses(studioId: string): YogaLevel {
  const diffs = mockClasses.filter((c) => c.studioId === studioId).map((c) => c.difficulty);
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

function amenitiesFromMock(studio: (typeof mockStudios)[0]): DiscoverStudio["amenities"] {
  const a = studio.amenities;
  const out: DiscoverStudio["amenities"] = [];
  if (a.parking) out.push("Паркинг");
  if (a.shower) out.push("Душ");
  if (a.changingRoom) out.push("Съблекалня");
  if (a.equipmentRental) out.push("Постелки");
  return out;
}

function nextClassForStudio(studioId: string): string | undefined {
  const classes = mockClasses.filter((c) => c.studioId === studioId);
  if (classes.length === 0) return undefined;
  const c = classes[0];
  return `${c.startTime} - ${c.name}`;
}

function stylesForStudio(studioId: string): YogaType[] {
  const types = new Set<YogaType>();
  for (const c of mockClasses) {
    if (c.studioId !== studioId) continue;
    const mapped = CLASS_TYPE_TO_DISCOVER[c.yogaType];
    if (mapped) types.add(mapped);
  }
  return Array.from(types);
}

export function buildDiscoverStudios(): DiscoverStudio[] {
  return mockStudios.map((s, index) => ({
    id: s.id,
    name: s.name,
    image: s.images[0] ?? PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length],
    rating: s.rating,
    reviewCount: s.reviewCount,
    location: locationFromAddress(s.address),
    address: s.address,
    styles: stylesForStudio(s.id),
    level: studioLevelFromClasses(s.id),
    amenities: amenitiesFromMock(s),
    views: 1000 + index * 120,
    bookings: 200 + index * 40,
    isHidden: false,
    createdAt: new Date(s.createdAt),
    lat: s.lat,
    lng: s.lng,
    nextClass: nextClassForStudio(s.id),
  }));
}

export const allDiscoverStudios: DiscoverStudio[] = buildDiscoverStudios();
