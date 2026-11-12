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
    <div className="py-12 md:py-20 bg-[#afbdc5] text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Intro Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1769FF]">
            Notre Histoire & Vision · Togo
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight [text-wrap:balance]">
            Des accessoires tech utiles, un conseil clair et une commande simple.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            <strong>Nantor's Electronics</strong> propose des accessoires pour smartphones, ordinateurs et équipements du quotidien. Notre objectif : aider chacun à trouver le produit adapté, avec des informations claires et un contact direct avant la commande.
          </p>
        </div>

        {/* Narrative Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-2xl">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Notre approche : vous aider à choisir le bon accessoire
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-light">
              Les références, connectiques et compatibilités peuvent être difficiles à comparer. Nous voulons rendre la recherche plus simple grâce à un catalogue organisé et à un échange direct avec notre équipe.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed font-light">
              Chaque fiche présente les informations disponibles sur l'article. En cas de doute sur la compatibilité ou la disponibilité, contactez-nous avant de confirmer votre commande.
            </p>
          </div>

          <div className="bg-slate-50 text-slate-900 rounded-2xl p-6 sm:p-8 space-y-5 border border-slate-200">
            <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1769FF]" />
              <span>Nos engagements</span>
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#1769FF] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">100% Original & Certifié :</strong> Aucun faux label ni copie non certifiée dans nos stocks.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#1769FF] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Garantie 12 Mois Échange Direct :</strong> En cas de défaut avéré, vous repartez immédiatement avec un produit neuf.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#1769FF] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Paiement à la Livraison au Togo :</strong> Transparence totale. Vous avez le produit entre les mains avant de débourser le moindre franc.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#1769FF]/10 text-[#1769FF] border border-[#1769FF]/20 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">Accessoires du quotidien</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Chargeurs, câbles, hubs, accessoires pour téléphones et équipements informatiques : retrouvez plusieurs familles de produits dans notre catalogue.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#1769FF]/10 text-[#1769FF] border border-[#1769FF]/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">Choix & compatibilité</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Consultez les caractéristiques disponibles et contactez-nous si vous souhaitez vérifier qu'un accessoire convient à votre appareil.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#1769FF]/10 text-[#1769FF] border border-[#1769FF]/20 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">Livraison au Togo</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              La livraison est organisée à Lomé. Les frais et modalités sont confirmés avant validation de la commande.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <button
            onClick={onExploreCatalog}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1769FF] hover:bg-[#0f56d9] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_2px_15px_rgba(23,105,255,0.16)] transition-all cursor-pointer"
          >
            <span>Découvrir le catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
