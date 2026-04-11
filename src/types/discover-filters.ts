import type { YogaLevel, YogaType } from "@/types/studio-discovery";

export interface DiscoverFiltersState {
  search: string;
  level: YogaLevel | "all";
  levelSort: "asc" | "desc" | null;
  yogaTypes: YogaType[];
  ratingSort: "asc" | "desc" | null;
  nearMe: boolean;
}
