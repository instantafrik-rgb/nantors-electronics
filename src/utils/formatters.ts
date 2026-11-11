/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from '../config/environment';
import { Product } from '../types';

/**
 * Format a number to West African FCFA standard representation (e.g. "24 500 FCFA")
 */
export function formatFCFA(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} FCFA`;
}

/**
 * Clean phone number to WhatsApp international standard
 */
export function cleanWhatsAppNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/**
 * Verifies whether a valid, non-fictitious WhatsApp phone number is configured for Nantor's Electronics.
 * Rejects unconfigured values, placeholders, and dummy numbers like 22890000000.
 */
export function isWhatsAppConfigured(): boolean {
  const phone = cleanWhatsAppNumber(config.shop.whatsappNumber);
  if (!phone || phone.length < 8) return false;
  if (phone === '22890000000' || phone === '22800000000') return false;
  if (/^2280+$/.test(phone) || /^0+$/.test(phone)) return false;
  return true;
}

/**
 * Generates the tailored WhatsApp order click-to-chat URL with quantity and optional delivery note.
 * Guaranteed never to generate a WhatsApp link pointing to a fictitious or unconfigured number.
 */
export function generateWhatsAppOrderUrl(
  product: Product,
  customMessage?: string,
  quantity: number = 1
): string {
  if (!isWhatsAppConfigured()) {
    return '#contact';
  }

  const phone = cleanWhatsAppNumber(config.shop.whatsappNumber);
  const qty = Math.max(1, quantity);
  const totalPrice = product.price * qty;

  const textLines = [
    `Bonjour Nantor's Electronics ! 👋`,
    ``,
    `Je souhaite commander le produit suivant sur votre catalogue :`,
    `👉 Nom : ${product.name}`,
    `📦 Quantité : ${qty}`,
    `💰 Prix unitaire : ${formatFCFA(product.price)}`,
    qty > 1 ? `💵 Total estimé : ${formatFCFA(totalPrice)}` : null,
    `🏷️ Réf : #${product.id.slice(-6).toUpperCase()}`,
    ``,
    customMessage
      ? `📝 Précision livraison : ${customMessage}`
      : `📍 Je souhaite être livré avec paiement à la livraison (Cash on Delivery).`,
    ``,
    `Merci de me confirmer la prise en compte de ma commande !`,
  ].filter(Boolean) as string[];

  return `https://wa.me/${phone}?text=${encodeURIComponent(textLines.join('\n'))}`;
}

/**
 * Generates a direct WhatsApp question URL specifically about a given product.
 * Falls back safely to contact anchor if WhatsApp is not configured.
 */
export function generateWhatsAppProductQuestionUrl(product: Product): string {
  if (!isWhatsAppConfigured()) {
    return '#contact';
  }

  const phone = cleanWhatsAppNumber(config.shop.whatsappNumber);
  const text = [
    `Bonjour Nantor's Electronics ! 👋`,
    ``,
    `J'ai une question concernant un article de votre boutique :`,
    `👉 Article : ${product.name}`,
    `🏷️ Réf : #${product.id.slice(-6).toUpperCase()}`,
    `💰 Prix : ${formatFCFA(product.price)}`,
    ``,
    `Pouvez-vous me renseigner sur la compatibilité, la disponibilité ou les détails de livraison au Togo ?`,
    `Merci d'avance pour vos conseils !`,
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates a direct WhatsApp contact URL for general inquiries.
 * Falls back safely to contact anchor if WhatsApp is not configured.
 */
export function generateWhatsAppInquiryUrl(subject?: string): string {
  if (!isWhatsAppConfigured()) {
    return '#contact';
  }

  const phone = cleanWhatsAppNumber(config.shop.whatsappNumber);
  const text = subject
    ? `Bonjour Nantor's Electronics ! J'ai une question concernant : ${subject}`
    : `Bonjour Nantor's Electronics ! J'aimerais avoir des informations sur vos accessoires et disponibilités.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
