/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Search, X, ArrowUpDown, Tag, Coins } from "lucide-react";
import {
  CategoryInfo,
  Product,
  SortOption,
  PriceRangeOption,
} from "../../types";

interface FilterBarProps {
  categories: CategoryInfo[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  priceRange: PriceRangeOption;
  onPriceRangeChange: (range: PriceRangeOption) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  totalResults: number;
  allAvailableProducts: Product[];
  onResetFilters: () => void;
}

const SUGGESTED_SEARCH_TAGS = [
  "GaN 65W",
  "USB-C",
  "iPhone",
  "MacBook",
  "MagSafe",
  "Écouteurs",
];

const BUDGET_OPTIONS: { id: PriceRangeOption; label: string }[] = [
  { id: "all", label: "Tous les budgets" },
  { id: "under-15k", label: "< 15 000 FCFA" },
  { id: "15k-30k", label: "15 000 – 30 000 FCFA" },
  { id: "over-30k", label: "> 30 000 FCFA" },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  inStockOnly,
  onToggleInStock,
  totalResults,
  allAvailableProducts,
  onResetFilters,
}) => {
  // Only display search suggestion tags that actually match at least one available product
  const relevantSearchTags = useMemo(() => {
    return SUGGESTED_SEARCH_TAGS.filter((tag) => {
      const q = tag.toLowerCase().trim();
      return allAvailableProducts.some((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.shortDescription &&
            p.shortDescription.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.features && p.features.some((f) => f.toLowerCase().includes(q))) ||
          (p.specifications &&
            Object.values(p.specifications).some((val) =>
              val.toLowerCase().includes(q),
            ))
        );
      });
    });
  }, [allAvailableProducts]);

  const isFiltered =
    selectedCategory !== "all" ||
    searchQuery.trim() !== "" ||
    priceRange !== "all" ||
    inStockOnly;

  return (
    <div className="space-y-4 text-slate-900">
      {/* Top Search & Utilities Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input with functional icon and clear button */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un chargeur, câble, casque, hub..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-white text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1769FF] focus:ring-1 focus:ring-[#1769FF] transition-colors placeholder:text-slate-400 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 cursor-pointer"
              title="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & In-Stock Controls */}
        <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-end md:self-auto justify-between sm:justify-start">
          {/* In stock toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 select-none shadow-sm hover:border-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onToggleInStock(e.target.checked)}
              className="w-4 h-4 accent-[#1769FF] rounded cursor-pointer"
            />
            <span className="whitespace-nowrap">En stock</span>
          </label>

          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              aria-label="Trier les produits"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full sm:w-auto appearance-none pl-3.5 pr-8 py-2.5 text-xs font-medium text-slate-700 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-[#1769FF] shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="featured" className="bg-white text-slate-900">
                Sélection vedette
              </option>
              <option value="newest" className="bg-white text-slate-900">
                Nouveautés d'abord
              </option>
              <option value="price-asc" className="bg-white text-slate-900">
                Prix croissant
              </option>
              <option
                value="price-desc"
                className="bg-white text-slate-900"
              >
                Prix décroissant
              </option>
              <option value="name-asc" className="bg-white text-slate-900">
                Nom (A-Z)
              </option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 1. Quick Search Suggestions Tags */}
      {relevantSearchTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1 uppercase tracking-wider">
            <Tag className="w-3 h-3 text-[#1769FF]" />
            <span>Recherches rapides :</span>
          </span>
          {relevantSearchTags.map((tag) => {
            const isTagActive =
              searchQuery.trim().toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (isTagActive) {
                    onSearchChange("");
                  } else {
                    onSearchChange(tag);
                  }
                }}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all font-medium cursor-pointer ${
                  isTagActive
                    ? "bg-[#1769FF] text-white font-bold shadow-[0_2px_10px_rgba(23,105,255,0.16)]"
                    : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-100"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Category Segmented Buttons with Real Product Counts & 6. Mobile Gradient Hint */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pr-8 md:pr-0">
          <button
            onClick={() => onSelectCategory("all")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#1769FF] text-white font-bold shadow-[0_2px_10px_rgba(23,105,255,0.16)]"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
            }`}
          >
            Tous les produits ({allAvailableProducts.length})
          </button>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            const categoryCount = allAvailableProducts.filter(
              (p) => p.category === cat.slug,
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1769FF] text-white font-bold shadow-[0_2px_10px_rgba(23,105,255,0.16)]"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat.name} ({categoryCount})
              </button>
            );
          })}
        </div>

        {/* 6. Subtle mobile fade gradient to signal horizontal scrollability */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white via-[#141414]/80 to-transparent md:hidden z-10" />
      </div>

      {/* 3. Budget Filters Row (Can be combined with category and search) */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1 uppercase tracking-wider">
          <Coins className="w-3 text-[#1769FF]" />
          <span>Budget FCFA :</span>
        </span>
        {BUDGET_OPTIONS.map((opt) => {
          const isSelected = priceRange === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onPriceRangeChange(opt.id)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all font-medium cursor-pointer ${
                isSelected
                  ? "bg-[#1769FF] text-white font-bold shadow-xs"
                  : "bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Filter status strip with reset button */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          <span className="font-semibold text-slate-900">{totalResults}</span>{" "}
          {totalResults > 1 ? "produits disponibles" : "produit disponible"}
        </span>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="text-xs text-[#1769FF] hover:text-slate-900 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Réinitialiser les filtres</span>
          </button>
        )}
      </div>
    </div>
  );
};
