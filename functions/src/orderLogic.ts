export type OrderStatus = "pending_confirmation" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid_on_delivery";
export type DomainErrorCode = "invalid-argument" | "not-found" | "failed-precondition" | "already-exists";

export class OrderValidationError extends Error {
  constructor(public readonly code: DomainErrorCode, message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}
export interface RequestedItem { productId: string; quantity: number; }
export interface OrderItemSnapshot extends RequestedItem { productName: string; unitPrice: number; }
export interface CustomerDetails { customerName: string; customerPhone: string; city: string; address: string; notes: string; }
export interface ProductRecord { name?: unknown; isAvailable?: unknown; price?: unknown; stockCount?: unknown; }
export interface StockAdjustment { productId: string; quantity: number; previousStock: number; newStock: number; }

function requiredText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > maxLength) {
    throw new OrderValidationError("invalid-argument", `Le champ ${label} est invalide.`);
  }
  return value.trim();
}
export function validateRequestId(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new OrderValidationError("invalid-argument", "La référence de demande est invalide.");
  }
  return value.toLowerCase();
}
export function validateCustomerFields(data: Record<string, unknown>): CustomerDetails {
  const customerName = requiredText(data.customerName, "nom", 120);
  const customerPhone = requiredText(data.customerPhone, "téléphone", 30);
  const digits = customerPhone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) throw new OrderValidationError("invalid-argument", "Le numéro de téléphone est invalide.");
  const city = requiredText(data.city, "ville ou quartier", 120);
  const address = typeof data.address === "string" ? data.address.trim() : "";
  const notes = typeof data.notes === "string" ? data.notes.trim() : "";
  if (address.length > 300 || notes.length > 1000) throw new OrderValidationError("invalid-argument", "L'adresse ou la note est trop longue.");
  return { customerName, customerPhone, city, address, notes };
}
export function normalizeRequestedItems(value: unknown): RequestedItem[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) {
    throw new OrderValidationError("invalid-argument", "Une commande doit contenir entre 1 et 20 lignes d'articles.");
  }
  const quantities = new Map<string, number>();
  for (const rawItem of value) {
    if (!rawItem || typeof rawItem !== "object") throw new OrderValidationError("invalid-argument", "Une ligne d'article est invalide.");
    const item = rawItem as Record<string, unknown>;
    if (typeof item.productId !== "string" || item.productId.trim().length < 1 || item.productId.trim().length > 150 ||
        typeof item.quantity !== "number" || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
      throw new OrderValidationError("invalid-argument", "Une référence produit ou une quantité est invalide.");
    }
    const id = item.productId.trim();
    const next = (quantities.get(id) ?? 0) + item.quantity;
    if (next > 50) throw new OrderValidationError("invalid-argument", "La quantité maximale par produit est de 50.");
    quantities.set(id, next);
  }
  return [...quantities.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}
export function buildOrderItems(requested: RequestedItem[], products: Map<string, ProductRecord>): OrderItemSnapshot[] {
  return requested.map(({ productId, quantity }) => {
    const product = products.get(productId);
    if (!product) throw new OrderValidationError("not-found", "Un produit de la commande n'existe plus.");
    if (product.isAvailable !== true) throw new OrderValidationError("failed-precondition", `${String(product.name ?? "Un produit")} n'est plus disponible.`);
    if (typeof product.price !== "number" || !Number.isSafeInteger(product.price) || product.price <= 0) {
      throw new OrderValidationError("failed-precondition", "Le prix d'un produit est invalide.");
    }
    if (typeof product.stockCount !== "number" || !Number.isSafeInteger(product.stockCount) || product.stockCount < 0) {
      throw new OrderValidationError("failed-precondition", "Le stock d'un produit doit être renseigné avant toute commande.");
    }
    if (product.stockCount < quantity) throw new OrderValidationError("failed-precondition", `Stock insuffisant pour ${String(product.name ?? "un produit")}.`);
    const productName = typeof product.name === "string" && product.name.trim().length >= 2 ? product.name.trim() : "Article";
    return { productId, productName, unitPrice: product.price, quantity };
  });
}
export function calculateSubtotal(items: OrderItemSnapshot[]): number {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  if (!Number.isSafeInteger(subtotal) || subtotal <= 0) throw new OrderValidationError("failed-precondition", "Le montant de la commande est invalide.");
  return subtotal;
}
export function normalizeStoredOrderItems(value: unknown): OrderItemSnapshot[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) throw new OrderValidationError("failed-precondition", "Les lignes de cette commande sont invalides.");
  const grouped = new Map<string, OrderItemSnapshot>();
  for (const rawItem of value) {
    if (!rawItem || typeof rawItem !== "object") throw new OrderValidationError("failed-precondition", "Une ligne de commande est invalide.");
    const item = rawItem as Record<string, unknown>;
    if (typeof item.productId !== "string" || !item.productId.trim() ||
        typeof item.productName !== "string" || item.productName.trim().length < 2 ||
        typeof item.unitPrice !== "number" || !Number.isSafeInteger(item.unitPrice) || item.unitPrice <= 0 ||
        typeof item.quantity !== "number" || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
      throw new OrderValidationError("failed-precondition", "Une ligne de commande contient des données invalides.");
    }
    const id = item.productId.trim();
    const existing = grouped.get(id);
    const quantity = (existing?.quantity ?? 0) + item.quantity;
    if (quantity > 50) throw new OrderValidationError("failed-precondition", "La quantité cumulée d'un produit dépasse la limite autorisée.");
    grouped.set(id, { productId: id, productName: existing?.productName ?? item.productName.trim(), unitPrice: existing?.unitPrice ?? item.unitPrice, quantity });
  }
  return [...grouped.values()];
}
export function computeStockAdjustments(items: OrderItemSnapshot[], stockByProduct: Map<string, number>, direction: "deduct" | "restore"): StockAdjustment[] {
  return items.map((item) => {
    const stock = stockByProduct.get(item.productId);
    if (typeof stock !== "number" || !Number.isSafeInteger(stock) || stock < 0) {
      throw new OrderValidationError("failed-precondition", `Le stock de ${item.productName} est invalide ou non renseigné.`);
    }
    if (direction === "deduct" && stock < item.quantity) throw new OrderValidationError("failed-precondition", `Stock insuffisant pour ${item.productName}.`);
    const newStock = direction === "deduct" ? stock - item.quantity : stock + item.quantity;
    if (!Number.isSafeInteger(newStock) || newStock < 0) throw new OrderValidationError("failed-precondition", `Le nouveau stock de ${item.productName} est invalide.`);
    return { productId: item.productId, quantity: item.quantity, previousStock: stock, newStock };
  });
}
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};
export function assertStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return false;
  if (!allowedTransitions[current]?.includes(next)) throw new OrderValidationError("failed-precondition", `Transition de statut non autorisée : ${current} → ${next}`);
  return true;
}
export function assertPaymentAllowed(status: OrderStatus, paymentStatus: PaymentStatus, total: unknown): boolean {
  if (paymentStatus === "paid_on_delivery") return false;
  if (status !== "delivered") throw new OrderValidationError("failed-precondition", "Le paiement ne peut être enregistré qu'après la livraison.");
  if (typeof total !== "number" || !Number.isSafeInteger(total) || total < 0) throw new OrderValidationError("failed-precondition", "Le total de la commande doit être défini avant d'enregistrer le paiement.");
  return true;
}
export function isSameIdempotentOrder(existing: Record<string, unknown>, requestId: string): boolean {
  return existing.idempotencyKey === requestId && ["website", "whatsapp", "admin"].includes(String(existing.source));
}


export function calculateOrderTotalWithDeliveryFee(input: {
  status: unknown;
  currentUpdatedAt: unknown;
  expectedUpdatedAt: unknown;
  subtotal: unknown;
  deliveryFee: unknown;
}): number {
  if (input.status !== "pending_confirmation") {
    throw new OrderValidationError("failed-precondition", "Les frais ne peuvent être modifiés qu'avant confirmation.");
  }
  if (typeof input.currentUpdatedAt !== "string" ||
      typeof input.expectedUpdatedAt !== "string" ||
      input.expectedUpdatedAt.length > 50 ||
      input.expectedUpdatedAt !== input.currentUpdatedAt) {
    throw new OrderValidationError("failed-precondition", "Cette commande a été modifiée depuis son affichage. Actualisez-la avant de changer les frais.");
  }
  if (typeof input.subtotal !== "number" || !Number.isSafeInteger(input.subtotal) || input.subtotal <= 0) {
    throw new OrderValidationError("failed-precondition", "Le sous-total de la commande est invalide.");
  }
  if (typeof input.deliveryFee !== "number" || !Number.isSafeInteger(input.deliveryFee) ||
      input.deliveryFee < 0 || input.deliveryFee > 10000000) {
    throw new OrderValidationError("invalid-argument", "Les frais de livraison sont invalides.");
  }
  const total = input.subtotal + input.deliveryFee;
  if (!Number.isSafeInteger(total)) {
    throw new OrderValidationError("failed-precondition", "Le total de la commande dépasse la limite autorisée.");
  }
  return total;
}
