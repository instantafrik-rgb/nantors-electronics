import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();

type RequestedItem = { productId: string; quantity: number };

function requiredText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > maxLength) {
    throw new HttpsError("invalid-argument", `Le champ ${label} est invalide.`);
  }
  return value.trim();
}

export const createWebsiteOrder = onCall(
  { region: "europe-west1", enforceAppCheck: false, maxInstances: 10 },
  async (request) => {
    const customerName = requiredText(request.data?.customerName, "nom", 120);
    const customerPhone = requiredText(request.data?.customerPhone, "téléphone", 30);
    const phoneDigits = customerPhone.replace(/\\D/g, "");
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      throw new HttpsError("invalid-argument", "Le numéro de téléphone est invalide.");
    }
    const city = requiredText(request.data?.city, "ville ou quartier", 120);
    const address = typeof request.data?.address === "string" ? request.data.address.trim().slice(0, 300) : "";
    const notes = typeof request.data?.notes === "string" ? request.data.notes.trim().slice(0, 1000) : "";
    const requestedItems = request.data?.items as RequestedItem[];

    if (!Array.isArray(requestedItems) || requestedItems.length < 1 || requestedItems.length > 20) {
      throw new HttpsError("invalid-argument", "Une commande doit contenir entre 1 et 20 articles.");
    }

    const quantities = new Map<string, number>();
    for (const item of requestedItems) {
      if (!item || typeof item.productId !== "string" || item.productId.length > 150 ||
          !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
        throw new HttpsError("invalid-argument", "Un article contient une référence ou une quantité invalide.");
      }
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }

    const orderItems = [];
    for (const [productId, quantity] of quantities.entries()) {
      const snapshot = await db.collection("products").doc(productId).get();
      if (!snapshot.exists) throw new HttpsError("not-found", "Un produit de la commande n'existe plus.");
      const product = snapshot.data()!;
      if (product.isAvailable !== true) throw new HttpsError("failed-precondition", `${product.name ?? "Un produit"} n'est plus disponible.`);
      if (typeof product.price !== "number" || !Number.isFinite(product.price) || product.price < 0) {
        throw new HttpsError("failed-precondition", "Le prix d'un produit est invalide.");
      }
      orderItems.push({
        productId,
        productName: String(product.name ?? "Article"),
        unitPrice: product.price,
        quantity
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    if (!Number.isSafeInteger(subtotal) || subtotal < 0) {
      throw new HttpsError("failed-precondition", "Le montant de la commande est invalide.");
    }

    const orderRef = db.collection("orders").doc();
    const orderNumber = "NE-" + orderRef.id.slice(-8).toUpperCase();
    const order = {
      orderNumber,
      source: "website",
      customerName,
      customerPhone,
      city,
      address,
      notes,
      items: orderItems,
      subtotal,
      deliveryFee: null,
      total: null,
      status: "pending_confirmation",
      paymentStatus: "unpaid",
      paymentMethod: "cash_on_delivery",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "website",
      schemaVersion: 1
    };

    await orderRef.set(order);
    return { orderId: orderRef.id, orderNumber, subtotal };
  }
);
