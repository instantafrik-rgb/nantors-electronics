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
    <div className="py-12 md:py-20 bg-[#afbdc5] text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1769FF]">
            Service Client Réactif · Lomé
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contactez Nantor's Electronics
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed font-light">
            Une question sur un produit, un besoin de vérification de
            compatibilité ou une commande urgente ? Notre équipe vous accompagne pour vos questions et commandes.
          </p>
        </div>

        {/* 2-Column Split: Direct Channels & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct channels (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* WhatsApp Priority Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1769FF]/10 border border-[#1769FF]/20 flex items-center justify-center text-[#1769FF]">
                <MessageSquare className="w-6 h-6 fill-[#FF6B00] stroke-none" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Canal Prioritaire WhatsApp
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">
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
                  className="w-full py-3 px-4 bg-[#1769FF] hover:bg-[#0f56d9] text-white font-bold text-xs rounded-xl shadow-[0_2px_15px_rgba(23,105,255,0.16)] transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 fill-[#111111] stroke-none" />
                  <span>Démarrer une conversation WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Coordinates Cards */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1769FF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Showroom & Retrait
                  </h4>
                  <p className="mt-0.5 text-slate-700">
                    {config.shop.showroomAddress}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {config.shop.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Phone className="w-5 h-5 text-[#1769FF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Téléphone Direct
                  </h4>
                  <p className="mt-0.5 font-mono text-slate-700">
                    {config.shop.phoneFormatted}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Mail className="w-5 h-5 text-[#1769FF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Courriel Professionnel
                  </h4>
                  <p className="mt-0.5 text-slate-700">{config.shop.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Clock className="w-5 h-5 text-[#1769FF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Horaires d'Ouverture
                  </h4>
                  <p className="mt-0.5 text-slate-700">
                    {config.shop.workingHours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xl text-slate-900">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-1">
              Envoyez-nous un message direct
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-light">
              Remplissez ce formulaire et notre conseiller vous contactera pour confirmer les modalités de votre commande ou répondre à vos questions.
            </p>

            {submissionStatus === "opened" && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-[#1769FF]/40 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1769FF]/10 border border-[#1769FF]/30 flex items-center justify-center text-[#1769FF] mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Message préparé pour WhatsApp
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-md mx-auto">
                    Votre application WhatsApp a été ouverte avec votre message
                    pré-rempli.
                    <br />
                    <strong className="text-[#1769FF]">
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
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#1769FF]" />
                      <span>Rouvrir WhatsApp manuellement</span>
                    </a>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSubmissionStatus("idle")}
                    className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Rédiger un autre message
                  </button>
                </div>
              </div>
            )}

            {submissionStatus === "blocked" && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-amber-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Ouverture requise
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-md mx-auto">
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1769FF] hover:bg-[#0f56d9] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 fill-[#111111] stroke-none" />
                      <span>Ouvrir WhatsApp maintenant</span>
                    </a>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSubmissionStatus("idle")}
                    className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Modifier le formulaire
                  </button>
                </div>
              </div>
            )}

            {submissionStatus === "unconfigured" && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-amber-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-300 text-sm">
                    Service WhatsApp en cours de configuration
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-md mx-auto">
                    Le numéro WhatsApp commercial n'a pas encore été configuré
                    dans l'environnement de production. Pour toute question ou
                    commande urgente, veuillez nous contacter directement :
                  </p>
                  <div className="pt-2 font-mono text-xs text-slate-900 font-semibold space-y-1">
                    <div>📞 Téléphone : {config.shop.phoneFormatted}</div>
                    <div>✉️ Courriel : {config.shop.email}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSubmissionStatus("idle")}
                    className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
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
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nom & Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Koffi Mensah"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#1769FF] focus:ring-1 focus:ring-[#1769FF] placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Numéro de Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: +228 90..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#1769FF] focus:ring-1 focus:ring-[#1769FF] placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Objet de votre demande
                  </label>
                  <select
                    aria-label="Objet de votre demande"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#1769FF] cursor-pointer"
                  >
                    <option
                      value="Passer une commande urgente"
                      className="bg-slate-50"
                    >
                      Passer une commande urgente
                    </option>
                    <option
                      value="Demande de renseignements / compatibilité"
                      className="bg-slate-50"
                    >
                      Demande de renseignements / compatibilité
                    </option>
                    <option
                      value="Demande de devis pour entreprise (quantité)"
                      className="bg-slate-50"
                    >
                      Demande de devis pour entreprise (quantité)
                    </option>
                    <option
                      value="Service après-vente / garantie"
                      className="bg-slate-50"
                    >
                      Service après-vente / garantie
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Votre Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Indiquez les détails de votre demande ou le produit qui vous intéresse..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#1769FF] focus:ring-1 focus:ring-[#1769FF] placeholder:text-slate-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-[#1769FF] hover:bg-[#0f56d9] text-white font-bold text-xs rounded-xl shadow-[0_2px_15px_rgba(23,105,255,0.16)] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <Send className="w-4 h-4 fill-[#111111] stroke-none" />
                    <span>Transmettre vers WhatsApp</span>
                  </button>
                  <span className="block text-[11px] text-slate-400 text-center mt-2 font-light">
                    Votre message s'ouvre directement avec notre équipe
                    technique à Lomé.
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 text-[#1769FF] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Foire Aux Questions</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Questions fréquentes sur nos commandes et livraisons au Togo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
              >
                <h4 className="font-display font-semibold text-sm text-slate-900">
                  {item.q}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
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
