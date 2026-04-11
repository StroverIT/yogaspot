export type YogaLevel = "beginner" | "intermediate" | "advanced" | "all";

export type YogaType =
  | "Хата"
  | "Виняса"
  | "Аштанга"
  | "Кундалини"
  | "Йин"
  | "Power Yoga"
  | "Хот йога"
  | "Медитация"
  | "Пранаяма"
  | "Йога за начинаещи"
  | "Пренатална"
  | "Йога нидра"
  | "Релаксация"
  | "Терапевтична йога"
  | "Beach Yoga"
  | "Детска йога";

export type Amenity =
  | "Паркинг"
  | "Душ"
  | "Съблекалня"
  | "Заключващи шкафчета"
  | "Постелки"
  | "Кърпи"
  | "Вода"
  | "Кафене"
  | "WiFi"
  | "Климатик"
  | "Магазин"
  | "Детски кът";

export interface DiscoverStudio {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  address: string;
  distance?: string;
  nextClass?: string;
  styles: YogaType[];
  level: YogaLevel;
  amenities: Amenity[];
  isHidden: boolean;
  createdAt: Date;
  lat: number;
  lng: number;
}

export const YOGA_LEVELS: { value: YogaLevel; label: string }[] = [
  { value: "beginner", label: "Начинаещи" },
  { value: "intermediate", label: "Средно ниво" },
  { value: "advanced", label: "Напреднали" },
  { value: "all", label: "Всички нива" },
];

export const YOGA_TYPES: YogaType[] = [
  "Хата",
  "Виняса",
  "Аштанга",
  "Кундалини",
  "Йин",
  "Power Yoga",
  "Хот йога",
  "Медитация",
  "Пранаяма",
  "Йога за начинаещи",
  "Пренатална",
  "Йога нидра",
  "Релаксация",
  "Терапевтична йога",
  "Beach Yoga",
  "Детска йога",
];
