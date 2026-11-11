/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Truck,
  ShieldCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  HelpCircle,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { Product } from '../../types';
import { orderService } from '../../services/orderService';
import {
  formatFCFA,
  generateWhatsAppProductQuestionUrl,
  isWhatsAppConfigured,
} from '../../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectCategory?: (slug: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectCategory,
}) => {
  if (!product) return null;

  // 1. Interactive Quantity State (minimum 1)
  const [quantity, setQuantity] = useState<number>(1);
  // Optional customized destination/delivery address for Togo
  const [customDeliveryNote, setCustomDeliveryNote] = useState<string>('');
  // 6. Circular gallery index & touch swipe
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderBusy, setOrderBusy] = useState(false);
  const [orderError, setOrderError] = useState('');

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/images/product_gan_charger_1793629796501.jpg'];

  const currentImage = images[selectedImageIndex] || images[0];

  // 2. Real price & quantity calculation
  const totalPrice = product.price * quantity;
  // 3. Question WhatsApp
  const whatsappQuestionUrl = generateWhatsAppProductQuestionUrl(product);

  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setQuantity((prev) => Math.min(20, prev + 1));

  // 6. Circular image navigation
  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Touch swipe support for gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleNextImage();
    } else if (diff < -45) {
      handlePrevImage();
    }
    setTouchStartX(null);
  };

  const handleWebsiteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !product.isAvailable) return;
    if (!isWhatsAppConfigured()) {
      setOrderError("Le numéro WhatsApp commercial doit être configuré avant l'activation des commandes en ligne.");
      return;
    }
    setOrderBusy(true);
    setOrderError('');
    try {
      const created = await orderService.createWebsite({
        customerName,
        customerPhone,
        city: customerCity,
        address: customerAddress,
        notes: customDeliveryNote,
        items: [{ productId: product.id, quantity }]
      });
      const details = `Commande ${created.orderNumber} · Client : ${customerName} · Téléphone : ${customerPhone} · Ville/quartier : ${customerCity} · Adresse : ${customerAddress} · ${customDeliveryNote}`;
      const messageUrl = generateWhatsAppOrderUrl(product, details, quantity);
      window.location.assign(messageUrl);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Impossible d'enregistrer votre commande. Réessayez ou contactez-nous sur WhatsApp.");
    } finally {
      setOrderBusy(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Extract real compatibility data from specifications or features
  const compatibilitySpecs = Object.entries(product.specifications || {}).filter(([k]) =>
    k.toLowerCase().includes('compatib') ||
    k.toLowerCase().includes('connect') ||
    k.toLowerCase().includes('port') ||
    k.toLowerCase().includes('matériau') ||
    k.toLowerCase().includes('norme')
  );

  const compatibilityFeatures = (product.features || []).filter((f) =>
    f.toLowerCase().includes('compatib') ||
    f.toLowerCase().includes('iphone') ||
    f.toLowerCase().includes('macbook') ||
    f.toLowerCase().includes('android') ||
    f.toLowerCase().includes('type-c') ||
    f.toLowerCase().includes('usb')
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#141414] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/10 overflow-hidden flex flex-col my-auto text-[#F3F0E9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-[#1f1f1f]/90 hover:bg-[#2a2a2a] text-[#F3F0E9] rounded-full flex items-center justify-center shadow-md transition-all border border-white/10 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Fermer la fiche produit"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Grid Split */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Gallery */}
          <div className="bg-[#111111] p-5 sm:p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
            {/* Main Image with circular navigation & touch swipe */}
            <div 
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-4/3 md:aspect-square w-full rounded-2xl overflow-hidden bg-[#181818] border border-white/10 shadow-sm mb-4 select-none"
            >
              <img
                src={currentImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold tracking-wider uppercase bg-[#111111]/90 text-[#FF6B00] border border-[#FF6B00]/30 rounded-lg shadow-sm">
                  {product.badge}
                </span>
              )}

              {/* 6. Navigation circular arrows on main image if multi-image */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#111111]/80 hover:bg-[#FF6B00] hover:text-white text-[#F3F0E9] shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
                    aria-label="Photo précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#111111]/80 hover:bg-[#FF6B00] hover:text-white text-[#F3F0E9] shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
                    aria-label="Photo suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#111111]/80 backdrop-blur-xs text-[10px] font-mono text-[#F3F0E9] border border-white/10 pointer-events-none">
                    {selectedImageIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail Strip if multi-image */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#FF6B00] shadow-[0_0_12px_rgba(255,107,0,0.4)]'
                        : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} miniature ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Reassurance pills on left bottom */}
            <div className="mt-6 pt-6 border-t border-white/10 hidden md:grid grid-cols-2 gap-3 text-xs text-[#888888]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span className="text-[#cccccc]">Modalités de livraison à confirmer</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span className="text-[#cccccc]">Conditions précisées avant commande</span>
              </div>
            </div>
          </div>

          {/* Right Column: Purchase Module & Details */}
          <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto bg-[#141414]">
            <div>
              {/* Category & Availability */}
              <div className="flex items-center justify-between text-xs mb-2">
                {onSelectCategory ? (
                  <button
                    type="button"
                    onClick={() => onSelectCategory(product.category)}
                    className="font-semibold uppercase tracking-widest text-[#777777] hover:text-[#FF6B00] transition-colors cursor-pointer text-left"
                    title={`Filtrer par ${product.categoryLabel || product.category}`}
                  >
                    {product.categoryLabel || product.category}
                  </button>
                ) : (
                  <span className="font-semibold uppercase tracking-widest text-[#777777]">
                    {product.categoryLabel || product.category}
                  </span>
                )}
                {product.isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 text-[#FF6B00] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    En Stock Immédiat
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">Disponibilité à confirmer</span>
                )}
              </div>

              {/* Product Title */}
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F3F0E9] leading-snug">
                {product.name}
              </h2>

              {/* 2. Price Banner & Instant Quantity Selector */}
              <div className="mt-4 p-4 rounded-2xl bg-[#1c1c1c] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-[#777777] block">Prix unitaire (Paiement à la livraison)</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono tabular-nums text-2xl font-bold text-[#F3F0E9]">
                      {formatFCFA(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="font-mono tabular-nums text-sm text-[#666666] line-through">
                        {formatFCFA(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {quantity > 1 && (
                    <span className="text-xs font-semibold text-[#FF6B00] block mt-1">
                      Total ({quantity} pièces) : {formatFCFA(totalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  {discountPercent && (
                    <span className="px-2.5 py-1 bg-[#FF6B00] text-[#111111] text-xs font-black rounded-lg shrink-0">
                      -{discountPercent}%
                    </span>
                  )}

                  {/* Quantity selector with + and - */}
                  <div className="flex items-center gap-1 bg-[#141414] border border-white/15 rounded-xl p-1 shadow-sm shrink-0">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center text-[#aaaaaa] hover:text-white rounded-lg hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-[#F3F0E9] font-mono select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={quantity >= 20}
                      className="w-7 h-7 flex items-center justify-center text-[#aaaaaa] hover:text-white rounded-lg hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <p className="mt-4 text-sm text-[#999999] leading-relaxed font-light">
                {product.description || product.shortDescription}
              </p>

              {/* 4. Dedicated Compatibility & 12-Month Guarantee Box */}
              <div className="mt-5 p-4 rounded-2xl bg-[#191919] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                  <span>Compatibilité & informations</span>
                </div>

                {/* Real compatibility data if present in specifications or features */}
                {compatibilitySpecs.length > 0 && (
                  <div className="text-xs text-[#cccccc] space-y-1 pt-1 border-t border-white/5">
                    {compatibilitySpecs.map(([k, v], idx) => (
                      <p key={`spec-${idx}`} className="flex items-start gap-1.5 text-xs text-[#cccccc]">
                        <Check className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                        <span><strong className="text-white">{k} :</strong> {v}</span>
                      </p>
                    ))}
                  </div>
                )}

                {compatibilitySpecs.length === 0 && compatibilityFeatures.length > 0 && (
                  <div className="text-xs text-[#cccccc] space-y-1 pt-1 border-t border-white/5">
                    {compatibilityFeatures.map((feat, idx) => (
                      <p key={`feat-${idx}`} className="flex items-start gap-1.5 text-xs text-[#cccccc]">
                        <Check className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </p>
                    ))}
                  </div>
                )}

                <p className="text-xs text-[#888888] leading-relaxed pt-0.5">
                  Les conditions de garantie éventuelles sont précisées lors de la confirmation de votre commande.
                </p>
              </div>

              {/* Key Features Bullet Points */}
              {product.features && product.features.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-xs font-semibold text-[#F3F0E9] uppercase tracking-wider mb-2.5">
                    Points Clés & Avantages
                  </h4>
                  <ul className="space-y-2 text-xs text-[#aaaaaa]">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Specifications Table */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xs font-semibold text-[#F3F0E9] uppercase tracking-wider mb-2.5">
                    Fiche Technique
                  </h4>
                  <div className="rounded-xl border border-white/10 overflow-hidden text-xs">
                    <table className="w-full border-collapse">
                      <tbody>
                        {Object.entries(product.specifications).map(([key, value], i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-[#181818]' : 'bg-[#141414]'}>
                            <td className="py-2 px-3 font-medium text-[#777777] border-b border-white/5 w-2/5">
                              {key}
                            </td>
                            <td className="py-2 px-3 text-[#F3F0E9] font-semibold border-b border-white/5">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. Optional note for Togo delivery with localized placeholder */}
              <div className="mt-5">
                <label className="block text-xs font-medium text-[#cccccc] mb-1">
                  Précision de livraison (Quartier, Ville, ou instructions)
                </label>
                <input
                  type="text"
                  value={customDeliveryNote}
                  onChange={(e) => setCustomDeliveryNote(e.target.value)}
                  placeholder="Ex : Lomé (Agoè, Hédzranawoé, Tokoin...) ou expédition en région (Kara, Sokodé...)"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-[#F3F0E9] focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555] transition-colors"
                />
              </div>
            </div>

            {/* Desktop Action Module */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
              {/* WhatsApp Primary Order CTA in Official Orange #FF6B00 */}
              <button
                type="button"
                onClick={() => { setCheckoutOpen(v => !v); setOrderError(''); }}
                disabled={!product.isAvailable}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-[0_2px_15px_rgba(23,105,255,0.18)] transition-all duration-200 ${
                  product.isAvailable
                    ? 'bg-[#1769FF] hover:bg-[#0f56d9] text-white active:scale-98 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>{checkoutOpen ? 'Fermer le formulaire' : `Commander sur WhatsApp ${quantity > 1 ? `(${quantity}x - ${formatFCFA(totalPrice)})` : ''}`}</span>
              </button>
              {checkoutOpen && (
                <form onSubmit={handleWebsiteOrder} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900">
                  <div><h4 className="font-semibold text-sm">Vos coordonnées de livraison</h4><p className="mt-1 text-xs text-slate-500">Votre demande sera enregistrée comme « À confirmer ». L'ouverture de WhatsApp ne confirme pas la commande.</p></div>
                  {orderError && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{orderError}</p>}
                  <input required minLength={2} maxLength={120} value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Nom complet *" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
                  <input required minLength={5} maxLength={30} value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="Téléphone *" type="tel" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
                  <input required minLength={2} maxLength={120} value={customerCity} onChange={e=>setCustomerCity(e.target.value)} placeholder="Ville / quartier *" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
                  <input maxLength={300} value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Adresse / repère (facultatif)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
                  <button disabled={orderBusy} type="submit" className="w-full rounded-xl bg-[#1769FF] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{orderBusy ? "Enregistrement…" : "Enregistrer et ouvrir WhatsApp"}</button>
                </form>
              )}

              {/* 3. Question WhatsApp secondary button */}
              <a
                href={whatsappQuestionUrl}
                target={whatsappQuestionUrl.startsWith('#') ? undefined : '_blank'}
                rel={whatsappQuestionUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-[#cccccc] bg-[#1f1f1f] hover:bg-[#252525] hover:text-white transition-colors flex items-center justify-center gap-2 border border-white/10 active:scale-98 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-[#FF6B00]" />
                <span>Poser une question sur ce produit</span>
              </a>

              <div className="flex items-center justify-between gap-3 text-xs text-[#777777] pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                  <span>Paiement en espèces à la réception</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#FF6B00]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Lien copié' : 'Partager'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Commande Sticky Mobile Bar (Visible only on mobile during scroll) in Official Orange #FF6B00 */}
        <div className="md:hidden sticky bottom-0 left-0 right-0 z-30 bg-[#111111]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#777777] font-medium">
              Total ({quantity} {quantity > 1 ? 'articles' : 'article'})
            </span>
            <span className="font-mono tabular-nums text-base font-bold text-[#F3F0E9]">
              {formatFCFA(totalPrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => { setCheckoutOpen(true); setOrderError(''); }}
            disabled={!product.isAvailable}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1769FF] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Commander</span>
          </button>
        </div>
      </div>
    </div>
  );
};
