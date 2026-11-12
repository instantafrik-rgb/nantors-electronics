/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { Menu, X, ArrowRight, MessageCircle, Shield, ChevronDown, Sparkles } from "lucide-react";
import { generateWhatsAppInquiryUrl } from "../../utils/formatters";
import { AdminUser } from "../../types";
import { config } from "../../config/environment";

interface HeaderProps {
  activePage: "home" | "catalog" | "about" | "contact" | "admin";
  onNavigate: (page: "home" | "catalog" | "about" | "contact" | "admin") => void;
  currentUser: AdminUser | null;
  onOpenAuth?: () => void;
  onSelectCategory?: (slug: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, onNavigate, currentUser }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks: { id: "home" | "catalog" | "about" | "contact"; label: string }[] = [
    { id: "home", label: "Accueil" },
    { id: "catalog", label: "Boutique" },
    { id: "about", label: "Notre univers" },
    { id: "contact", label: "Contact" },
  ];
  const whatsappUrl = generateWhatsAppInquiryUrl("Bonjour, je souhaite obtenir des informations sur vos produits.");
  const navigate = (page: "home" | "catalog" | "about" | "contact" | "admin") => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="nantor-header sticky top-0 z-50">
      <div className="nantor-header-top">
        <div className="nantor-header-top-inner">
          <span><Sparkles size={13} /> Les essentiels tech, soigneusement sélectionnés</span>
          <span className="nantor-header-top-right">Lomé, Togo <i /> Paiement à la livraison</span>
        </div>
      </div>
      <div className="nantor-header-main">
        <button type="button" onClick={() => navigate("home")} className="nantor-brand" aria-label="Retour à l'accueil">
          <span className="nantor-brand-mark">
            {config.shop.logoUrl ? <img src={config.shop.logoUrl} alt="" /> : <span>N<span>.</span></span>}
          </span>
          <span className="nantor-brand-copy">
            <strong>{config.shop.name}</strong>
            <small>TECH THAT MOVES YOU</small>
          </span>
        </button>

        <nav className="nantor-desktop-nav" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <button key={link.id} type="button" onClick={() => navigate(link.id)} className={activePage === link.id ? "active" : ""} aria-current={activePage === link.id ? "page" : undefined}>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="nantor-header-actions">
          <button type="button" className="nantor-admin-link" onClick={() => navigate("admin")} aria-label="Espace administrateur">
            <Shield size={15} /> <span>{currentUser?.isAdmin ? "Administration" : "Espace pro"}</span>
          </button>
          <a href={whatsappUrl} target={whatsappUrl.startsWith("#") ? undefined : "_blank"} rel={whatsappUrl.startsWith("#") ? undefined : "noopener noreferrer"} className="nantor-header-cta">
            <MessageCircle size={16} /> <span>Nous contacter</span> <ArrowRight size={14} />
          </a>
          <button type="button" className="nantor-mobile-toggle" onClick={() => setMobileMenuOpen((v) => !v)} aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="nantor-mobile-menu">
          {navLinks.map((link) => (
            <button key={link.id} type="button" onClick={() => navigate(link.id)} className={activePage === link.id ? "active" : ""}>
              {link.label}<ArrowRight size={15} />
            </button>
          ))}
          <button type="button" onClick={() => navigate("admin")}><Shield size={15} /> Espace administrateur</button>
          <a href={whatsappUrl} target={whatsappUrl.startsWith("#") ? undefined : "_blank"} rel="noopener noreferrer"><MessageCircle size={16} /> Écrire sur WhatsApp</a>
        </div>
      )}
    </header>
  );
};
