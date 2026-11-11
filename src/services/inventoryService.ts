import { getDb } from "./firebase";

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: "manual_in" | "manual_out" | "order_out" | "order_return";
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string;
  createdAt: string;
}

export const inventoryService = {
  async listMovements(): Promise<InventoryMovement[]> {
    const db = await getDb();
    if (!db) throw new Error("Firestore n'est pas configuré. L'historique de stock n'est pas disponible en mode local.");
    const { collection, getDocs } = await import("firebase/firestore");
    const snapshot = await getDocs(collection(db, "inventory_movements"));
    return snapshot.docs
      .map(entry => ({ id: entry.id, ...entry.data() }) as InventoryMovement)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async adjustStock(productId: string, delta: number, note: string): Promise<void> {
    if (!Number.isInteger(delta) || delta === 0) throw new Error("Saisissez une quantité entière différente de zéro.");
    const db = await getDb();
    if (!db) throw new Error("Firestore n'est pas configuré. Le stock ne peut pas être modifié en mode local.");
    const { collection, doc, runTransaction } = await import("firebase/firestore");
    const productRef = doc(db, "products", productId);
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(productRef);
      if (!snapshot.exists()) throw new Error("Produit introuvable.");
      const product = snapshot.data();
      const previousStock = Number(product.stockCount ?? 0);
      const newStock = previousStock + delta;
      if (!Number.isInteger(previousStock) || newStock < 0) throw new Error("Stock insuffisant pour cette sortie.");
      transaction.update(productRef, {
        stockCount: newStock,
        isAvailable: newStock > 0,
        updatedAt: new Date().toISOString()
      });
      const movementRef = doc(collection(db, "inventory_movements"));
      transaction.set(movementRef, {
        productId,
        productName: String(product.name),
        type: delta > 0 ? "manual_in" : "manual_out",
        quantity: Math.abs(delta),
        previousStock,
        newStock,
        note: note.trim(),
        createdAt: new Date().toISOString()
      });
    });
  }
};
