import { createHash } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import {
  OrderValidationError, assertPaymentAllowed, assertStatusTransition, buildOrderItems,
  calculateSubtotal, computeStockAdjustments, isSameIdempotentOrder, normalizeRequestedItems,
  normalizeStoredOrderItems, validateCustomerFields, validateRequestId, type OrderStatus,
} from "./orderLogic.js";

initializeApp();
const db = getFirestore();
const OWNER_EMAIL = "instantafrik@gmail.com";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ORDERS = 6;
const ORDER_STATUSES: OrderStatus[] = ["pending_confirmation", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

function rethrowDomainError(error: unknown): never {
  if (error instanceof OrderValidationError) throw new HttpsError(error.code, error.message);
  throw error;
}
function requireOwner(auth: { uid: string; token: { email?: unknown; email_verified?: unknown } } | null | undefined): string {
  const email = typeof auth?.token.email === "string" ? auth.token.email.toLowerCase().trim() : "";
  if (!auth || email !== OWNER_EMAIL || auth.token.email_verified !== true) throw new HttpsError("permission-denied", "Accès réservé au propriétaire autorisé.");
  return auth.uid;
}
async function enforcePublicOrderRateLimit(ipAddress: string): Promise<void> {
  const key = createHash("sha256").update(ipAddress).digest("hex");
  const ref = db.collection("_public_order_rate_limits").doc(key);
  const now = Date.now();
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    const windowStart = typeof data?.windowStart === "number" ? data.windowStart : 0;
    const count = typeof data?.count === "number" ? data.count : 0;
    if (now - windowStart < RATE_LIMIT_WINDOW_MS && count >= RATE_LIMIT_MAX_ORDERS) {
      throw new HttpsError("resource-exhausted", "Trop de demandes depuis cette connexion. Réessayez dans quelques minutes.");
    }
    transaction.set(ref, now - windowStart >= RATE_LIMIT_WINDOW_MS ? { windowStart: now, count: 1 } : { windowStart, count: count + 1 });
  });
}
async function createOrderWithIdempotency(input: {
  requestId: string;
  source: "website" | "whatsapp" | "admin";
  createdBy: string;
  customer: ReturnType<typeof validateCustomerFields>;
  requestedItems: ReturnType<typeof normalizeRequestedItems>;
}) {
  const orderRef = db.collection("orders").doc(input.requestId);
  const now = new Date().toISOString();
  try {
    return await db.runTransaction(async (transaction) => {
      const existingSnapshot = await transaction.get(orderRef);
      if (existingSnapshot.exists) {
        const existing = existingSnapshot.data() as Record<string, unknown>;
        if (isSameIdempotentOrder(existing, input.requestId)) {
          return { orderId: orderRef.id, orderNumber: String(existing.orderNumber ?? ""), subtotal: Number(existing.subtotal ?? 0), duplicate: true };
        }
        throw new HttpsError("already-exists", "Cette référence de commande est déjà utilisée.");
      }
      const productRecords = new Map<string, { name?: unknown; isAvailable?: unknown; price?: unknown; stockCount?: unknown }>();
      for (const item of input.requestedItems) {
        const productSnapshot = await transaction.get(db.collection("products").doc(item.productId));
        if (productSnapshot.exists) productRecords.set(item.productId, productSnapshot.data() ?? {});
      }
      const orderItems = buildOrderItems(input.requestedItems, productRecords);
      const subtotal = calculateSubtotal(orderItems);
      const orderNumber = "NE-" + orderRef.id.slice(-8).toUpperCase();
      transaction.set(orderRef, {
        orderNumber, idempotencyKey: input.requestId, source: input.source,
        customerName: input.customer.customerName, customerPhone: input.customer.customerPhone,
        city: input.customer.city, address: input.customer.address, notes: input.customer.notes,
        items: orderItems, subtotal, deliveryFee: null, total: null,
        status: "pending_confirmation", paymentStatus: "unpaid", paymentMethod: "cash_on_delivery",
        createdAt: now, updatedAt: now, createdBy: input.createdBy, schemaVersion: 1,
      });
      return { orderId: orderRef.id, orderNumber, subtotal, duplicate: false };
    });
  } catch (error) {
    rethrowDomainError(error);
  }
}

export const createWebsiteOrder = onCall({ region: "europe-west1", enforceAppCheck: false, maxInstances: 10 }, async (request) => {
  try {
    const data = request.data as Record<string, unknown>;
    const requestId = validateRequestId(data?.requestId);
    const customer = validateCustomerFields(data ?? {});
    const requestedItems = normalizeRequestedItems(data?.items);
    await enforcePublicOrderRateLimit(request.rawRequest.ip || "unknown");
    return await createOrderWithIdempotency({ requestId, source: "website", createdBy: "website", customer, requestedItems });
  } catch (error) {
    rethrowDomainError(error);
  }
});

export const createManualOrder = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  try {
    const ownerUid = requireOwner(request.auth);
    const data = request.data as Record<string, unknown>;
    const source = data?.source;
    if (source !== "whatsapp" && source !== "admin") throw new HttpsError("invalid-argument", "La source de commande est invalide.");
    const requestId = validateRequestId(data?.requestId);
    const customer = validateCustomerFields(data ?? {});
    const requestedItems = normalizeRequestedItems(data?.items);
    return await createOrderWithIdempotency({ requestId, source, createdBy: ownerUid, customer, requestedItems });
  } catch (error) {
    rethrowDomainError(error);
  }
});

export const setOrderDeliveryFee = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  try {
    requireOwner(request.auth);
    const orderId = typeof request.data?.orderId === "string" ? request.data.orderId.trim() : "";
    const fee = request.data?.fee;
    if (!orderId || orderId.length > 150 || typeof fee !== "number" || !Number.isSafeInteger(fee) || fee < 0 || fee > 10000000) {
      throw new HttpsError("invalid-argument", "La référence ou les frais de livraison sont invalides.");
    }
    const orderRef = db.collection("orders").doc(orderId);
    const now = new Date().toISOString();
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(orderRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "Commande introuvable.");
      const order = snapshot.data()!;
      if (order.status !== "pending_confirmation") throw new HttpsError("failed-precondition", "Les frais ne peuvent être modifiés qu'avant confirmation.");
      if (typeof order.subtotal !== "number" || !Number.isSafeInteger(order.subtotal) || order.subtotal <= 0) throw new HttpsError("failed-precondition", "Le sous-total de la commande est invalide.");
      const total = order.subtotal + fee;
      if (!Number.isSafeInteger(total)) throw new HttpsError("failed-precondition", "Le total de la commande dépasse la limite autorisée.");
      transaction.update(orderRef, { deliveryFee: fee, total, updatedAt: now });
      return { orderId, deliveryFee: fee, total };
    });
  } catch (error) {
    rethrowDomainError(error);
  }
});

export const updateOrderStatus = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  try {
    requireOwner(request.auth);
    const orderId = typeof request.data?.orderId === "string" ? request.data.orderId.trim() : "";
    const nextStatus = request.data?.status;
    if (!orderId || orderId.length > 150 || typeof nextStatus !== "string" || !ORDER_STATUSES.includes(nextStatus as OrderStatus)) {
      throw new HttpsError("invalid-argument", "La commande ou le nouveau statut est invalide.");
    }
    const orderRef = db.collection("orders").doc(orderId);
    const now = new Date().toISOString();
    return await db.runTransaction(async (transaction) => {
      const orderSnapshot = await transaction.get(orderRef);
      if (!orderSnapshot.exists) throw new HttpsError("not-found", "Commande introuvable.");
      const order = orderSnapshot.data()!;
      const currentStatus = order.status as OrderStatus;
      const statusChanged = assertStatusTransition(currentStatus, nextStatus as OrderStatus);
      if (!statusChanged) return { changed: false, status: currentStatus };
      const shouldDeduct = nextStatus === "confirmed" && currentStatus === "pending_confirmation";
      const shouldRestore = nextStatus === "cancelled" && ["confirmed", "preparing", "out_for_delivery"].includes(currentStatus);

      if (shouldDeduct && (order.deliveryFee === null || typeof order.deliveryFee !== "number" || !Number.isSafeInteger(order.deliveryFee) ||
          typeof order.total !== "number" || !Number.isSafeInteger(order.total) || order.total !== order.subtotal + order.deliveryFee)) {
        throw new HttpsError("failed-precondition", "Définissez des frais de livraison valides avant de confirmer.");
      }
      if (shouldDeduct || shouldRestore) {
        const items = normalizeStoredOrderItems(order.items);
        const stockByProduct = new Map<string, number>();
        for (const item of items) {
          const productSnapshot = await transaction.get(db.collection("products").doc(item.productId));
          if (!productSnapshot.exists) throw new HttpsError("failed-precondition", `Le produit ${item.productName} est introuvable; le stock ne peut pas être ajusté.`);
          const stock = productSnapshot.data()?.stockCount;
          if (typeof stock !== "number" || !Number.isSafeInteger(stock) || stock < 0) {
            throw new HttpsError("failed-precondition", `Le stock de ${item.productName} est invalide ou non renseigné.`);
          }
          stockByProduct.set(item.productId, stock);
        }
        const adjustments = computeStockAdjustments(items, stockByProduct, shouldDeduct ? "deduct" : "restore");
        for (const adjustment of adjustments) {
          transaction.update(db.collection("products").doc(adjustment.productId), { stockCount: adjustment.newStock, updatedAt: now });
          const item = items.find((entry) => entry.productId === adjustment.productId)!;
          const movementRef = db.collection("inventory_movements").doc();
          transaction.set(movementRef, {
            productId: adjustment.productId, productName: item.productName,
            type: shouldDeduct ? "order_out" : "order_return", quantity: adjustment.quantity,
            previousStock: adjustment.previousStock, newStock: adjustment.newStock,
            note: shouldDeduct ? `Déduction à la confirmation de ${order.orderNumber}` : `Restitution après annulation de ${order.orderNumber}`,
            orderId, createdAt: now,
          });
        }
      }
      const updates: Record<string, unknown> = { status: nextStatus, updatedAt: now };
      if (nextStatus === "delivered") updates.deliveredAt = now;
      transaction.update(orderRef, updates);
      return { changed: true, status: nextStatus };
    });
  } catch (error) {
    rethrowDomainError(error);
  }
});

export const markOrderPaid = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  try {
    requireOwner(request.auth);
    const orderId = typeof request.data?.orderId === "string" ? request.data.orderId.trim() : "";
    if (!orderId || orderId.length > 150) throw new HttpsError("invalid-argument", "La référence de commande est invalide.");
    const orderRef = db.collection("orders").doc(orderId);
    const now = new Date().toISOString();
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(orderRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "Commande introuvable.");
      const order = snapshot.data()!;
      const shouldMarkPaid = assertPaymentAllowed(order.status as OrderStatus, order.paymentStatus === "paid_on_delivery" ? "paid_on_delivery" : "unpaid", order.total);
      if (!shouldMarkPaid) return { changed: false, paymentStatus: "paid_on_delivery" };
      transaction.update(orderRef, { paymentStatus: "paid_on_delivery", paidAt: now, updatedAt: now });
      return { changed: true, paymentStatus: "paid_on_delivery" };
    });
  } catch (error) {
    rethrowDomainError(error);
  }
});

export const adjustInventoryStock = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  try {
    requireOwner(request.auth);
    const productId = typeof request.data?.productId === "string" ? request.data.productId.trim() : "";
    const delta = request.data?.delta;
    const note = typeof request.data?.note === "string" ? request.data.note.trim() : "";
    if (!productId || productId.length > 150 || typeof delta !== "number" || !Number.isSafeInteger(delta) || delta === 0 || Math.abs(delta) > 1000000 || note.length > 250) {
      throw new HttpsError("invalid-argument", "Le produit, la quantité ou le motif du mouvement est invalide.");
    }
    const productRef = db.collection("products").doc(productId);
    const now = new Date().toISOString();
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(productRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "Produit introuvable.");
      const product = snapshot.data()!;
      const previousStock = product.stockCount ?? 0;
      if (typeof previousStock !== "number" || !Number.isSafeInteger(previousStock) || previousStock < 0) throw new HttpsError("failed-precondition", "Le stock actuel est invalide.");
      const newStock = previousStock + delta;
      if (!Number.isSafeInteger(newStock) || newStock < 0) throw new HttpsError("failed-precondition", "Stock insuffisant pour cette sortie.");
      transaction.update(productRef, { stockCount: newStock, updatedAt: now });
      const movementRef = db.collection("inventory_movements").doc();
      transaction.set(movementRef, {
        productId, productName: String(product.name ?? "Produit"), type: delta > 0 ? "manual_in" : "manual_out",
        quantity: Math.abs(delta), previousStock, newStock, note, createdAt: now,
      });
      return { productId, previousStock, newStock };
    });
  } catch (error) {
    rethrowDomainError(error);
  }
});
