/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { config } from "../../config/environment";
import {
  cleanWhatsAppNumber,
  generateWhatsAppInquiryUrl,
  isWhatsAppConfigured,
} from "../../utils/formatters";

export const ContactPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Passer une commande urgente");
  const [message, setMessage] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "opened" | "unconfigured" | "blocked"
  >("idle");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isWhatsAppConfigured()) {
      setSubmissionStatus("unconfigured");
      return;
    }

    // Prepare formatted WhatsApp message
    const text = [
      `Bonjour Nantor's Electronics !`,
      ``,
      `📩 Message depuis le formulaire de contact :`,
      `👤 Nom : ${fullName.trim()}`,
      `📞 Téléphone : ${phone.trim()}`,
      `📌 Objet : ${subject}`,
      `💬 Message : ${message.trim()}`,
    ].join("\n");

    const cleanNum = cleanWhatsAppNumber(config.shop.whatsappNumber);
    const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
    setWhatsappUrl(url);

    try {
      window.location.assign(url);
    } catch {
      setSubmissionStatus("blocked");
    }
  };

  const faqItems = [
    {
      q: "Comment s'effectue la commande sur WhatsApp ?",
      a: 'Cliquez simplement sur le bouton "Commander sur WhatsApp" présent sur la fiche du produit souhaité. Un message prérempli avec la référence et le prix s\'ouvre directement dans votre application WhatsApp. Vous précisez simplement votre quartier à Lomé ou votre ville au Togo pour convenir du créneau de livraison.',
    },
    {
      q: "Comment fonctionne le Paiement à la Livraison ?",
      a: "Nous n'exigeons aucun paiement préalable. Le règlement s'effectue en espèces auprès de notre livreur à Lomé ou lors du retrait en région une fois le colis réceptionné et vérifié par vos soins.",
    },
    {
      q: "Quels sont les délais de livraison au Togo ?",
      a: "Les délais dépendent de votre quartier ou de votre ville et de la disponibilité du produit. Notre équipe vous confirme les modalités et le créneau avant validation.",
    },
    {
      q: "Quelles sont les conditions de garantie ?",
      a: "Les conditions de garantie peuvent varier selon le produit. Elles sont précisées par notre équipe avant la confirmation de la commande.",
    },
  ];

  const waInquiryUrl = generateWhatsAppInquiryUrl();

  return (
    <div className="py-12 md:py-20 bg-[#111111] text-[#F3F0E9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
            Service Client Réactif · Lomé
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#F3F0E9] tracking-tight">
            Contactez Nantor's Electronics
          </h1>
          <p className="text-sm text-[#888888] leading-relaxed font-light">
            Une question sur un produit, un besoin de vérification de
            compatibilité ou une commande urgente ? Notre équipe vous accompagne pour vos questions et commandes.
          </p>
        </div>

        {/* 2-Column Split: Direct Channels & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct channels (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* WhatsApp Priority Card */}
            <div className="bg-[#141414] text-[#F3F0E9] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
                <MessageSquare className="w-6 h-6 fill-[#FF6B00] stroke-none" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#F3F0E9]">
                  Canal Prioritaire WhatsApp
                </h3>
                <p className="text-xs text-[#888888] mt-1 leading-relaxed font-light">
                  Le moyen le plus rapide d'obtenir une réponse ou de passer
                  commande avec échange direct avec notre équipe.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={waInquiryUrl}
                  target={waInquiryUrl.startsWith("#") ? undefined : "_blank"}
                  rel={
                    waInquiryUrl.startsWith("#")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="w-full py-3 px-4 bg-[#FF6B00] hover:bg-[#e05f00] text-[#111111] font-bold text-xs rounded-xl shadow-[0_2px_15px_rgba(255,107,0,0.3)] transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 fill-[#111111] stroke-none" />
                  <span>Démarrer une conversation WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Coordinates Cards */}
            <div className="bg-[#141414] rounded-3xl p-6 border border-white/10 shadow-sm space-y-4 text-xs text-[#999999]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F3F0E9] text-sm">
                    Showroom & Retrait
                  </h4>
                  <p className="mt-0.5 text-[#cccccc]">
                    {config.shop.showroomAddress}
                  </p>
                  <p className="text-[#777777] mt-0.5">
                    {config.shop.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                <Phone className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F3F0E9] text-sm">
                    Téléphone Direct
                  </h4>
                  <p className="mt-0.5 font-mono text-[#cccccc]">
                    {config.shop.phoneFormatted}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                <Mail className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F3F0E9] text-sm">
                    Courriel Professionnel
                  </h4>
                  <p className="mt-0.5 text-[#cccccc]">{config.shop.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                <Clock className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#F3F0E9] text-sm">
                    Horaires d'Ouverture
                  </h4>
                  <p className="mt-0.5 text-[#cccccc]">
                    {config.shop.workingHours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#141414] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl text-[#F3F0E9]">
            <h3 className="font-display text-xl font-bold text-[#F3F0E9] mb-1">
              Envoyez-nous un message direct
            </h3>
            <p className="text-xs text-[#888888] mb-6 font-light">
              Remplissez ce formulaire et notre conseiller vous contactera pour confirmer les modalités de votre commande ou répondre à vos questions.
            </p>

            {submissionStatus === "opened" && (
              <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-[#FF6B00]/40 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00] mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#F3F0E9] text-sm">
                    Message préparé pour WhatsApp
                  </h4>
                  <p className="text-xs text-[#cccccc] leading-relaxed max-w-md mx-auto">
                    Votre application WhatsApp a été ouverte avec votre message
                    pré-rempli.
                    <br />
                    <strong className="text-[#FF6B00]">
                      Appuyez sur le bouton d'envoi dans WhatsApp
                    </strong>{" "}
                    pour finaliser la transmission à notre équipe à Lomé.
                  </p>
                </div>
                {whatsappUrl && (
                  <div className="pt-1">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-[#F3F0E9] text-xs font-semibold rounded-xl border border-white/10 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Rouvrir WhatsApp manuellement</span>
                    </a>
                  </div>
                )}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => setSubmissionStatus("idle")}
                    className="text-xs text-[#888888] hover:text-[#F3F0E9] transition-colors cursor-pointer"
                  >
                    Rédiger un autre message
                  </button>
                </div>
              </div>
            )}

            {submissionStatus === "blocked" && (
              <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-amber-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#F3F0E9] text-sm">
                    Ouverture requise
                  </h4>
                  <p className="text-xs text-[#cccccc] leading-relaxed max-w-md mx-auto">
                    Votre navigateur a bloqué l'ouverture automatique de
                    l'onglet. Cliquez ci-dessous pour ouvrir WhatsApp avec votre
                    message pré-rempli :
                  </p>
                </div>
                {whatsappUrl && (
                  <div className="pt-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#e05f00] text-[#111111] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 fill-[#111111] stroke-none" />
                      <span>Ouvrir WhatsApp maintenant</span>
                    </a>
                  </div>
                )}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => setSubmissionStatus("idle")}
                    className="text-xs text-[#888888] hover:text-[#F3F0E9] transition-colors cursor-pointer"
                  >
                    Modifier le formulaire
                  </button>
                </div>
              </div>
            )}

            {submissionStatus === "unconfigured" && (
              <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-amber-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-300 text-sm">
                    Service WhatsApp en cours de configuration
                  </h4>
                  <p className="text-xs text-[#cccccc] leading-relaxed max-w-md mx-auto">
                    Le numéro WhatsApp commercial n'a pas encore été configuré
                    dans l'environnement de production. Pour toute question ou
                    commande urgente, veuillez nous contacter directement :
                  </p>
                  <div className="pt-2 font-mono text-xs text-[#F3F0E9] font-semibold space-y-1">
                    <div>📞 Téléphone : {config.shop.phoneFormatted}</div>
                    <div>✉️ Courriel : {config.shop.email}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => setSubmissionStatus("idle")}
                    className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-[#F3F0E9] text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
                  >
                    Retour au formulaire
                  </button>
                </div>
              </div>
            )}

            {submissionStatus === "idle" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#cccccc] mb-1">
                      Nom & Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Koffi Mensah"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] border border-white/10 text-[#F3F0E9] focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#cccccc] mb-1">
                      Numéro de Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: +228 90..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] border border-white/10 text-[#F3F0E9] focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#cccccc] mb-1">
                    Objet de votre demande
                  </label>
                  <select
                    aria-label="Objet de votre demande"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] border border-white/10 text-[#F3F0E9] focus:outline-none focus:border-[#FF6B00] cursor-pointer"
                  >
                    <option
                      value="Passer une commande urgente"
                      className="bg-[#1c1c1c]"
                    >
                      Passer une commande urgente
                    </option>
                    <option
                      value="Demande de renseignements / compatibilité"
                      className="bg-[#1c1c1c]"
                    >
                      Demande de renseignements / compatibilité
                    </option>
                    <option
                      value="Demande de devis pour entreprise (quantité)"
                      className="bg-[#1c1c1c]"
                    >
                      Demande de devis pour entreprise (quantité)
                    </option>
                    <option
                      value="Service après-vente / garantie"
                      className="bg-[#1c1c1c]"
                    >
                      Service après-vente / garantie
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#cccccc] mb-1">
                    Votre Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Indiquez les détails de votre demande ou le produit qui vous intéresse..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] border border-white/10 text-[#F3F0E9] focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-[#FF6B00] hover:bg-[#e05f00] text-[#111111] font-bold text-xs rounded-xl shadow-[0_2px_15px_rgba(255,107,0,0.3)] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <Send className="w-4 h-4 fill-[#111111] stroke-none" />
                    <span>Transmettre vers WhatsApp</span>
                  </button>
                  <span className="block text-[11px] text-[#666666] text-center mt-2 font-light">
                    Votre message s'ouvre directement avec notre équipe
                    technique à Lomé.
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-[#141414] rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 text-[#FF6B00] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Foire Aux Questions</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#F3F0E9]">
            Questions fréquentes sur nos commandes et livraisons au Togo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#181818] border border-white/5 space-y-2"
              >
                <h4 className="font-display font-semibold text-sm text-[#F3F0E9]">
                  {item.q}
                </h4>
                <p className="text-xs text-[#888888] leading-relaxed font-light">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
