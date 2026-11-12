/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FilterBar } from '../catalog/FilterBar';
import { ProductCard } from '../catalog/ProductCard';
import { CategoryInfo, Product, SortOption, PriceRangeOption } from '../../types';
import { MessageSquare, PackageSearch, RefreshCw } from 'lucide-react';
import { generateWhatsAppInquiryUrl } from '../../utils/formatters';

interface CatalogPageProps {
  products: Product[];
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
  onOpenDetails: (product: Product) => void;
  onResetFilters: () => void;
  allAvailableProducts: Product[];
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
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
  onOpenDetails,
  onResetFilters,
  allAvailableProducts,
}) => {
  const customInquiryUrl = generateWhatsAppInquiryUrl("Recherche d'un article spécifique hors catalogue");

  return (
    <div className="py-8 md:py-16 bg-[#afbdc5] min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Header Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-slate-200 shadow-2xl">
          <div className="max-w-2xl">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#1769FF]">
              Boutique Officielle · Togo
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Catalogue Nantor's Electronics
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-light">
              Explorez notre gamme complète d'accessoires pour smartphones, ordinateurs et équipements du quotidien. 
              Commandez en ligne ou échangez avec notre équipe sur WhatsApp. Le règlement s'effectue à la livraison.
            </p>
          </div>

          {/* Filter Bar Component */}
          <div className="mt-6 pt-5 sm:mt-8 sm:pt-6 border-t border-slate-100">
            <FilterBar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              sortBy={sortBy}
              onSortChange={onSortChange}
              priceRange={priceRange}
              onPriceRangeChange={onPriceRangeChange}
              inStockOnly={inStockOnly}
              onToggleInStock={onToggleInStock}
              totalResults={products.length}
              allAvailableProducts={allAvailableProducts}
              onResetFilters={onResetFilters}
            />
          </div>
        </div>

        {/* 5. Mobile 2-column Grid (grid-cols-2), Desktop 3-column Grid (lg:grid-cols-3) */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-[#1769FF]/10 text-[#1769FF] rounded-2xl flex items-center justify-center mx-auto border border-[#1769FF]/20">
              <PackageSearch className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Aucun produit ne correspond à vos critères
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Essayez de modifier votre mot-clé de recherche ou sélectionnez une autre catégorie pour afficher nos articles disponibles.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onResetFilters}
                className="px-4 py-2.5 bg-[#1769FF] text-white text-xs font-bold rounded-xl hover:bg-[#0f56d9] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Afficher tout le catalogue</span>
              </button>

              <a
                href={customInquiryUrl}
                target={customInquiryUrl.startsWith('#') ? undefined : '_blank'}
                rel={customInquiryUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
                className="px-4 py-2.5 bg-slate-100 text-slate-900 text-xs font-medium rounded-xl hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#1769FF]" />
                <span>Demander sur WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
