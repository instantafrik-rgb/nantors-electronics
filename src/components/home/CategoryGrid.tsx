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
        return <Zap className="w-5 h-5 text-[#1769FF]" />;
      case 'cables':
        return <Cable className="w-5 h-5 text-[#1769FF]" />;
      case 'accessoires-telephonie':
        return <Smartphone className="w-5 h-5 text-[#1769FF]" />;
      case 'accessoires-informatique':
        return <Laptop className="w-5 h-5 text-[#1769FF]" />;
      case 'audio-ecouteurs':
        return <Headphones className="w-5 h-5 text-[#1769FF]" />;
      case 'energie-batteries':
        return <BatteryCharging className="w-5 h-5 text-[#1769FF]" />;
      default:
        return <Zap className="w-5 h-5 text-[#1769FF]" />;
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#1769FF] mb-2">
              L'univers Nantor's
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tout pour vos équipements
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md font-light">
            Explorez nos catégories et trouvez les accessoires adaptés à vos appareils.
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
                className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#1769FF]/50 shadow-sm hover:shadow-[0_8px_30px_rgba(255,107,0,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:scale-105 group-hover:border-[#1769FF]/40 transition-all">
                      {getCategoryIcon(cat.slug)}
                    </div>

                    {/* Real Dynamic Product Count Badge */}
                    <span className="text-[11px] font-semibold text-[#1769FF] bg-white px-2.5 py-1 rounded-full border border-slate-200 group-hover:border-[#1769FF]/40 transition-colors">
                      {count > 0 ? `${count} produit${count > 1 ? 's' : ''} en stock` : 'Sur commande'}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#1769FF] transition-colors">
                    {cat.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2 font-light">
                    {cat.description}
                  </p>
                </div>

                {/* Visual Thumbnail Preview & Action Row */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {previewImage ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                        <img
                          src={previewImage}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : null}
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-[#1769FF] transition-colors">
                      Explorer la gamme
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#1769FF] group-hover:text-white flex items-center justify-center text-slate-600 transition-all duration-200">
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
