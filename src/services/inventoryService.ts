import { getDb } from "./firebase";
import { callCloudFunction } from "./cloudFunctions";

export interface InventoryMovement {
  id: string; productId: string; productName: string;
  type: "manual_in" | "manual_out" | "order_out" | "order_return";
  quantity: number; previousStock: number; newStock: number; note: string; orderId?: string; createdAt: string;
}
export const inventoryService = {
  async listMovements(): Promise<InventoryMovement[]> {
    const db = await getDb();
    if (!db) throw new Error("Firestore n'est pas configuré. L'historique de stock n'est pas disponible en mode local.");
    const { collection, getDocs } = await import("firebase/firestore");
    const snapshot = await getDocs(collection(db, "inventory_movements"));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as InventoryMovement)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async adjustStock(productId: string, delta: number, note: string): Promise<void> {
    if (!productId || !Number.isSafeInteger(delta) || delta === 0) throw new Error("Choisissez un produit et une quantité entière différente de zéro.");
    if (note.trim().length > 250) throw new Error("Le motif du mouvement ne peut pas dépasser 250 caractères.");
    await callCloudFunction("adjustInventoryStock", { productId, delta, note: note.trim() });
  },
};
