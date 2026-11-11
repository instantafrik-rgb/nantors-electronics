/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, Check } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#F3F0E9] text-[#111111] border-t border-[#e2ded5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text & Guarantees */}
          <div className="space-y-6">
            <div className="text-xs font-bold uppercase tracking-widest text-[#111111]">
              L'Engagement Nantor's Electronics
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] tracking-tight leading-tight [text-wrap:balance]">
              Pourquoi nous refusons les accessoires bas de gamme.
            </h2>

            <p className="text-sm sm:text-base text-[#444444] leading-relaxed">
              Sur le marché des accessoires électroniques, 70% des câbles et chargeurs génériques détériorent prématurément les batteries de smartphones et risquent d'endommager les circuits d'alimentation des ordinateurs portables.
            </p>

            <p className="text-sm sm:text-base text-[#444444] leading-relaxed">
              Chez <strong>Nantor's Electronics</strong>, nous sélectionnons rigoureusement chaque référence. Nos chargeurs intègrent de véritables semi-conducteurs au Nitrure de Gallium (GaN), nos câbles sont blindés en nylon balistique, et nos adaptateurs sont usinés en aluminium CNC pour une dissipation thermique optimale.
            </p>

            {/* 4 Pillars with refined off-white cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-[#e2ded5] shadow-xs">
                <div className="flex items-center gap-2 text-[#111111] font-bold text-sm mb-1">
                  <Check className="w-4 h-4 text-[#FF6B00]" />
                  <span>Zéro Contrefaçon</span>
                </div>
                <p className="text-xs text-[#666666]">Composants certifiés CE, FCC et RoHS conformes aux spécifications Apple & USB-IF.</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#e2ded5] shadow-xs">
                <div className="flex items-center gap-2 text-[#111111] font-bold text-sm mb-1">
                  <Check className="w-4 h-4 text-[#FF6B00]" />
                  <span>Paiement à la livraison</span>
                </div>
                <p className="text-xs text-[#666666]">Aucun prépaiement requis. Vous inspectez votre commande avant de régler le livreur.</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#e2ded5] shadow-xs">
                <div className="flex items-center gap-2 text-[#111111] font-bold text-sm mb-1">
                  <Check className="w-4 h-4 text-[#FF6B00]" />
                  <span>Échange à neuf 1 an</span>
                </div>
                <p className="text-xs text-[#666666]">En cas d'anomalie de fabrication, remplacement immédiat sans tracasseries.</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#e2ded5] shadow-xs">
                <div className="flex items-center gap-2 text-[#111111] font-bold text-sm mb-1">
                  <Check className="w-4 h-4 text-[#FF6B00]" />
                  <span>Conseil Spécialisé</span>
                </div>
                <p className="text-xs text-[#666666]">Assistance WhatsApp pour vérifier la compatibilité exacte de vos machines.</p>
              </div>
            </div>
          </div>

          {/* Right: Technical Anatomy Card in Deep Black #111111 with Orange Accents */}
          <div className="relative">
            <div className="bg-[#111111] text-[#F3F0E9] rounded-3xl p-8 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs text-[#FF6B00] font-bold tracking-wider uppercase">
                    Normes de Fabrication
                  </span>
                  <h3 className="font-display font-bold text-xl text-[#F3F0E9] mt-1">
                    Anatomie d'un Câble Nantor's
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00]">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-4 pt-6 text-xs text-[#cccccc]">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-[#FF6B00] font-bold">01.</span>
                  <div>
                    <h4 className="text-[#F3F0E9] font-semibold text-sm">Puce E-Marker Intelligente</h4>
                    <p className="text-[#888888] mt-0.5">Négocie automatiquement la tension (5V à 20V) pour éviter toute surcharge de batterie.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-[#FF6B00] font-bold">02.</span>
                  <div>
                    <h4 className="text-[#F3F0E9] font-semibold text-sm">Fils de Cuivre Étamé Pur</h4>
                    <p className="text-[#888888] mt-0.5">Section de conducteur 21 AWG pour un rendement de charge sans perte d'énergie.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-[#FF6B00] font-bold">03.</span>
                  <div>
                    <h4 className="text-[#F3F0E9] font-semibold text-sm">Blindage Électromagnétique</h4>
                    <p className="text-[#888888] mt-0.5">Feuille d'aluminium + tresse de blindage intégrale bloquant tout parasite.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-[#FF6B00] font-bold">04.</span>
                  <div>
                    <h4 className="text-[#F3F0E9] font-semibold text-sm">Gaine en Nylon Balistique</h4>
                    <p className="text-[#888888] mt-0.5">Structure anti-effilochement testée à plus de 35 000 cycles de torsion.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-[#777777]">
                <span>Certification CE / RoHS / FCC</span>
                <span className="font-mono text-[#FF6B00]">Tension max : 100W PD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
