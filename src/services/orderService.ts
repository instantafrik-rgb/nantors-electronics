import { getDb } from "./firebase";
import type { CustomerOrder, OrderItem, OrderStatus } from "../types";

const requireDb = async () => {
  const db = await getDb();
  if (!db) throw new Error("Firebase/Firestore n'est pas configuré. Les commandes ne sont pas enregistrées localement : configurez Firebase avant utilisation.");
  return db;
};

export const orderService = {
  async list(): Promise<CustomerOrder[]> {
    const db = await requireDb();
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as CustomerOrder);
  },

  async createManual(input: {
    source: "whatsapp" | "admin";
    customerName: string; customerPhone: string; city: string; address: string;
    items: OrderItem[]; notes: string;
  }): Promise<void> {
    const db = await requireDb();
    if (!input.customerName.trim() || !input.customerPhone.trim() || !input.items.length) {
      throw new Error("Nom, téléphone et au moins un article sont obligatoires.");
    }
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const now = new Date().toISOString();
    const ref = await addDoc(collection(db, "orders"), {
      ...input,
      orderNumber: "NE-" + Date.now().toString().slice(-8),
      subtotal, deliveryFee: null, total: null,
      status: "pending_confirmation", paymentStatus: "unpaid",
      paymentMethod: "cash_on_delivery",
      createdAt: now, updatedAt: now, createdAtServer: serverTimestamp()
    });
    // Use the Firestore document id as the stable order identifier.
    const { updateDoc, doc } = await import("firebase/firestore");
    await updateDoc(doc(db, "orders", ref.id), { id: ref.id });
  },

  async setDeliveryFee(orderId: string, fee: number): Promise<void> {
    if (!Number.isFinite(fee) || fee < 0) throw new Error("Frais de livraison invalide.");
    const db = await requireDb();
    const { doc, updateDoc, getDoc } = await import("firebase/firestore");
    const ref = doc(db, "orders", orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Commande introuvable.");
    const order = snap.data() as CustomerOrder;
    if (order.status !== "pending_confirmation") throw new Error("Les frais ne peuvent être modifiés qu'avant confirmation.");
    await updateDoc(ref, { deliveryFee: fee, total: order.subtotal + fee, updatedAt: new Date().toISOString() });
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const db = await requireDb();
    const { doc, runTransaction, collection } = await import("firebase/firestore");
    const orderRef = doc(db, "orders", orderId);
    await runTransaction(db, async tx => {
      const snap = await tx.get(orderRef);
      if (!snap.exists()) throw new Error("Commande introuvable.");
      const order = snap.data() as CustomerOrder;
      if (status === "confirmed" && order.status === "pending_confirmation") {
        if (order.deliveryFee === null) throw new Error("Ajoutez les frais de livraison avant de confirmer la commande.");
        for (const item of order.items) {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await tx.get(productRef);
          if (!productSnap.exists()) throw new Error("Un produit de cette commande n'existe plus.");
          const stock = productSnap.data().stockCount;
          if (typeof stock !== "number" || stock < item.quantity) {
            throw new Error("Stock insuffisant ou non renseigné pour : " + item.productName);
          }
          tx.update(productRef, { stockCount: stock - item.quantity, isAvailable: stock - item.quantity > 0, updatedAt: new Date().toISOString() });
          const movementRef = doc(collection(db, "inventory_movements"));
          tx.set(movementRef, { productId: item.productId, productName: item.productName, type: "order_out", quantity: item.quantity, orderId, createdAt: new Date().toISOString(), note: "Déduction à la confirmation de commande" });
        }
      }
      if (status === "cancelled" && order.status !== "cancelled" && order.status !== "pending_confirmation") {
        for (const item of order.items) {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await tx.get(productRef);
          if (productSnap.exists()) {
            const stock = Number(productSnap.data().stockCount ?? 0) + item.quantity;
            tx.update(productRef, { stockCount: stock, isAvailable: stock > 0, updatedAt: new Date().toISOString() });
            const movementRef = doc(collection(db, "inventory_movements"));
            tx.set(movementRef, { productId: item.productId, productName: item.productName, type: "order_return", quantity: item.quantity, orderId, createdAt: new Date().toISOString(), note: "Réintégration après annulation" });
          }
        }
      }
      tx.update(orderRef, { status, updatedAt: new Date().toISOString() });
    });
  },

  async markPaid(orderId: string): Promise<void> {
    const db = await requireDb();
    const { doc, updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(db, "orders", orderId), { paymentStatus: "paid_on_delivery", updatedAt: new Date().toISOString() });
  }
};
