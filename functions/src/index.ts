import { createHash } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import {
  OrderValidationError, assertPaymentAllowed, assertStatusTransition, buildOrderItems,
  calculateSubtotal, calculateOrderTotalWithDeliveryFee, computeStockAdjustments, isSameIdempotentOrder, normalizeRequestedItems,
  normalizeStoredOrderItems, validateCustomerFields, validateRequestId, type OrderStatus,
} from "./orderLogic.js";
import {
  buildInitialStockMovement, ProductValidationError, validateCatalogProduct, type CatalogProductInput,
} from "./productLogic.js";
import {
  assertCategoryCanBeDeleted, assertCategorySlugChangeAllowed, assertCategorySlugIsUnique,
  CategoryValidationError, validateCatalogCategory, type CatalogCategoryInput,
} from "./categoryLogic.js";

initializeApp();
const db = getFirestore();
const OWNER_EMAIL = "instantafrik@gmail.com";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ORDERS = 6;
const ORDER_STATUSES: OrderStatus[] = ["pending_confirmation", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

function rethrowDomainError(error: unknown): never {
  if (error instanceof OrderValidationError) throw new HttpsError(error.code, error.message);
  if (error instanceof ProductValidationError) throw new HttpsError("invalid-argument", error.message);
  if (error instanceof CategoryValidationError) throw new HttpsError(error.code, error.message);
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
  const requestFingerprint = createHash("sha256").update(JSON.stringify({
    source: input.source,
    customer: input.customer,
    requestedItems: [...input.requestedItems].sort((a, b) => a.productId.localeCompare(b.productId)),
  })).digest("hex");
  const now = new Date().toISOString();
  try {
    return await db.runTransaction(async (transaction) => {
      const existingSnapshot = await transaction.get(orderRef);
      if (existingSnapshot.exists) {
        const existing = existingSnapshot.data() as Record<string, unknown>;
        if (isSameIdempotentOrder(existing, input.requestId, requestFingerprint)) {
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
      for (const item of orderItems) {
        transaction.set(db.collection("product_order_history").doc(item.productId), {
          productId: item.productId,
          firstOrderId: orderRef.id,
          firstOrderNumber: orderNumber,
          createdAt: now,
        }, { merge: true });
      }
      transaction.set(orderRef, {
        orderNumber, idempotencyKey: input.requestId, requestFingerprint, source: input.source,
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

export const createCatalogProduct = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  requireOwner(request.auth);
  let product: CatalogProductInput;
  try {
    product = validateCatalogProduct(request.data);
  } catch (error) {
    rethrowDomainError(error);
  }

  const productRef = db.collection("products").doc(product.id);
  const now = new Date().toISOString();
  return db.runTransaction(async (transaction) => {
    const categoryQuery = db.collection("categories").where("slug", "==", product.category).limit(1);
    const [existing, categorySnapshot] = await Promise.all([
      transaction.get(productRef),
      transaction.get(categoryQuery),
    ]);
    if (existing.exists) throw new HttpsError("already-exists", "Cette référence produit existe déjà.");
    if (categorySnapshot.empty) throw new HttpsError("failed-precondition", "Choisissez une catégorie existante avant d'enregistrer le produit.");
    const record = { ...product, createdAt: now, updatedAt: now };
    transaction.create(productRef, record);

    const initialMovement = buildInitialStockMovement(product, now);
    if (initialMovement) {
      transaction.create(db.collection("inventory_movements").doc(), initialMovement);
    }
    return record;
  });
});

export const updateCatalogProduct = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  requireOwner(request.auth);
  const productId = typeof request.data?.productId === "string" ? request.data.productId.trim() : "";
  const updates = request.data?.updates;
  const requestedUnsetFields = request.data?.unsetFields;
  const clearableFields = ["categoryLabel", "originalPrice", "description", "lowStockThreshold", "sku", "badge"];
  if (!productId || productId.length > 150 || productId.includes("/") ||
      !updates || typeof updates !== "object" || Array.isArray(updates) ||
      (requestedUnsetFields !== undefined && (!Array.isArray(requestedUnsetFields) ||
        requestedUnsetFields.some((field: unknown) => typeof field !== "string" || !clearableFields.includes(field))))) {
    throw new HttpsError("invalid-argument", "La référence ou les modifications du produit sont invalides.");
  }
  const updateRecord = updates as Record<string, unknown>;
  const forbiddenFields = ["id", "createdAt", "updatedAt", "stockCount"];
  if (Object.keys(updateRecord).some((field) => forbiddenFields.includes(field))) {
    throw new HttpsError("failed-precondition", "La référence, la date de création et le stock ne peuvent pas être modifiés dans la fiche produit.");
  }

  const unsetFields = new Set<string>(requestedUnsetFields ?? []);
  for (const field of clearableFields) {
    if (Object.prototype.hasOwnProperty.call(updateRecord, field) &&
        (updateRecord[field] === null || updateRecord[field] === "")) unsetFields.add(field);
  }

  const productRef = db.collection("products").doc(productId);
  const now = new Date().toISOString();
  try {
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(productRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "Produit introuvable.");
      const current = snapshot.data()!;
      const mergedInput: Record<string, unknown> = { ...current, ...updateRecord, id: productId };
      for (const field of unsetFields) delete mergedInput[field];
      const product = validateCatalogProduct(mergedInput);
      if (product.stockCount !== current.stockCount) {
        throw new HttpsError("failed-precondition", "Le stock doit être modifié depuis l'onglet Stock afin de conserver un historique fiable.");
      }
      const categoryQuery = db.collection("categories").where("slug", "==", product.category).limit(1);
      const categorySnapshot = await transaction.get(categoryQuery);
      if (categorySnapshot.empty) throw new HttpsError("failed-precondition", "La catégorie sélectionnée n'existe plus. Actualisez le catalogue.");
      const patch: Record<string, unknown> = { ...product, updatedAt: now };
      for (const field of unsetFields) patch[field] = FieldValue.delete();
      transaction.update(productRef, patch);
      const result: Record<string, unknown> = { ...current, ...product, updatedAt: now };
      for (const field of unsetFields) delete result[field];
      return result;
    });
  } catch (error) {
    rethrowDomainError(error);
  }
});


export const createCatalogCategory = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  requireOwner(request.auth);
  let category: CatalogCategoryInput;
  try {
    category = validateCatalogCategory(request.data);
  } catch (error) {
    rethrowDomainError(error);
  }

  const categoryRef = db.collection("categories").doc();
  const duplicateQuery = db.collection("categories").where("slug", "==", category.slug).limit(1);
  try {
    return await db.runTransaction(async (transaction) => {
      const duplicates = await transaction.get(duplicateQuery);
      assertCategorySlugIsUnique(!duplicates.empty);
      const record = { id: categoryRef.id, ...category, createdAt: new Date().toISOString() };
      transaction.create(categoryRef, record);
      return record;
    });
  } catch (error) {
    rethrowDomainError(error);
  }
});

export const updateCatalogCategory = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  requireOwner(request.auth);
  const categoryId = typeof request.data?.categoryId === "string" ? request.data.categoryId.trim() : "";
  const updates = request.data?.updates;
  if (!categoryId || categoryId.length > 150 || categoryId.includes("/") ||
      !updates || typeof updates !== "object" || Array.isArray(updates)) {
    throw new HttpsError("invalid-argument", "La référence ou les modifications de catégorie sont invalides.");
  }

  const categoryRef = db.collection("categories").doc(categoryId);
  const now = new Date().toISOString();
  try {
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(categoryRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "Catégorie introuvable.");
      const current = snapshot.data()!;
      const merged = validateCatalogCategory({
        name: current.name,
        slug: current.slug,
        description: current.description ?? "",
        icon: current.icon ?? "package",
        ...(updates as Record<string, unknown>),
      });

      if (merged.slug !== current.slug) {
        const productsQuery = db.collection("products").where("category", "==", current.slug).limit(1);
        const duplicateQuery = db.collection("categories").where("slug", "==", merged.slug).limit(2);
        const [assignedProducts, duplicates] = await Promise.all([
          transaction.get(productsQuery),
          transaction.get(duplicateQuery),
        ]);
        assertCategorySlugChangeAllowed(String(current.slug ?? ""), merged.slug, !assignedProducts.empty);
        assertCategorySlugIsUnique(duplicates.docs.some((entry) => entry.id !== categoryId));
      }

      const record = { id: categoryId, ...merged, createdAt: current.createdAt ?? now, updatedAt: now };
      transaction.set(categoryRef, record);
      return record;
    });
  } catch (error) {
    rethrowDomainError(error);
  }
});

export const deleteCatalogCategory = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  requireOwner(request.auth);
  const categoryId = typeof request.data?.categoryId === "string" ? request.data.categoryId.trim() : "";
  if (!categoryId || categoryId.length > 150 || categoryId.includes("/")) {
    throw new HttpsError("invalid-argument", "La référence de catégorie est invalide.");
  }

  const categoryRef = db.collection("categories").doc(categoryId);
  try {
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(categoryRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "Catégorie introuvable.");
      const slug = snapshot.data()?.slug;
      if (typeof slug !== "string" || !slug) throw new HttpsError("failed-precondition", "L'identifiant de cette catégorie est invalide.");
      const assignedProducts = await transaction.get(
        db.collection("products").where("category", "==", slug).limit(1),
      );
      assertCategoryCanBeDeleted(!assignedProducts.empty);
      transaction.delete(categoryRef);
      return { categoryId, deleted: true };
    });
  } catch (error) {
    rethrowDomainError(error);
  }
});

export const deleteCatalogProduct = onCall({ region: "europe-west1", maxInstances: 5 }, async (request) => {
  requireOwner(request.auth);
  const productId = typeof request.data?.productId === "string" ? request.data.productId.trim() : "";
  if (!productId || productId.length > 150 || productId.includes("/")) {
    throw new HttpsError("invalid-argument", "La référence produit est invalide.");
  }

  const productRef = db.collection("products").doc(productId);
  const historyRef = db.collection("product_order_history").doc(productId);
  const movementQuery = db.collection("inventory_movements").where("productId", "==", productId).limit(1);
  const ordersQuery = db.collection("orders");

  return db.runTransaction(async (transaction) => {
    const productSnapshot = await transaction.get(productRef);
    if (!productSnapshot.exists) throw new HttpsError("not-found", "Produit introuvable.");
    const historySnapshot = await transaction.get(historyRef);
    const movementSnapshot = await transaction.get(movementQuery);
    const ordersSnapshot = await transaction.get(ordersQuery);
    const hasLegacyOrderHistory = ordersSnapshot.docs.some((orderSnapshot) => {
      const items = orderSnapshot.data().items;
      return Array.isArray(items) && items.some((item: unknown) =>
        Boolean(item) && typeof item === "object" && (item as Record<string, unknown>).productId === productId
      );
    });

    if (historySnapshot.exists || !movementSnapshot.empty || hasLegacyOrderHistory) {
      throw new HttpsError("failed-precondition", "Ce produit possède un historique de commandes ou de stock. Masquez-le au lieu de le supprimer afin de préserver les archives.");
    }
    transaction.delete(productRef);
    return { productId, deleted: true };
  });
});

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
    const expectedUpdatedAt = request.data?.expectedUpdatedAt;
    if (!orderId || orderId.length > 150 || typeof fee !== "number" ||
        !Number.isSafeInteger(fee) || fee < 0 || fee > 10000000 ||
        typeof expectedUpdatedAt !== "string" || expectedUpdatedAt.length < 1 || expectedUpdatedAt.length > 50) {
      throw new HttpsError("invalid-argument", "La référence, la version de commande ou les frais de livraison sont invalides.");
    }
    const orderRef = db.collection("orders").doc(orderId);
    const now = new Date().toISOString();
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(orderRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "Commande introuvable.");
      const order = snapshot.data()!;
      const total = calculateOrderTotalWithDeliveryFee({
        status: order.status,
        currentUpdatedAt: order.updatedAt,
        expectedUpdatedAt,
        subtotal: order.subtotal,
        deliveryFee: fee,
      });
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
