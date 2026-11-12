import { getDb } from "./firebase";
import { callCloudFunction } from "./cloudFunctions";
import type { CustomerOrder, OrderItem, OrderStatus } from "../types";

function createRequestId(): string {
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    throw new Error("Ce navigateur ne permet pas de sécuriser la référence de commande. Mettez-le à jour puis réessayez.");
  }
  return crypto.randomUUID();
}
async function database() {
  const db = await getDb();
  if (!db) throw new Error("Firebase/Firestore n'est pas configuré. Aucune commande n'est enregistrée en stockage local.");
  return db;
}

export const orderService = {
  async createWebsite(input: {
    customerName: string; customerPhone: string; city: string; address: string; notes: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<{ orderId: string; orderNumber: string; subtotal: number; duplicate?: boolean }> {
    return callCloudFunction<typeof input & { requestId: string }, { orderId: string; orderNumber: string; subtotal: number; duplicate?: boolean }>(
      "createWebsiteOrder", { ...input, requestId: createRequestId() },
    );
  },
  async list(): Promise<CustomerOrder[]> {
    const db = await database();
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const snapshot = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as CustomerOrder);
  },
  async createManual(input: {
    source: "whatsapp" | "admin"; customerName: string; customerPhone: string; city: string;
    address: string; items: OrderItem[]; notes: string;
  }): Promise<void> {
    if (!input.customerName.trim() || !input.customerPhone.trim() || !input.city.trim() || !input.items.length) {
      throw new Error("Le nom, le téléphone, la ville/quartier et au moins un article sont obligatoires.");
    }
    if (input.items.length > 20 || input.items.some((item) => !item.productId || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 50)) {
      throw new Error("La commande contient une référence ou une quantité invalide.");
    }
    await callCloudFunction("createManualOrder", {
      requestId: createRequestId(), source: input.source,
      customerName: input.customerName.trim(), customerPhone: input.customerPhone.trim(),
      city: input.city.trim(), address: input.address.trim(), notes: input.notes.trim(),
      items: input.items.map(({ productId, quantity }) => ({ productId, quantity })),
    });
  },
  async setDeliveryFee(orderId: string, fee: number, expectedUpdatedAt: string): Promise<void> {
    if (!Number.isSafeInteger(fee) || fee < 0) throw new Error("Les frais de livraison doivent être un montant entier positif ou nul.");
    if (!expectedUpdatedAt || expectedUpdatedAt.length > 50) throw new Error("Actualisez la commande avant de modifier ses frais de livraison.");
    await callCloudFunction("setOrderDeliveryFee", { orderId, fee, expectedUpdatedAt });
  },
  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    await callCloudFunction("updateOrderStatus", { orderId, status });
  },
  async markPaid(orderId: string): Promise<void> {
    await callCloudFunction("markOrderPaid", { orderId });
  },
};
