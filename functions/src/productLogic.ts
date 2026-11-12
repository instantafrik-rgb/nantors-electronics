export interface CatalogProductInput {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryLabel?: string;
  price: number;
  originalPrice?: number;
  shortDescription: string;
  description?: string;
  features: string[];
  specifications: Record<string, string>;
  images: string[];
  featured: boolean;
  isAvailable: boolean;
  stockCount: number;
  lowStockThreshold?: number;
  sku?: string;
  badge?: string;
}

export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requiredText(value: unknown, label: string, min: number, max: number): string {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
    throw new ProductValidationError(`Le champ ${label} est invalide.`);
  }
  return value.trim();
}

function optionalText(value: unknown, label: string, max: number): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || value.trim().length > max) {
    throw new ProductValidationError(`Le champ ${label} est invalide.`);
  }
  return value.trim();
}

function validImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 5 || value.length > 1500) return false;
  return /^https:\/\//i.test(value) || (value.startsWith("/") && !value.startsWith("//"));
}

export function validateCatalogProduct(value: unknown): CatalogProductInput {
  if (!isRecord(value)) throw new ProductValidationError("Les données du produit sont invalides.");

  const allowedFields = new Set([
    "id", "name", "slug", "category", "categoryLabel", "price", "originalPrice",
    "shortDescription", "description", "features", "specifications", "images",
    "featured", "isAvailable", "stockCount", "lowStockThreshold", "sku", "badge",
    "createdAt", "updatedAt",
  ]);
  if (Object.keys(value).some((key) => !allowedFields.has(key))) {
    throw new ProductValidationError("Le produit contient un champ non autorisé.");
  }

  const id = requiredText(value.id, "référence", 1, 100);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new ProductValidationError("La référence produit contient des caractères invalides.");
  const name = requiredText(value.name, "nom", 2, 200);
  const slug = requiredText(value.slug, "slug", 2, 200);
  if (!/^[a-z0-9-]+$/.test(slug)) throw new ProductValidationError("L'identifiant URL du produit est invalide.");
  const category = requiredText(value.category, "catégorie", 2, 100);

  const price = value.price;
  if (typeof price !== "number" || !Number.isSafeInteger(price) || price <= 0 || price > 50000000) {
    throw new ProductValidationError("Le prix doit être un montant entier positif en FCFA.");
  }
  const originalPrice = value.originalPrice;
  if (originalPrice !== undefined &&
      (typeof originalPrice !== "number" || !Number.isSafeInteger(originalPrice) || originalPrice < price || originalPrice > 50000000)) {
    throw new ProductValidationError("Le prix d'origine doit être un entier supérieur ou égal au prix de vente.");
  }

  const shortDescription = requiredText(value.shortDescription, "description courte", 2, 600);
  const description = optionalText(value.description, "description détaillée", 6000);
  const categoryLabel = optionalText(value.categoryLabel, "nom de catégorie", 100);
  const sku = optionalText(value.sku, "SKU", 100);
  const badge = optionalText(value.badge, "badge", 50);

  if (!Array.isArray(value.images) || value.images.length < 1 || value.images.length > 10 ||
      value.images.some((image) => !validImageUrl(image))) {
    throw new ProductValidationError("Ajoutez entre 1 et 10 photos hébergées en HTTPS ou dans le dossier public.");
  }
  const images = value.images as string[];

  const featuresValue = value.features ?? [];
  if (!Array.isArray(featuresValue) || featuresValue.length > 20 ||
      featuresValue.some((feature) => typeof feature !== "string" || feature.trim().length > 500)) {
    throw new ProductValidationError("La liste des caractéristiques est invalide.");
  }
  const features = featuresValue.map((feature) => (feature as string).trim()).filter(Boolean);

  const specificationsValue = value.specifications ?? {};
  if (!isRecord(specificationsValue) || Object.keys(specificationsValue).length > 30 ||
      Object.entries(specificationsValue).some(([key, item]) =>
        key.trim().length < 1 || key.length > 100 || typeof item !== "string" || item.length > 500
      )) {
    throw new ProductValidationError("Les spécifications techniques sont invalides.");
  }
  const specifications = Object.fromEntries(
    Object.entries(specificationsValue).map(([key, item]) => [key.trim(), (item as string).trim()])
  );

  const featured = value.featured ?? false;
  if (typeof featured !== "boolean") throw new ProductValidationError("L'état du produit vedette est invalide.");
  if (typeof value.isAvailable !== "boolean") throw new ProductValidationError("L'état de visibilité du produit est invalide.");
  const stockCount = value.stockCount;
  if (typeof stockCount !== "number" || !Number.isSafeInteger(stockCount) || stockCount < 0) {
    throw new ProductValidationError("Le stock initial doit être un entier positif ou nul.");
  }
  const lowStockThreshold = value.lowStockThreshold;
  if (lowStockThreshold !== undefined &&
      (typeof lowStockThreshold !== "number" || !Number.isSafeInteger(lowStockThreshold) || lowStockThreshold < 0 || lowStockThreshold > 100000)) {
    throw new ProductValidationError("Le seuil spécifique doit être un entier entre 0 et 100 000.");
  }

  return {
    id, name, slug, category,
    ...(categoryLabel !== undefined ? { categoryLabel } : {}),
    price,
    ...(originalPrice !== undefined ? { originalPrice } : {}),
    shortDescription,
    ...(description !== undefined ? { description } : {}),
    features, specifications, images, featured,
    isAvailable: value.isAvailable,
    stockCount,
    ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
    ...(sku !== undefined ? { sku } : {}),
    ...(badge !== undefined ? { badge } : {}),
  };
}

export interface InitialStockMovement {
  productId: string;
  productName: string;
  type: "manual_in";
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string;
  createdAt: string;
}

export function buildInitialStockMovement(
  product: CatalogProductInput,
  createdAt: string,
): InitialStockMovement | null {
  if (product.stockCount === 0) return null;
  return {
    productId: product.id,
    productName: product.name,
    type: "manual_in",
    quantity: product.stockCount,
    previousStock: 0,
    newStock: product.stockCount,
    note: "Stock initial à la création du produit",
    createdAt,
  };
}
