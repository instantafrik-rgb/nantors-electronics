/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, ArrowRight, MessageSquare, Shield } from 'lucide-react';
import { generateWhatsAppInquiryUrl } from '../../utils/formatters';
import { AdminUser } from '../../types';

interface HeaderProps {
  activePage: 'home' | 'catalog' | 'about' | 'contact' | 'admin';
  onNavigate: (page: 'home' | 'catalog' | 'about' | 'contact' | 'admin') => void;
  currentUser: AdminUser | null;
  onOpenAuth?: () => void;
  onSelectCategory?: (slug: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  currentUser,
  onOpenAuth,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: 'home' | 'catalog' | 'about' | 'contact'; label: string }[] = [
    { id: 'home', label: 'Accueil' },
    { id: 'catalog', label: 'Catalogue' },
    { id: 'about', label: 'À Propos' },
    { id: 'contact', label: 'Contact' },
  ];

  const waInquiryUrl = generateWhatsAppInquiryUrl('Commande rapide depuis le site Nantors');
  const waDirectUrl = generateWhatsAppInquiryUrl();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-md">
      {/* 1. Top Announcement Bar: CASE Minimalist Editorial */}
      <div className="bg-slate-50 text-slate-500 text-[11px] sm:text-xs py-1.5 px-4 border-b border-slate-200/80 tracking-wider">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1769FF] animate-pulse"></span>
            <span className="font-medium text-slate-900">Accessoires tech à Lomé · Livraison au Togo</span>
            <span className="hidden sm:inline text-slate-300">/</span>
            <span className="hidden sm:inline text-slate-600">Paiement à la livraison</span>
            <span className="hidden md:inline text-slate-300">/</span>
            
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={waInquiryUrl}
              target={waInquiryUrl.startsWith('#') ? undefined : '_blank'}
              rel={waInquiryUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
              className="text-[#1769FF] hover:text-white font-semibold transition-colors flex items-center gap-1 group"
            >
              <span>Commandes WhatsApp</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Navigation Principale: Sticky on all devices */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Editorial luxury tech) */}
          <button
            type="button"
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 text-left group focus-visible:outline-none cursor-pointer select-none"
            title="Retour à l'accueil"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 group-hover:border-[#1769FF]/60 group-hover:shadow-[0_0_15px_rgba(255,107,0,0.25)] transition-all">
              <span className="font-display font-extrabold text-xl tracking-tighter text-slate-900">
                N<span className="text-[#1769FF]">.</span>
              </span>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                Nantor's <span className="text-[#1769FF]">Electronics</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-slate-500 font-medium hidden sm:block">
                Lomé · High-Tech & Connectique
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Single active item highlighted in #FF6B00) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onNavigate(link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-1.5 uppercase text-xs tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-[#1769FF] font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#1769FF] shadow-[0_0_8px_rgba(255,107,0,0.8)] rounded-full animate-in fade-in duration-200 transition-all" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Admin Trigger + WhatsApp Direct Button) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Admin link / status */}
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              aria-current={activePage === 'admin' ? 'page' : undefined}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border cursor-pointer ${
                activePage === 'admin'
                  ? 'bg-slate-100 text-[#1769FF] border-[#1769FF]/50 shadow-[0_0_10px_rgba(255,107,0,0.2)]'
                  : currentUser?.isAdmin
                  ? 'bg-white text-[#1769FF] border-[#1769FF]/30 hover:bg-[#202020]'
                  : 'bg-slate-50 text-slate-500 border-slate-100 hover:text-slate-900 hover:border-slate-200'
              }`}
              title="Espace administration du catalogue"
            >
              <Shield className="w-3.5 h-3.5 text-[#1769FF]" />
              <span className="whitespace-nowrap">
                {currentUser?.isAdmin ? 'Admin Connecté' : 'Espace Admin'}
              </span>
            </button>

            {/* Primary Action Button: Official Orange CTA with High Contrast Black Text */}
            <a
              href={waDirectUrl}
              target={waDirectUrl.startsWith('#') ? undefined : '_blank'}
              rel={waDirectUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold text-white bg-[#1769FF] hover:bg-[#0f56d9] active:scale-98 rounded-xl shadow-[0_2px_15px_rgba(255,107,0,0.3)] hover:shadow-[0_4px_20px_rgba(255,107,0,0.45)] transition-all duration-200 whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-4 h-4 fill-[#111111] stroke-none" />
              <span>WhatsApp Direct</span>
            </a>

            {/* Mobile hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu with highlighted active item in #FF6B00 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = activePage === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      onNavigate(link.id);
                      setMobileMenuOpen(false);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-slate-50 text-[#1769FF] font-bold border-l-4 border-[#1769FF]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#1769FF] shadow-[0_0_6px_#FF6B00]" />}
                  </button>
                );
              })}

              {/* Admin link on mobile */}
              <button
                type="button"
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                aria-current={activePage === 'admin' ? 'page' : undefined}
                className={`text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between cursor-pointer ${
                  activePage === 'admin'
                    ? 'bg-slate-50 text-[#1769FF] font-bold border-l-4 border-[#1769FF]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white font-medium'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#1769FF]" />
                  <span>Espace Administrateur</span>
                </span>
                <ArrowRight className={`w-4 h-4 ${activePage === 'admin' ? 'text-[#1769FF]' : 'text-slate-400'}`} />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <a
                href={waDirectUrl}
                target={waDirectUrl.startsWith('#') ? undefined : '_blank'}
                rel={waDirectUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1769FF] text-white font-bold text-sm rounded-xl shadow-[0_2px_15px_rgba(255,107,0,0.3)] hover:bg-[#0f56d9] transition-colors"
              >
                <MessageSquare className="w-4 h-4 fill-[#111111] stroke-none" />
                <span>Commander sur WhatsApp</span>
              </a>
            </div>
          </div>
        )}
    </header>
  );
};
