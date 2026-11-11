/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Eye, Check, Image as ImageIcon } from "lucide-react";
import { CategoryInfo, Product } from "../../types";
import { CloudinaryUploader } from "./CloudinaryUploader";
import { formatFCFA } from "../../utils/formatters";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    product: Omit<Product, "id" | "createdAt" | "updatedAt">,
    existingId?: string,
  ) => Promise<void>;
  productToEdit?: Product | null;
  categories: CategoryInfo[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]?.slug || "chargeurs");
  const [price, setPrice] = useState<string>("15000");
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [specKeys, setSpecKeys] = useState<string[]>([
    "Puissance",
    "Matériau",
    "Garantie",
  ]);
  const [specVals, setSpecVals] = useState<string[]>([
    "65W",
    "Aluminium",
    "12 mois",
  ]);
  const [featured, setFeatured] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [stockCount, setStockCount] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("3");
  const [sku, setSku] = useState("");
  const [badge, setBadge] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setPrice(String(productToEdit.price));
      setOriginalPrice(
        productToEdit.originalPrice ? String(productToEdit.originalPrice) : "",
      );
      setShortDescription(productToEdit.shortDescription);
      setDescription(productToEdit.description);
      setImages(productToEdit.images || []);
      setFeatures(
        productToEdit.features && productToEdit.features.length > 0
          ? productToEdit.features
          : [""],
      );

      const specs = productToEdit.specifications || {};
      setSpecKeys(Object.keys(specs));
      setSpecVals(Object.values(specs));

      setFeatured(productToEdit.featured);
      setStockCount(String(productToEdit.stockCount ?? 0));
      setLowStockThreshold(String(productToEdit.lowStockThreshold ?? 3));
      setSku(productToEdit.sku || "");
      setIsAvailable(productToEdit.isAvailable && (productToEdit.stockCount ?? 0) > 0);
      setBadge(productToEdit.badge || "");
    } else {
      // Defaults for new product
      setName("");
      setCategory(categories[0]?.slug || "chargeurs");
      setPrice("15000");
      setOriginalPrice("");
      setShortDescription("");
      setDescription("");
      setImages(["/images/product_gan_charger_1793629796501.jpg"]);
      setFeatures([""]);
      setSpecKeys([""]);
      setSpecVals([""]);
      setStockCount("0");
      setLowStockThreshold("3");
      setSku("");
      setFeatured(false);
      setIsAvailable(false);
      setBadge("");
    }
    setPreviewMode(false);
    setError(null);
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddFeature = () => setFeatures([...features, ""]);
  const handleRemoveFeature = (idx: number) =>
    setFeatures(features.filter((_, i) => i !== idx));
  const handleFeatureChange = (idx: number, val: string) => {
    const updated = [...features];
    updated[idx] = val;
    setFeatures(updated);
  };

  const handleAddSpec = () => {
    setSpecKeys([...specKeys, ""]);
    setSpecVals([...specVals, ""]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecKeys(specKeys.filter((_, i) => i !== idx));
    setSpecVals(specVals.filter((_, i) => i !== idx));
  };

  const handleSpecKeyChange = (idx: number, val: string) => {
    const updated = [...specKeys];
    updated[idx] = val;
    setSpecKeys(updated);
  };

  const handleSpecValChange = (idx: number, val: string) => {
    const updated = [...specVals];
    updated[idx] = val;
    setSpecVals(updated);
  };

  const handleAddImage = (url: string) => {
    setImages((prev) => [...prev, url]);
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveImageToFront = (idx: number) => {
    if (idx <= 0 || idx >= images.length) return;
    const target = images[idx];
    const filtered = images.filter((_, i) => i !== idx);
    setImages([target, ...filtered]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Veuillez renseigner le nom du produit");
      return;
    }

    if (!price.trim() || !Number.isSafeInteger(Number(price)) || Number(price) <= 0) {
      setError("Le prix doit être supérieur à 0 FCFA");
      return;
    }
    if (!Number.isSafeInteger(Number(stockCount)) || Number(stockCount) < 0) {
      setError("Le stock doit être un nombre entier positif ou nul.");
      return;
    }
    if (!Number.isSafeInteger(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0) {
      setError("Le seuil d'alerte doit être un entier positif ou nul.");
      return;
    }
    if (originalPrice && (!Number.isSafeInteger(Number(originalPrice)) || Number(originalPrice) < Number(price))) {
      setError("Le prix d'origine doit être supérieur ou égal au prix de vente.");
      return;
    }
    if (isAvailable && Number(stockCount) <= 0) {
      setError("Un produit ne peut être disponible sans stock positif.");
      return;
    }

    const specifications: Record<string, string> = {};
    specKeys.forEach((key, i) => {
      if (key.trim() && specVals[i]?.trim()) {
        specifications[key.trim()] = specVals[i].trim();
      }
    });

    const selectedCatInfo = categories.find((c) => c.slug === category);
    const categoryLabel = selectedCatInfo ? selectedCatInfo.name : category;

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const cleanFeatures = features.filter((f) => f.trim().length > 0);
    const validImages =
      images.length > 0
        ? images
        : ["/images/product_gan_charger_1793629796501.jpg"];

    setSaving(true);
    setError(null);
    try {
      await onSave(
        {
          name: name.trim(),
          slug,
          category,
          categoryLabel,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          shortDescription: shortDescription.trim() || name.trim(),
          description: description.trim() || shortDescription.trim(),
          features: cleanFeatures,
          specifications,
          images: validImages,
          featured,
          isAvailable,
          stockCount: Number(stockCount),
          lowStockThreshold: Number(lowStockThreshold),
          sku: sku.trim() || undefined,
          badge: badge.trim() || undefined,
        },
        productToEdit ? productToEdit.id : undefined,
      );
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 text-[#F3F0E9]">
      <div
        className="relative w-full max-w-3xl bg-[#141414] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/10 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Preview Toggle */}
        <div className="p-5 sm:px-8 border-b border-white/10 flex items-center justify-between bg-[#181818]">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#F3F0E9]">
              {productToEdit
                ? "Modifier le Produit"
                : "Ajouter un Nouveau Produit"}
            </h2>
            <p className="text-xs text-[#888888] font-light">
              Remplissez les détails techniques, le prix en FCFA et les photos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                previewMode
                  ? "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/40"
                  : "bg-[#1c1c1c] text-[#cccccc] border-white/10 hover:border-white/20"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>{previewMode ? "Retour Formulaire" : "Prévisualiser"}</span>
            </button>

            <button
              onClick={onClose}
              className="text-[#777777] hover:text-[#F3F0E9] p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Content Body: Form OR Preview */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {previewMode ? (
            /* Live Preview Container */
            <div className="bg-[#181818] rounded-2xl p-6 border border-white/10 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                Aperçu de la fiche produit en direct
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#141414] p-6 rounded-2xl border border-white/10">
                <div className="aspect-square bg-[#111111] rounded-xl overflow-hidden relative border border-white/5">
                  <img
                    src={
                      images[0] ||
                      "/images/product_gan_charger_1793629796501.jpg"
                    }
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                  {badge && (
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 text-[10px] font-black bg-[#FF6B00] text-[#111111] rounded shadow-sm">
                      {badge}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] uppercase tracking-wider text-[#777777] font-semibold block">
                    {category}
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#F3F0E9]">
                    {name || "Nom du produit exemple"}
                  </h3>
                  <div className="font-mono text-xl font-bold text-[#F3F0E9]">
                    {formatFCFA(Number(price) || 0)}
                    {originalPrice && (
                      <span className="text-xs text-[#666666] line-through ml-2">
                        {formatFCFA(Number(originalPrice))}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#999999] leading-relaxed font-light">
                    {shortDescription || "Description courte du produit..."}
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#e05f00] text-[#111111] font-bold rounded-xl text-xs shadow-sm cursor-pointer transition-colors"
                    >
                      Commander sur WhatsApp (Exemple)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Form Fields */
            <form
              id="product-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">
                    Nom du Produit *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex : Chargeur GaN Ultra-Rapide 65W Multi-Port"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option
                        key={c.id}
                        value={c.slug}
                        className="bg-[#1c1c1c] text-[#F3F0E9]"
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">Référence SKU (optionnelle)</label>
                  <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Ex : CHG-65W-001" className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#1769FF]" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">
                    Badge spécial (optionnel)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ex : Best-seller, Nouveau, Promo..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">
                    Prix de Vente (FCFA) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Ex : 6000"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">
                    Prix d'origine barré (FCFA - optionnel)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={originalPrice}
                    onChange={(e) =>
                      setOriginalPrice(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Ex : 29000 pour afficher une réduction"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] font-mono placeholder:text-[#555555]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#cccccc] mb-1">
                  Quantité en stock *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stockCount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStockCount(value);
                    if (Number(value) <= 0) setIsAvailable(false);
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#1769FF] font-mono"
                />
                <p className="mt-1 text-[11px] text-[#777777]">Le stock sera décrémenté uniquement à la confirmation d'une commande.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#cccccc] mb-1">Seuil d'alerte de stock</label>
                <input type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#1769FF] font-mono" />
                <p className="mt-1 text-[11px] text-[#777777]">Une alerte apparaît lorsque le stock atteint ce seuil.</p>
              </div>
              </div>

              {/* Toggles: Availability & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#181818] border border-white/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 accent-[#FF6B00] rounded"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#F3F0E9] block">
                      Disponible en Stock
                    </span>
                    <span className="text-[11px] text-[#777777]">
                      Les clients peuvent commander immédiatement
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#FF6B00] rounded"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#F3F0E9] block">
                      Produit en Vedette
                    </span>
                    <span className="text-[11px] text-[#777777]">
                      Affiché sur la page d'accueil
                    </span>
                  </div>
                </label>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-semibold text-[#cccccc] mb-1">
                  Description Courte (Affichée sur les cartes) *
                </label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Ex : Chargeur mural compact au Nitrure de Gallium 65W."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cccccc] mb-1">
                  Description Détaillée Complète
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détails complets sur l'ergonomie, les composants, la sécurité..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
                />
              </div>

              {/* Photo Management Section */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#cccccc]">
                  Galerie Photos ({images.length} photo
                  {images.length > 1 ? "s" : ""})
                </label>

                {/* Cloudinary Uploader */}
                <CloudinaryUploader onImageUploaded={handleAddImage} />

                {/* Image Thumbnails Strip */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {images.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#111111]"
                      >
                        <img
                          src={imgUrl}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-bold bg-[#FF6B00] text-white rounded">
                            Principale
                          </span>
                        )}
                        <div className="absolute inset-0 bg-[#111111]/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {i !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImageToFront(i)}
                              title="Définir comme principale"
                              className="p-1.5 bg-[#FF6B00] text-white font-bold rounded-lg hover:bg-[#e05f00] text-[10px] cursor-pointer"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Features List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#cccccc]">
                    Points Clés & Avantages
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-xs text-[#FF6B00] hover:text-[#e05f00] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un point</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) =>
                          handleFeatureChange(idx, e.target.value)
                        }
                        placeholder="Ex : Recharge un iPhone à 60% en 28 minutes"
                        className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
                      />
                      {features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-2 text-[#777777] hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications Table Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#cccccc]">
                    Spécifications Techniques (Clé - Valeur)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-xs text-[#FF6B00] hover:text-[#e05f00] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une ligne</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {specKeys.map((key, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) =>
                          handleSpecKeyChange(idx, e.target.value)
                        }
                        placeholder="Caractéristique (ex: Puissance)"
                        className="w-1/3 text-xs px-3 py-2 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
                      />
                      <input
                        type="text"
                        value={specVals[idx] || ""}
                        onChange={(e) =>
                          handleSpecValChange(idx, e.target.value)
                        }
                        placeholder="Valeur (ex: 65W Max)"
                        className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#1c1c1c] text-[#F3F0E9] border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
                      />
                      {specKeys.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(idx)}
                          className="p-2 text-[#777777] hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-8 border-t border-white/10 bg-[#181818] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-medium text-[#888888] hover:text-[#F3F0E9] rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#e05f00] text-[#111111] text-xs font-bold rounded-xl shadow-[0_2px_15px_rgba(255,107,0,0.3)] transition-all flex items-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              {saving
                ? "Enregistrement..."
                : productToEdit
                  ? "Mettre à jour"
                  : "Publier le Produit"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
