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
            Rehausser les standards de la connectique et des accessoires high-tech.
          </h1>
          <p className="text-base sm:text-lg text-[#999999] leading-relaxed font-light">
            Fondée avec la volonté de mettre fin à la prolifération de câbles jetables et de chargeurs dangereux, <strong>Nantor's Electronics</strong> est la référence des utilisateurs exigeants en téléphonie et informatique à Lomé et dans tout le Togo.
          </p>
        </div>

        {/* Narrative Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#141414] rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#F3F0E9]">
              Le Constat : Vos appareils méritent mieux que du consommable jetable
            </h2>
            <p className="text-sm text-[#888888] leading-relaxed font-light">
              Un smartphone haut de gamme ou un ordinateur portable professionnel représente un investissement important. Pourtant, beaucoup continuent d'utiliser des adaptateurs non régulés qui provoquent des micro-coupures de courant et réduisent la durée de vie des batteries.
            </p>
            <p className="text-sm text-[#888888] leading-relaxed font-light">
              Chez Nantor's Electronics, chaque produit de notre catalogue passe une batterie de tests avant d'être commercialisé : résistance à la chaleur, tenue de charge sous 100W en continu, et solidité des embouts métalliques.
            </p>
          </div>

          <div className="bg-[#1c1c1c] text-[#F3F0E9] rounded-2xl p-6 sm:p-8 space-y-5 border border-white/10">
            <h3 className="font-display font-bold text-lg text-[#F3F0E9] border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
              <span>Nos Engagements Irrévocables</span>
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
            <h3 className="font-display font-bold text-base text-[#F3F0E9]">Semi-conducteurs GaN</h3>
            <p className="text-xs text-[#888888] leading-relaxed font-light">
              Nous privilégions le Nitrure de Gallium qui chauffe 3 fois moins que le silicium traditionnel et permet une compacité record avec un rendement énergétique de 95%.
            </p>
          </div>

          <div className="bg-[#141414] rounded-2xl p-6 border border-white/10 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#F3F0E9]">Blindage Balistique</h3>
            <p className="text-xs text-[#888888] leading-relaxed font-light">
              Tresses de nylon double couche, embouts en alliage de zinc et décharges de traction flexibles conçues pour résister à plus de 35 000 pliages.
            </p>
          </div>

          <div className="bg-[#141414] rounded-2xl p-6 border border-white/10 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#F3F0E9]">Livraison Togo Rapide</h3>
            <p className="text-xs text-[#888888] leading-relaxed font-light">
              Coursiers dédiés pour Lomé (Agoè, Tokoin, Hédzranawoé...) et expéditions rapides vers Kara, Sokodé, Kpalimé et Atakpamé.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <button
            onClick={onExploreCatalog}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FF6B00] hover:bg-[#e05f00] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_2px_15px_rgba(255,107,0,0.3)] transition-all cursor-pointer"
          >
            <span>Consulter nos produits certifiés</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
