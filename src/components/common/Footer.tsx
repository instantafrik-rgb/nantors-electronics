/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MessageSquare, Phone, Mail, MapPin, Clock, ShieldCheck, Truck, RefreshCw, Lock } from 'lucide-react';
import { config } from '../../config/environment';
import { generateWhatsAppInquiryUrl } from '../../utils/formatters';

interface FooterProps {
  onNavigate: (page: 'home' | 'catalog' | 'about' | 'contact' | 'admin') => void;
  onSelectCategory?: (categorySlug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  const waInquiryUrl = generateWhatsAppInquiryUrl();

  return (
    <footer className="bg-[#0b0b0b] text-[#888888] border-t border-[#222222] pt-16 pb-12">
      {/* 4 Trust Highlights Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-[#222222]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center text-[#FF6B00] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#F3F0E9] font-semibold text-sm">Paiement à la livraison</h4>
              <p className="text-xs text-[#777777] mt-0.5 font-light">Réglez en espèces à réception après vérification de votre colis à Lomé.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center text-[#FF6B00] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#F3F0E9] font-semibold text-sm">Conseil avant commande</h4>
              <p className="text-xs text-[#777777] mt-0.5 font-light">Notre équipe vous aide à vérifier les caractéristiques et la compatibilité.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center text-[#FF6B00] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#F3F0E9] font-semibold text-sm">Informations produit</h4>
              <p className="text-xs text-[#777777] mt-0.5 font-light">Consultez les détails et caractéristiques disponibles sur chaque fiche produit.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center text-[#FF6B00] shrink-0">
              <MessageSquare className="w-5 h-5 fill-[#FF6B00] stroke-none" />
            </div>
            <div>
              <h4 className="text-[#F3F0E9] font-semibold text-sm">Contact WhatsApp</h4>
              <p className="text-xs text-[#777777] mt-0.5 font-light">Une question sur un produit ou une commande ? Contactez notre équipe.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#181818] flex items-center justify-center text-[#F3F0E9] border border-white/10">
              <span className="font-display font-extrabold text-lg">
                N<span className="text-[#FF6B00]">.</span>
              </span>
            </div>
            <span className="font-display font-bold text-xl text-[#F3F0E9]">
              Nantor's <span className="text-[#FF6B00]">Electronics</span>
            </span>
          </div>

          <p className="text-sm text-[#888888] max-w-sm leading-relaxed font-light">
            Une sélection d'accessoires pour smartphones, ordinateurs et équipements du quotidien. 
            Trouvez l'accessoire adapté à votre appareil et commandez en toute simplicité.
          </p>

          <div className="pt-2">
            <a
              href={waInquiryUrl}
              target={waInquiryUrl.startsWith('#') ? undefined : '_blank'}
              rel={waInquiryUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#e05f00] text-[#111111] text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4 fill-[#111111] stroke-none" />
              <span>Discuter avec un conseiller</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[#F3F0E9] text-xs font-bold uppercase tracking-wider mb-4">Navigation</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-[#FF6B00] transition-colors cursor-pointer">
                Accueil
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-[#FF6B00] transition-colors cursor-pointer">
                Catalogue complet
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-[#FF6B00] transition-colors cursor-pointer">
                À propos de Nantor's
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-[#FF6B00] transition-colors cursor-pointer">
                Contact & Showroom
              </button>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-[#F3F0E9] text-xs font-bold uppercase tracking-wider mb-4">Catégories</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button 
                onClick={() => {
                  onNavigate('catalog');
                  if (onSelectCategory) onSelectCategory('chargeurs');
                }} 
                className="hover:text-[#FF6B00] transition-colors cursor-pointer"
              >
                Chargeurs
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  onNavigate('catalog');
                  if (onSelectCategory) onSelectCategory('cables');
                }} 
                className="hover:text-[#FF6B00] transition-colors cursor-pointer"
              >
                Câbles & connectique
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  onNavigate('catalog');
                  if (onSelectCategory) onSelectCategory('accessoires-telephonie');
                }} 
                className="hover:text-[#FF6B00] transition-colors cursor-pointer"
              >
                Accessoires Téléphonie
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  onNavigate('catalog');
                  if (onSelectCategory) onSelectCategory('accessoires-informatique');
                }} 
                className="hover:text-[#FF6B00] transition-colors cursor-pointer"
              >
                Hubs & Accessoires PC
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  onNavigate('catalog');
                  if (onSelectCategory) onSelectCategory('audio-ecouteurs');
                }} 
                className="hover:text-[#FF6B00] transition-colors cursor-pointer"
              >
                Audio & écouteurs
              </button>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="text-[#F3F0E9] text-xs font-bold uppercase tracking-wider mb-4">Coordonnées</h4>
          <ul className="space-y-3 text-sm text-[#888888]">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
              <span>{config.shop.showroomAddress}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span className="font-mono">{config.shop.phoneFormatted}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>{config.shop.email}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>{config.shop.workingHours}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
        <p>© {new Date().getFullYear()} Nantor's Electronics. Tous droits réservés. Vente d'accessoires certifiés au Togo.</p>
        
        <div className="flex items-center gap-6">
          <span className="text-[#888888]">Paiement 100% sécurisé à la livraison</span>
          <button
            onClick={() => onNavigate('admin')}
            className="text-[#888888] hover:text-[#FF6B00] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Lock className="w-3 h-3 text-[#FF6B00]" />
            <span>Accès Administrateur</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
