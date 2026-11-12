/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MessageSquare, ArrowUpRight, Zap, CheckCircle2 } from "lucide-react";
import { Product } from "../../types";
import { formatFCFA } from "../../utils/formatters";

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/images/product_gan_charger_1793629796501.jpg";
  const canOrder = product.isAvailable && Number.isSafeInteger(product.stockCount) && (product.stockCount ?? 0) > 0;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null;

  const primaryFeature =
    product.features && product.features.length > 0
      ? product.features[0]
      : null;

  return (
    <article className="group relative bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-[#1769FF]/40 shadow-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.12)] transition-all duration-300 flex flex-col overflow-hidden text-slate-900">
      {/* Visual Product Showcase */}
      <div
        onClick={() => onOpenDetails(product)}
        className="relative aspect-4/3 w-full bg-slate-50 overflow-hidden cursor-pointer select-none"
      >
        {!imageError ? (
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            width={400}
            height={300}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-4 text-center">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-[#1769FF] mb-2 stroke-1" />
            <span className="text-[10px] sm:text-xs font-medium text-slate-600 line-clamp-1">
              {product.name}
            </span>
          </div>
        )}

        {/* Subtle status tags */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 pointer-events-none z-10">
          {product.badge && (
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold tracking-wider uppercase bg-white/90 text-[#1769FF] border border-[#1769FF]/30 backdrop-blur-xs rounded sm:rounded-md shadow-xs">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-[#1769FF] rounded sm:rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Out of stock overlay if unavailable */}
        {!canOrder && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center p-2 text-center z-10">
            <span className="px-2.5 py-1 bg-white/10 text-slate-900 border border-slate-300 text-[10px] sm:text-xs font-semibold rounded sm:rounded-md shadow-md uppercase tracking-wider">
              {!product.isAvailable ? "Masqué" : product.stockCount === undefined ? "Stock à renseigner" : "Rupture"}
            </span>
          </div>
        )}

        {/* Quick view hover icon */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 bg-white/90 hover:bg-[#1769FF] text-slate-900 hover:text-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 border border-white/15 cursor-pointer"
          title="Voir la fiche détaillée"
        >
          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="uppercase tracking-widest font-semibold text-[9px] sm:text-[10px] text-slate-500 truncate max-w-[65%]">
              {product.categoryLabel || product.category}
            </span>
            {canOrder ? (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] text-[#1769FF] font-medium shrink-0">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>En stock</span>
              </span>
            ) : (
              <span className="text-[9px] sm:text-[11px] text-slate-500 shrink-0">
                {product.stockCount === undefined ? "Stock à renseigner" : "Rupture"}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="font-display font-semibold text-slate-900 text-xs sm:text-base leading-snug line-clamp-2 hover:text-[#1769FF] cursor-pointer transition-colors min-h-[2rem] sm:min-h-[2.5rem]"
          >
            {product.name}
          </h3>

          {/* Primary Technical Feature (if present in product data) */}
          {primaryFeature && (
            <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-[#aaaaaa] line-clamp-1">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#1769FF] shrink-0" />
              <span className="truncate">{primaryFeature}</span>
            </div>
          )}

          {/* Short description (visible on tablet/desktop for extra context) */}
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed hidden sm:block">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Purchase Action Row */}
        <div className="mt-3 sm:mt-5 pt-2.5 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex sm:flex-col items-baseline sm:items-start gap-1.5 sm:gap-0">
            <span className="font-mono tabular-nums text-sm sm:text-lg font-bold text-slate-900">
              {formatFCFA(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-mono tabular-nums text-[10px] sm:text-xs text-slate-500 line-through">
                {formatFCFA(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Commander sur WhatsApp button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenDetails(product); }}
            disabled={!canOrder}
            className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all duration-200 shrink-0 ${
              canOrder
                ? "bg-[#1769FF] hover:bg-[#0f56d9] text-white shadow-[0_2px_10px_rgba(23,105,255,0.16)] active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
            title="Afficher la fiche et commander"
          >
            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>{canOrder ? "Commander" : "Indisponible"}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
