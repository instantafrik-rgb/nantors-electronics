/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ArrowRight,
  MessageSquare,
  Sparkles,
  Flame,
  Clock,
} from "lucide-react";
import { HeroBanner } from "../home/HeroBanner";
import { CategoryGrid } from "../home/CategoryGrid";
import { ProductSpotlight } from "../home/ProductSpotlight";
import { ProductCard } from "../catalog/ProductCard";
import { CategoryInfo, Product } from "../../types";
import { generateWhatsAppInquiryUrl } from "../../utils/formatters";

interface HomePageProps {
  products: Product[];
  featuredProducts: Product[];
  categories: CategoryInfo[];
  onOpenDetails: (product: Product) => void;
  onNavigate: (
    page: "home" | "catalog" | "about" | "contact" | "admin",
  ) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  featuredProducts,
  categories,
  onOpenDetails,
  onNavigate,
  onSelectCategory,
}) => {
  // Tab state: 'incontournables' vs 'nouveautes'
  const [activeTab, setActiveTab] = useState<"incontournables" | "nouveautes">(
    "incontournables",
  );

  // Filter available products
  const availableProducts = products.filter((p) => p.isAvailable);

  // Incontournables: featured items, or top items
  const incontournables =
    featuredProducts.length > 0
      ? featuredProducts.slice(0, 6)
      : availableProducts.slice(0, 6);

  // Nouveautés: newest first sorted by createdAt
  const nouveautes = [...availableProducts]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  // Active collection to render
  const currentCollection =
    activeTab === "incontournables" ? incontournables : nouveautes;

  // Real Spotlight Product: first featured item or first available item
  const spotlightProduct = incontournables[0] || availableProducts[0] || null;

  // Dynamic minimum price for Hero Banner computed from available catalog products
  const minPrice =
    availableProducts.length > 0
      ? Math.min(...availableProducts.map((p) => p.price))
      : 0;

  const emptyWaUrl = generateWhatsAppInquiryUrl(
    "Disponibilité d'une référence spécifique à Lomé",
  );
  const bottomWaUrl = generateWhatsAppInquiryUrl(
    "Demande de conseils avant commande (Togo)",
  );

  return (
    <div className="space-y-0 bg-white text-slate-900">
      {/* 1. Hero Banner with automated minimum price */}
      <HeroBanner
        onExploreCatalog={() => onNavigate("catalog")}
        minPrice={minPrice}
      />

      {/* 2. Products Section with 2 Interactive Tabs: « Nos Incontournables » & « Nouveautés » */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row with Segmented Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1769FF] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sélection Spéciale</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === "incontournables"
                  ? "Nos Incontournables du Moment"
                  : "Derniers Arrivages & Nouveautés"}
              </h2>
            </div>

            {/* Functional Tabs Control in Editorial Style */}
            <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-200 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("incontournables")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === "incontournables"
                    ? "bg-[#1769FF] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Nos incontournables</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("nouveautes")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === "nouveautes"
                    ? "bg-[#1769FF] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Nouveautés</span>
              </button>
            </div>
          </div>

          {/* 3-Column Desktop Grid OR Elegant Empty State */}
          {availableProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {currentCollection.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={onOpenDetails}
                  />
                ))}
              </div>

              {/* Bottom link to full catalog */}
              <div className="mt-14 text-center">
                <button
                  onClick={() => onNavigate("catalog")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-white hover:bg-[#1769FF] hover:border-[#1769FF] bg-slate-50 transition-all shadow-sm group cursor-pointer"
                >
                  <span>
                    Découvrir l'ensemble du catalogue (
                    {availableProducts.length} articles disponibles)
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1769FF]/10 border border-[#1769FF]/20 text-[#1769FF] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Arrivages en cours
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto font-light">
                Les nouveaux arrivages sont en cours de mise en rayon à Lomé.
                Contactez-nous directement sur WhatsApp pour vérifier la
                disponibilité d'une référence.
              </p>
              <div className="pt-2">
                <a
                  href={emptyWaUrl}
                  target={emptyWaUrl.startsWith("#") ? undefined : "_blank"}
                  rel={
                    emptyWaUrl.startsWith("#")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#1769FF] hover:bg-[#0f56d9] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 fill-[#111111] stroke-none" />
                  <span>Demander une référence sur WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Section « Produit Phare » */}
      <ProductSpotlight
        product={spotlightProduct}
        onOpenDetails={onOpenDetails}
      />

      {/* 4. Category Grid enriched with real counts & previews */}
      <CategoryGrid
        categories={categories}
        products={products}
        onSelectCategory={(slug) => {
          onSelectCategory(slug);
          onNavigate("catalog");
        }}
      />

      {/* 5. Brand Story & Technical Manifesto */}

      {/* 6. Direct WhatsApp Support Banner in Deep Black with Official Orange Button */}
      <section className="py-16 bg-slate-50 text-slate-900 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Une question avant de commander à Lomé ou au Togo ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-light">
              Notre équipe vous conseille en direct sur WhatsApp pour confirmer
              la compatibilité avec vos équipements.
            </p>
          </div>

          <a
            href={bottomWaUrl}
            target={bottomWaUrl.startsWith("#") ? undefined : "_blank"}
            rel={
              bottomWaUrl.startsWith("#") ? undefined : "noopener noreferrer"
            }
            className="px-6 py-3.5 bg-[#1769FF] hover:bg-[#0f56d9] text-white font-bold text-sm rounded-xl shadow-[0_2px_15px_rgba(255,107,0,0.3)] hover:shadow-[0_4px_25px_rgba(255,107,0,0.45)] transition-all flex items-center gap-2 shrink-0 active:scale-98"
          >
            <MessageSquare className="w-4 h-4 fill-white stroke-none" />
            <span>Écrire sur WhatsApp maintenant</span>
          </a>
        </div>
      </section>
    </div>
  );
};
