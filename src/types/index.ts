/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProductCategory = 
  | 'chargeurs'
  | 'cables'
  | 'accessoires-telephonie'
  | 'accessoires-informatique'
  | 'audio-ecouteurs'
  | 'energie-batteries';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryLabel: string;
  price: number; // in FCFA
  originalPrice?: number; // in FCFA (strike-through original price if discounted)
  shortDescription: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  images: string[];
  featured: boolean;
  isAvailable: boolean;
  stockCount?: number;
  lowStockThreshold?: number;
  sku?: string;
  badge?: string; // e.g. "Best-seller", "Nouveau", "Promo"
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  paidAt?: string;
}

export interface CategoryInfo {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
}

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export type PriceRangeOption = 'all' | 'under-15k' | '15k-30k' | 'over-30k';

export interface CatalogFilter {
  search: string;
  category: string;
  sort: SortOption;
  priceRange: PriceRangeOption;
  inStockOnly: boolean;
}

export type OrderSource = "website" | "whatsapp" | "admin";
export type OrderStatus = "pending_confirmation" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid_on_delivery";
export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}
export interface CustomerOrder {
  id: string;
  orderNumber: string;
  source: OrderSource;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number | null;
  total: number | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "cash_on_delivery";
  notes: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  paidAt?: string;
}
