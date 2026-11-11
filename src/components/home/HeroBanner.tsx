/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Zap,
  Truck,
} from "lucide-react";
import { formatFCFA, generateWhatsAppInquiryUrl } from "../../utils/formatters";

interface HeroBannerProps {
  onExploreCatalog: () => void;
  minPrice?: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreCatalog,
  minPrice,
}) => {
  const heroImage = "/images/og-share-card-optimized.jpg";
  const waInquiryUrl = generateWhatsAppInquiryUrl(
    "Demande de catalogue complet et tarifs",
  );

  return (
    <section className="relative overflow-hidden bg-white text-slate-900 border-b border-slate-200 pt-10 pb-16 md:py-20 lg:py-24">
      {/* Subtle background ambient lights (warm orange & charcoal glow) */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#1769FF]/8 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-white/[0.03] rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quiet category / mission indicator */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <span className="text-[#1769FF] font-bold">
                Nantor's Electronics
              </span>
              <span aria-hidden="true" className="text-slate-300">
                /
              </span>
              <span>Accessoires tech · Lomé, Togo</span>
            </div>

            {/* Main Headline (CASE editorial style: imposing, sophisticated, balanced) */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08] [text-wrap:balance]">
              Les bons accessoires pour accompagner votre quotidien{" "}
              <span className="text-[#1769FF]">high-tech</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-light">
              Chargeurs ultra-rapides GaN, câbles blindés incassables, stations
              d'accueil MagSafe et adaptateurs professionnels. Commandez
              directement sur WhatsApp et réglez en toute sécurité à la
              livraison à Lomé et dans tout le Togo.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={waInquiryUrl}
                target={waInquiryUrl.startsWith("#") ? undefined : "_blank"}
                rel={
                  waInquiryUrl.startsWith("#")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="px-6 py-3.5 bg-[#1769FF] hover:bg-[#0f56d9] text-white font-bold text-sm rounded-xl shadow-[0_2px_15px_rgba(255,107,0,0.3)] hover:shadow-[0_4px_25px_rgba(255,107,0,0.45)] transition-all flex items-center gap-2 active:scale-98"
              >
                <MessageSquare className="w-4 h-4 fill-[#111111] stroke-none" />
                <span>Commander sur WhatsApp</span>
              </a>

              <button
                onClick={onExploreCatalog}
                className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-900 font-semibold text-sm rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2 group active:scale-98 cursor-pointer"
              >
                <span>Explorer le catalogue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#1769FF]" />
              </button>
            </div>

            {/* Trust points strip */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#1769FF] shrink-0" />
                <span className="font-medium text-slate-700">
                  Paiement à la livraison
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#1769FF] shrink-0" />
                <span className="font-medium text-slate-700">
                  Service client WhatsApp
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-[#1769FF] shrink-0" />
                <span className="font-medium text-slate-700">
                  Sélection d'accessoires tech
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Studio Photo Showcase (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
              {/* Image avec son ratio natif */}
              <div className="aspect-[1199/630] relative bg-white">
                <img
                  src={heroImage}
                  srcSet="/images/og-share-card-mobile.jpg 756w,
                          /images/og-share-card-optimized.jpg 1199w"
                  sizes="(max-width: 1023px) calc(100vw - 32px),
                         (min-width: 1024px) 480px"
                  alt="Accessoires haut de gamme Nantor's Electronics"
                  referrerPolicy="no-referrer"
                  fetchPriority="high"
                  width={1199}
                  height={630}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>

              {/* Carte glassmorphic SOUS l'image */}
              <div
                onClick={onExploreCatalog}
                className="bg-white/95 hover:bg-white backdrop-blur-md p-4 text-slate-900 border-t border-slate-200 cursor-pointer transition-all group/card"
                title="Explorer la collection"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-[#1769FF] font-bold block">
                      Sélection Signature Togo
                    </span>
                    <h3 className="font-display font-semibold text-sm text-slate-900 mt-0.5 group-hover/card:text-[#1769FF] transition-colors truncate">
                      Accessoires pour smartphones & informatique
                    </h3>
                  </div>
                  {minPrice && minPrice > 0 ? (
                    <span className="font-mono text-xs font-bold bg-[#1769FF] text-white px-2.5 py-1 rounded-lg shadow-sm shrink-0">
                      Dès {formatFCFA(minPrice)}
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-bold bg-[#1769FF] text-white px-2.5 py-1 rounded-lg shadow-sm shrink-0">
                      Voir le catalogue
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
