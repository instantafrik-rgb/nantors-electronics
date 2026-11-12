/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { FilterBar } from "../catalog/FilterBar";
import { ProductCard } from "../catalog/ProductCard";
import { CategoryInfo, Product, SortOption, PriceRangeOption } from "../../types";
import { MessageSquare, PackageSearch, RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import { generateWhatsAppInquiryUrl } from "../../utils/formatters";

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

export const CatalogPage: React.FC<CatalogPageProps> = (props) => {
  const { products, categories, selectedCategory, onSelectCategory, searchQuery, onSearchChange, sortBy, onSortChange, priceRange, onPriceRangeChange, inStockOnly, onToggleInStock, onOpenDetails, onResetFilters, allAvailableProducts } = props;
  const inquiryUrl = generateWhatsAppInquiryUrl("Bonjour, je recherche un accessoire qui ne figure pas dans le catalogue.");
  const activeCategory = categories.find((category) => category.slug === selectedCategory);

  return (
    <main className="nantor-catalog-page">
      <div className="nantor-catalog-shell">
        <section className="nantor-catalog-intro">
          <div className="nantor-catalog-intro-copy">
            <span className="nantor-section-kicker"><Sparkles size={14} /> L'expérience Nantor's</span>
            <h1>Tout ce qu'il faut.<br /><span>Rien de superflu.</span></h1>
            <p>Explorez notre sélection d'accessoires tech pensés pour accompagner votre quotidien. Trouvez votre prochain essentiel en quelques clics.</p>
            <div className="nantor-catalog-points"><span>✳ Sélection utile</span><span>✳ Prix en FCFA</span><span>✳ Paiement à la livraison</span></div>
          </div>
          <div className="nantor-catalog-art" aria-hidden="true">
            <div className="nantor-art-disc nantor-art-disc-one" />
            <div className="nantor-art-disc nantor-art-disc-two" />
            <div className="nantor-art-label">N. / EVERYDAY TECH</div>
            <div className="nantor-art-caption">Find your<br />next essential.</div>
          </div>
        </section>

        <section className="nantor-catalog-controls">
          <div className="nantor-catalog-section-head">
            <div><span className="nantor-section-kicker">À découvrir</span><h2>{activeCategory?.name || "Tous les produits"}</h2></div>
            <span className="nantor-catalog-count">{products.length} résultat{products.length > 1 ? "s" : ""}</span>
          </div>
          <FilterBar categories={categories} selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} searchQuery={searchQuery} onSearchChange={onSearchChange} sortBy={sortBy} onSortChange={onSortChange} priceRange={priceRange} onPriceRangeChange={onPriceRangeChange} inStockOnly={inStockOnly} onToggleInStock={onToggleInStock} totalResults={products.length} allAvailableProducts={allAvailableProducts} onResetFilters={onResetFilters} />
        </section>

        {products.length > 0 ? (
          <section className="nantor-catalog-products" aria-label="Produits">
            {products.map((product) => <ProductCard key={product.id} product={product} onOpenDetails={onOpenDetails} />)}
          </section>
        ) : (
          <section className="nantor-catalog-empty">
            <div className="nantor-empty-icon"><PackageSearch size={28} /></div>
            <h3>Aucun produit trouvé pour le moment</h3>
            <p>Essayez un autre mot-clé ou élargissez vos filtres pour découvrir notre sélection.</p>
            <div><button type="button" onClick={onResetFilters}><RefreshCw size={15} /> Réinitialiser les filtres</button><a href={inquiryUrl} target="_blank" rel="noopener noreferrer"><MessageSquare size={15} /> Demander un produit <ArrowRight size={14} /></a></div>
          </section>
        )}
      </div>
    </main>
  );
};
