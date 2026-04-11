"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, ArrowUp, ArrowDown, X } from "lucide-react";
import {
  YOGA_LEVELS,
  YOGA_TYPES,
  type YogaLevel,
  type YogaType,
} from "@/types/studio-discovery";
import type { DiscoverFiltersState } from "@/types/discover-filters";

export type { DiscoverFiltersState };

interface DiscoverFiltersProps {
  filters: DiscoverFiltersState;
  onFiltersChange: (filters: DiscoverFiltersState) => void;
  onNearMeClick: () => void;
  isLocating: boolean;
}

export function DiscoverFilters({
  filters,
  onFiltersChange,
  onNearMeClick,
  isLocating,
}: DiscoverFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleLevelChange = (value: string) => {
    onFiltersChange({ ...filters, level: value as YogaLevel | "all" });
  };

  const toggleLevelSort = () => {
    const newSort =
      filters.levelSort === null ? "asc" : filters.levelSort === "asc" ? "desc" : null;
    onFiltersChange({ ...filters, levelSort: newSort });
  };

  const toggleRatingSort = () => {
    const newSort =
      filters.ratingSort === null ? "desc" : filters.ratingSort === "desc" ? "asc" : null;
    onFiltersChange({ ...filters, ratingSort: newSort });
  };

  const toggleYogaType = (type: YogaType) => {
    const newTypes = filters.yogaTypes.includes(type)
      ? filters.yogaTypes.filter((t) => t !== type)
      : [...filters.yogaTypes, type];
    onFiltersChange({ ...filters, yogaTypes: newTypes });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      level: "all",
      levelSort: null,
      yogaTypes: [],
      ratingSort: null,
      nearMe: false,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.level !== "all" ||
    filters.yogaTypes.length > 0 ||
    filters.ratingSort !== null ||
    filters.levelSort !== null ||
    filters.nearMe;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yoga-text-soft" />
        <Input
          type="text"
          placeholder="Търси по име или адрес..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-11 bg-yoga-surface border-yoga-accent-soft focus:border-yoga-accent text-yoga-text"
        />
      </div>

      <Button
        variant={filters.nearMe ? "default" : "outline"}
        className={`w-full gap-2 ${
          filters.nearMe
            ? "bg-yoga-accent hover:bg-yoga-accent/90 text-white"
            : "border-yoga-accent-soft text-yoga-text hover:bg-yoga-accent-soft"
        }`}
        onClick={onNearMeClick}
        disabled={isLocating}
      >
        <MapPin className="w-4 h-4" />
        {isLocating
          ? "Търсене на локация..."
          : filters.nearMe
            ? "Най-близо до мен"
            : "Най-близко до мен"}
      </Button>

      <div className="space-y-2">
        <label className="text-sm font-medium text-yoga-text">Ниво</label>
        <div className="flex gap-2">
          <Select value={filters.level} onValueChange={handleLevelChange}>
            <SelectTrigger className="flex-1 border-yoga-accent-soft text-yoga-text">
              <SelectValue placeholder="Избери ниво" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички нива</SelectItem>
              {YOGA_LEVELS.filter((level) => level.value !== "all").map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleLevelSort}
            className={`border-yoga-accent-soft ${filters.levelSort ? "bg-yoga-accent-soft" : ""}`}
          >
            {filters.levelSort === "asc" ? (
              <ArrowUp className="w-4 h-4 text-yoga-accent" />
            ) : filters.levelSort === "desc" ? (
              <ArrowDown className="w-4 h-4 text-yoga-accent" />
            ) : (
              <ArrowUp className="w-4 h-4 text-yoga-text-soft" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-yoga-text">Рейтинг</label>
        <Button
          variant="outline"
          className={`w-full justify-between border-yoga-accent-soft ${
            filters.ratingSort ? "bg-yoga-accent-soft" : ""
          }`}
          onClick={toggleRatingSort}
        >
          <span className="text-yoga-text">
            {filters.ratingSort === "desc"
              ? "Най-висок първо"
              : filters.ratingSort === "asc"
                ? "Най-нисък първо"
                : "Сортирай по рейтинг"}
          </span>
          {filters.ratingSort === "desc" ? (
            <ArrowDown className="w-4 h-4 text-yoga-accent" />
          ) : filters.ratingSort === "asc" ? (
            <ArrowUp className="w-4 h-4 text-yoga-accent" />
          ) : (
            <ArrowDown className="w-4 h-4 text-yoga-text-soft" />
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-yoga-text">Тип йога</label>
        <div className="flex flex-wrap gap-2">
          {YOGA_TYPES.slice(0, 10).map((type) => (
            <Badge
              key={type}
              variant={filters.yogaTypes.includes(type) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filters.yogaTypes.includes(type)
                  ? "bg-yoga-accent text-white hover:bg-yoga-accent/90"
                  : "border-yoga-accent-soft text-yoga-text hover:bg-yoga-accent-soft"
              }`}
              onClick={() => toggleYogaType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          className="w-full text-yoga-text-soft hover:text-yoga-text hover:bg-yoga-accent-soft gap-2"
          onClick={clearFilters}
        >
          <X className="w-4 h-4" />
          Изчисти филтрите
        </Button>
      )}
    </div>
  );
}
