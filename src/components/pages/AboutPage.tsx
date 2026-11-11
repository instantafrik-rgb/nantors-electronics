/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Award, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onExploreCatalog: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onExploreCatalog }) => {
  return (
    <div className="py-12 md:py-20 bg-[#111111] text-[#F3F0E9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Intro Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
            Notre Histoire & Vision · Togo
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F3F0E9] tracking-tight [text-wrap:balance]">
            Des accessoires tech utiles, un conseil clair et une commande simple.
          </h1>
          <p className="text-base sm:text-lg text-[#999999] leading-relaxed font-light">
            <strong>Nantor's Electronics</strong> propose des accessoires pour smartphones, ordinateurs et équipements du quotidien. Notre objectif : aider chacun à trouver le produit adapté, avec des informations claires et un contact direct avant la commande.
          </p>
        </div>

        {/* Narrative Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#141414] rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#F3F0E9]">
              Notre approche : vous aider à choisir le bon accessoire
            </h2>
            <p className="text-sm text-[#888888] leading-relaxed font-light">
              Les références, connectiques et compatibilités peuvent être difficiles à comparer. Nous voulons rendre la recherche plus simple grâce à un catalogue organisé et à un échange direct avec notre équipe.
            </p>
            <p className="text-sm text-[#888888] leading-relaxed font-light">
              Chaque fiche présente les informations disponibles sur l'article. En cas de doute sur la compatibilité ou la disponibilité, contactez-nous avant de confirmer votre commande.
            </p>
          </div>

          <div className="bg-[#1c1c1c] text-[#F3F0E9] rounded-2xl p-6 sm:p-8 space-y-5 border border-white/10">
            <h3 className="font-display font-bold text-lg text-[#F3F0E9] border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
              <span>Nos engagements</span>
            </h3>
            
            <div className="space-y-3.5 text-xs text-[#cccccc]">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">100% Original & Certifié :</strong> Aucun faux label ni copie non certifiée dans nos stocks.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Garantie 12 Mois Échange Direct :</strong> En cas de défaut avéré, vous repartez immédiatement avec un produit neuf.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Paiement à la Livraison au Togo :</strong> Transparence totale. Vous avez le produit entre les mains avant de débourser le moindre franc.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#141414] rounded-2xl p-6 border border-white/10 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#F3F0E9]">Accessoires du quotidien</h3>
            <p className="text-xs text-[#888888] leading-relaxed font-light">
              Chargeurs, câbles, hubs, accessoires pour téléphones et équipements informatiques : retrouvez plusieurs familles de produits dans notre catalogue.
            </p>
          </div>

          <div className="bg-[#141414] rounded-2xl p-6 border border-white/10 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#F3F0E9]">Choix & compatibilité</h3>
            <p className="text-xs text-[#888888] leading-relaxed font-light">
              Consultez les caractéristiques disponibles et contactez-nous si vous souhaitez vérifier qu'un accessoire convient à votre appareil.
            </p>
          </div>

          <div className="bg-[#141414] rounded-2xl p-6 border border-white/10 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#F3F0E9]">Livraison au Togo</h3>
            <p className="text-xs text-[#888888] leading-relaxed font-light">
              La livraison est organisée à Lomé. Les frais et modalités sont confirmés avant validation de la commande.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <button
            onClick={onExploreCatalog}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FF6B00] hover:bg-[#e05f00] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_2px_15px_rgba(255,107,0,0.3)] transition-all cursor-pointer"
          >
            <span>Découvrir le catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
