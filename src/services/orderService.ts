import { getDb, getFirebaseApp } from "./firebase";
import type { CustomerOrder, OrderItem, OrderStatus } from "../types";

async function database() {
  const db = await getDb();
  if (!db) throw new Error("Firebase/Firestore n'est pas configuré. Aucune commande n'est enregistrée en stockage local.");
  return db;
}

export const orderService = {
  async createWebsite(input: {
    customerName: string;
    customerPhone: string;
    city: string;
    address: string;
    notes: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<{ orderId: string; orderNumber: string; subtotal: number }> {
    const app = await getFirebaseApp();
    if (!app) throw new Error("La commande en ligne n'est pas disponible : Firebase doit être configuré.");
    const { getFunctions, httpsCallable } = await import("firebase/functions");
    const callable = httpsCallable<typeof input, { orderId: string; orderNumber: string; subtotal: number }>(
      getFunctions(app, "europe-west1"),
      "createWebsiteOrder"
    );
    const response = await callable(input);
    return response.data;
  },

  async list(): Promise<CustomerOrder[]> {
    const db = await database();
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const snapshot = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as CustomerOrder);
  },

  async createManual(input: {
    source: "whatsapp" | "admin";
    customerName: string; customerPhone: string; city: string; address: string;
    items: OrderItem[]; notes: string;
  }): Promise<void> {
    const db = await database();
    if (!input.customerName.trim() || !input.customerPhone.trim() || !input.items.length) {
      throw new Error("Le nom, le téléphone et au moins un article sont obligatoires.");
    }
    if (input.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.unitPrice < 0)) {
      throw new Error("Un article contient un prix ou une quantité invalide.");
    }
    const { collection, doc, getDoc, runTransaction } = await import("firebase/firestore");
    const normalizedItems: OrderItem[] = [];
    const quantities = new Map<string, number>();
    for (const item of input.items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }
    for (const [productId, quantity] of quantities.entries()) {
      const productSnapshot = await getDoc(doc(db, "products", productId));
      if (!productSnapshot.exists()) throw new Error("Produit introuvable : " + productId);
      const product = productSnapshot.data();
      if (product.isAvailable !== true) throw new Error("Produit indisponible : " + product.name);
      normalizedItems.push({
        productId,
        productName: String(product.name),
        unitPrice: Number(product.price),
        quantity
      });
    }
    const subtotal = normalizedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const now = new Date().toISOString();
    const orderRef = doc(collection(db, "orders"));
    await runTransaction(db, async (transaction) => {
      transaction.set(orderRef, {
        ...input, items: normalizedItems,
        orderNumber: "NE-" + orderRef.id.slice(-8).toUpperCase(),
        subtotal, deliveryFee: null, total: null,
        status: "pending_confirmation", paymentStatus: "unpaid",
        paymentMethod: "cash_on_delivery", createdAt: now, updatedAt: now
      });
    });
  },

  async setDeliveryFee(orderId: string, fee: number): Promise<void> {
    if (!Number.isSafeInteger(fee) || fee < 0) throw new Error("Les frais de livraison doivent être un montant entier positif ou nul.");
    const db = await database();
    const { doc, runTransaction } = await import("firebase/firestore");
    const ref = doc(db, "orders", orderId);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists()) throw new Error("Commande introuvable.");
      const order = snapshot.data() as CustomerOrder;
      if (order.status !== "pending_confirmation") throw new Error("Les frais ne peuvent être modifiés qu'avant confirmation.");
      const total = order.subtotal + fee;
      if (!Number.isSafeInteger(total)) throw new Error("Le total de la commande dépasse la limite autorisée.");
      transaction.update(ref, { deliveryFee: fee, total, updatedAt: new Date().toISOString() });
    });
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const db = await database();
    const { collection, doc, runTransaction } = await import("firebase/firestore");
    const orderRef = doc(db, "orders", orderId);
    await runTransaction(db, async (transaction) => {
      const orderSnapshot = await transaction.get(orderRef);
      if (!orderSnapshot.exists()) throw new Error("Commande introuvable.");
      const order = orderSnapshot.data() as CustomerOrder;
      if (order.status === status) return;

      const allowedNextStatuses: Record<OrderStatus, OrderStatus[]> = {
        pending_confirmation: ["confirmed", "cancelled"],
        confirmed: ["preparing", "cancelled"],
        preparing: ["out_for_delivery", "cancelled"],
        out_for_delivery: ["delivered", "cancelled"],
        delivered: [],
        cancelled: []
      };
      if (!allowedNextStatuses[order.status]?.includes(status)) {
        throw new Error("Transition de statut non autorisée : " + order.status + " → " + status);
      }

      if (status === "confirmed" && order.status === "pending_confirmation") {
        if (order.deliveryFee === null) throw new Error("Ajoutez les frais de livraison avant de confirmer.");
        const checks = [];
        for (const item of order.items) {
          const productRef = doc(db, "products", item.productId);
          const productSnapshot = await transaction.get(productRef);
          if (!productSnapshot.exists()) throw new Error("Produit introuvable : " + item.productName);
          const stock = productSnapshot.data().stockCount;
          if (!Number.isInteger(stock) || stock < item.quantity) throw new Error("Stock insuffisant ou non renseigné : " + item.productName);
          checks.push({ item, productRef, stock });
        }
        for (const check of checks) {
          const remaining = check.stock - check.item.quantity;
          transaction.update(check.productRef, { stockCount: remaining, isAvailable: remaining > 0, updatedAt: new Date().toISOString() });
          const movementRef = doc(collection(db, "inventory_movements"));
          transaction.set(movementRef, { productId: check.item.productId, productName: check.item.productName, type: "order_out", quantity: check.item.quantity, orderId, createdAt: new Date().toISOString() });
        }
      } else if (status === "confirmed" && order.status !== "pending_confirmation") {
        throw new Error("Cette commande ne peut pas être confirmée depuis son statut actuel.");
      }

      if (status === "cancelled" && ["confirmed", "preparing", "out_for_delivery"].includes(order.status)) {
        const checks = [];
        for (const item of order.items) {
          const productRef = doc(db, "products", item.productId);
          const productSnapshot = await transaction.get(productRef);
          if (productSnapshot.exists()) checks.push({ item, productRef, stock: Number(productSnapshot.data().stockCount ?? 0) });
        }
        for (const check of checks) {
          const restored = check.stock + check.item.quantity;
          transaction.update(check.productRef, { stockCount: restored, isAvailable: restored > 0, updatedAt: new Date().toISOString() });
          const movementRef = doc(collection(db, "inventory_movements"));
          transaction.set(movementRef, { productId: check.item.productId, productName: check.item.productName, type: "order_return", quantity: check.item.quantity, orderId, createdAt: new Date().toISOString() });
        }
      }
      transaction.update(orderRef, { status, updatedAt: new Date().toISOString() });
    });
  },

  async markPaid(orderId: string): Promise<void> {
    const db = await database();
    const { doc, runTransaction } = await import("firebase/firestore");
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, "orders", orderId);
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists()) throw new Error("Commande introuvable.");
      const order = snapshot.data() as CustomerOrder;
      if (order.status !== "delivered") throw new Error("Le paiement ne peut être enregistré qu'après la livraison.");
      transaction.update(ref, { paymentStatus: "paid_on_delivery", updatedAt: new Date().toISOString() });
    });
  }
};
