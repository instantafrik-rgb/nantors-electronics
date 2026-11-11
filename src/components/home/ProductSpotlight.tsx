/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MessageSquare, ArrowRight, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA, generateWhatsAppOrderUrl } from '../../utils/formatters';

interface ProductSpotlightProps {
  product: Product | null;
  onOpenDetails: (product: Product) => void;
}

export const ProductSpotlight: React.FC<ProductSpotlightProps> = ({ product, onOpenDetails }) => {
  if (!product) return null;

  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : '/images/product_gan_charger_1793629796501.jpg';

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const whatsappUrl = generateWhatsAppOrderUrl(product, 'Commande directe depuis la sélection Produit Phare');

  // Pick top 3-4 features
  const displayedFeatures = product.features && product.features.length > 0
    ? product.features.slice(0, 4)
    : [
        'Technologie de pointe certifiée constructeur',
        'Protection thermique et anti-surtension active',
        'Garantie échange à neuf 12 mois au Togo',
      ];

  return (
    <section className="py-16 md:py-24 bg-[#0e0e0e] border-y border-slate-200 overflow-hidden text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-slate-50 text-slate-900 overflow-hidden shadow-2xl border border-slate-200">
          {/* Subtle warm ambient glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1769FF]/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/[0.02] rounded-full blur-[90px] pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-8 sm:p-12 lg:p-16">
            {/* Left Column: Visual Product Image (5 cols on desktop) */}
            <div className="lg:col-span-5 relative order-1 lg:order-1">
              <div 
                onClick={() => onOpenDetails(product)}
                className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-2xl cursor-pointer group"
              >
                <img
                  src={mainImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase bg-[#1769FF] text-white rounded-lg shadow-md">
                    Produit Phare
                  </span>
                  {discountPercent && (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-white text-[#1769FF] border border-[#1769FF]/40 rounded-md shadow-xs">
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs text-[11px] text-slate-900 font-medium border border-slate-200 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:border-[#1769FF]/50">
                  <span>Agrandir</span>
                  <ArrowRight className="w-3 h-3 text-[#1769FF]" />
                </div>
              </div>
            </div>

            {/* Right Column: Narrative, Pricing & CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1769FF]">
                  <Zap className="w-3.5 h-3.5 text-[#1769FF]" />
                  <span>{product.categoryLabel || product.category}</span>
                  <span aria-hidden="true" className="text-slate-400">/</span>
                  <span className="text-slate-900 font-medium">À découvrir chez Nantor's</span>
                </div>

                <h2 
                  onClick={() => onOpenDetails(product)}
                  className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug hover:text-[#1769FF] cursor-pointer transition-colors"
                >
                  {product.name}
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl pt-1 font-light">
                  {product.shortDescription}
                </p>
              </div>

              {/* Price & Guarantee Pill */}
              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
                  {formatFCFA(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-mono text-sm text-slate-500 line-through tabular-nums">
                    {formatFCFA(product.originalPrice)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-slate-700 text-xs font-medium border border-slate-200 ml-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1769FF]" />
                  <span>Paiement à la livraison au Togo</span>
                </span>
              </div>

              {/* Key Features Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {displayedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-[#1769FF] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href={whatsappUrl}
                  target={whatsappUrl.startsWith('#') ? undefined : '_blank'}
                  rel={whatsappUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
                  className="px-6 py-3.5 bg-[#1769FF] hover:bg-[#0f56d9] text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_2px_15px_rgba(23,105,255,0.18)] hover:shadow-[0_4px_25px_rgba(23,105,255,0.24)] transition-all flex items-center gap-2 active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 fill-[#111111] stroke-none" />
                  <span>Commander sur WhatsApp (Lomé & Togo)</span>
                </a>

                <button
                  onClick={() => onOpenDetails(product)}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-[#252525] text-slate-900 font-semibold text-xs sm:text-sm rounded-xl transition-all border border-slate-200 flex items-center gap-2 active:scale-98 cursor-pointer"
                >
                  <span>Détails & Fiche technique</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
