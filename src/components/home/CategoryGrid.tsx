/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Zap, Cable, Smartphone, Laptop, Headphones, BatteryCharging, ArrowRight } from 'lucide-react';
import { CategoryInfo, Product } from '../../types';

interface CategoryGridProps {
  categories: CategoryInfo[];
  products: Product[];
  onSelectCategory: (slug: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  products,
  onSelectCategory,
}) => {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'chargeurs':
        return <Zap className="w-5 h-5 text-[#FF6B00]" />;
      case 'cables':
        return <Cable className="w-5 h-5 text-[#FF6B00]" />;
      case 'accessoires-telephonie':
        return <Smartphone className="w-5 h-5 text-[#FF6B00]" />;
      case 'accessoires-informatique':
        return <Laptop className="w-5 h-5 text-[#FF6B00]" />;
      case 'audio-ecouteurs':
        return <Headphones className="w-5 h-5 text-[#FF6B00]" />;
      case 'energie-batteries':
        return <BatteryCharging className="w-5 h-5 text-[#FF6B00]" />;
      default:
        return <Zap className="w-5 h-5 text-[#FF6B00]" />;
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[#111111] text-[#F3F0E9] border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#FF6B00] mb-2">
              Architecture Gamme
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#F3F0E9] tracking-tight">
              Nos Catégories Spécialisées
            </h2>
          </div>
          <p className="text-sm text-[#888888] max-w-md font-light">
            Des accessoires certifiés disponibles en stock pour livraison immédiate à Lomé et dans les principales villes du Togo.
          </p>
        </div>

        {/* 6 Category Tiles Grid with real product counts and visual previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            // Real count of available products
            const matchingProducts = products.filter(
              (p) => p.category === cat.slug && p.isAvailable
            );
            const count = matchingProducts.length;

            // Real visual preview from products
            const previewProduct = matchingProducts[0] || products.find((p) => p.category === cat.slug);
            const previewImage = previewProduct?.images?.[0];

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="group relative bg-[#181818] rounded-2xl p-6 border border-white/10 hover:border-[#FF6B00]/50 shadow-sm hover:shadow-[0_8px_30px_rgba(255,107,0,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#222222] border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:border-[#FF6B00]/40 transition-all">
                      {getCategoryIcon(cat.slug)}
                    </div>

                    {/* Real Dynamic Product Count Badge */}
                    <span className="text-[11px] font-semibold text-[#FF6B00] bg-[#111111] px-2.5 py-1 rounded-full border border-white/10 group-hover:border-[#FF6B00]/40 transition-colors">
                      {count > 0 ? `${count} produit${count > 1 ? 's' : ''} en stock` : 'Sur commande'}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#F3F0E9] group-hover:text-[#FF6B00] transition-colors">
                    {cat.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-[#888888] leading-relaxed line-clamp-2 font-light">
                    {cat.description}
                  </p>
                </div>

                {/* Visual Thumbnail Preview & Action Row */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {previewImage ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#141414] border border-white/10 shrink-0">
                        <img
                          src={previewImage}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : null}
                    <span className="text-xs font-semibold text-[#cccccc] group-hover:text-[#FF6B00] transition-colors">
                      Explorer la gamme
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-[#222222] group-hover:bg-[#FF6B00] group-hover:text-white flex items-center justify-center text-[#999999] transition-all duration-200">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
