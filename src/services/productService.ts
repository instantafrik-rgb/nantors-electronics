/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDb, isFirebaseConfigured } from "./firebase";
import { authService } from "./authService";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "../data/seedProducts";
import { CategoryInfo, Product, CatalogFilter } from "../types";

const LOCAL_STORAGE_PRODUCTS_KEY = "nantors_electronics_products_v1";
const LOCAL_STORAGE_CATEGORIES_KEY = "nantors_electronics_categories_v1";
const LOCAL_STORAGE_DATA_SOURCE_KEY = "nantors_electronics_datasource";

function sanitizeForFirestore<T extends Record<string, any>>(
  obj: T,
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

class ProductService {
  private dataSource: "local" | "firebase" = "local";

  constructor() {
    try {
      const savedSource = localStorage.getItem(LOCAL_STORAGE_DATA_SOURCE_KEY);
      if (savedSource === "firebase" && isFirebaseConfigured()) {
        this.dataSource = "firebase";
      } else {
        this.dataSource = "local";
      }
      this.ensureLocalSeedData();
    } catch {
      this.dataSource = "local";
    }
  }

  private ensureLocalSeedData(): void {
    try {
      const rawProds = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (!rawProds) {
        localStorage.setItem(
          LOCAL_STORAGE_PRODUCTS_KEY,
          JSON.stringify(INITIAL_PRODUCTS),
        );
      } else if (rawProds.includes("/src/assets/images/")) {
        localStorage.setItem(
          LOCAL_STORAGE_PRODUCTS_KEY,
          rawProds.replace(/\/src\/assets\/images\//g, "/images/"),
        );
      }
      if (!localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) {
        localStorage.setItem(
          LOCAL_STORAGE_CATEGORIES_KEY,
          JSON.stringify(INITIAL_CATEGORIES),
        );
      }
    } catch {
      // ignore
    }
  }

  public getDataSource(): "local" | "firebase" {
    return this.dataSource;
  }

  public setDataSource(source: "local" | "firebase"): void {
    if (source === "firebase" && !isFirebaseConfigured()) {
      throw new Error(
        "La configuration Firebase n'est pas encore complétée (VITE_FIREBASE_API_KEY manquante).",
      );
    }
    this.dataSource = source;
    localStorage.setItem(LOCAL_STORAGE_DATA_SOURCE_KEY, source);
  }

  public async getCategories(): Promise<CategoryInfo[]> {
    if (this.dataSource === "firebase") {
      const db = await getDb();
      if (db) {
        try {
          const { collection, getDocs } = await import("firebase/firestore");
          const snapshot = await getDocs(collection(db, "categories"));
          return snapshot.docs.map(
            (docSnap) =>
              ({ id: docSnap.id, ...docSnap.data() }) as CategoryInfo,
          );
        } catch (err) {
          console.error("Erreur lecture catégories Firestore:", err);
          throw new Error("Impossible de charger les catégories depuis Firestore. Vérifiez la configuration et les règles Firebase.");
        }
      }
      throw new Error("Firebase est sélectionné mais Firestore n'est pas disponible.");
    }

    const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
  }

  public async getProducts(
    filter?: Partial<CatalogFilter>,
    includeUnavailable = false,
  ): Promise<Product[]> {
    let items: Product[] = [];
    const isSuperAdmin = authService.isCurrentFirebaseUserSuperAdmin();
    const canIncludeUnavailable = includeUnavailable && isSuperAdmin;

    if (this.dataSource === "firebase") {
      const db = await getDb();
      if (db) {
        try {
          const { collection, getDocs, query, where } =
            await import("firebase/firestore");
          const colRef = collection(db, "products");

          if (canIncludeUnavailable) {
            const snapshot = await getDocs(colRef);
            items = snapshot.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as Product,
            );
          } else {
            const q = query(colRef, where("isAvailable", "==", true));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              items = snapshot.docs.map(
                (d) => ({ id: d.id, ...d.data() }) as Product,
              );
            }
          }
        } catch (err) {
          console.error("Erreur lecture produits Firestore:", err);
          throw new Error("Impossible de charger les produits depuis Firestore. Les données locales de démonstration ne seront pas affichées.");

        }
      } else {
        throw new Error("Firebase est sélectionné mais Firestore n'est pas disponible.");
      }
    } else {
      items = this.getLocalProducts();
    }

    if (!canIncludeUnavailable) {
      items = items.filter((p) => p.isAvailable);
    }

    // Filtres (inchangés)
    if (filter?.search && filter.search.trim() !== "") {
      const q = filter.search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.features.some((f) => f.toLowerCase().includes(q)),
      );
    }
    if (filter?.category && filter.category !== "all") {
      items = items.filter((p) => p.category === filter.category);
    }
    if (filter?.inStockOnly) {
      items = items.filter(
        (p) =>
          p.isAvailable && (p.stockCount === undefined || p.stockCount > 0),
      );
    }
    if (filter?.sort) {
      switch (filter.sort) {
        case "featured":
          items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
        case "newest":
          items.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;
        case "price-asc":
          items.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          items.sort((a, b) => b.price - a.price);
          break;
        case "name-asc":
          items.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    return items;
  }

  public async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.getProducts({ inStockOnly: false }, false);
    return products.filter((p) => p.featured && p.isAvailable);
  }

  public async getProductById(id: string): Promise<Product | null> {
    if (this.dataSource === "firebase") {
      const db = await getDb();
      if (db) {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const docSnap = await getDoc(doc(db, "products", id));
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
          }
        } catch (err) {
          console.error("Erreur lecture produit Firestore:", err);
          throw new Error("Impossible de lire ce produit depuis Firestore.");
        }
      } else {
        throw new Error("Firebase est sélectionné mais Firestore n'est pas disponible.");
      }
    }
    const products = await this.getProducts({}, true);
    return products.find((p) => p.id === id) || null;
  }

  public async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts({}, true);
    return products.find((p) => p.slug === slug) || null;
  }

  public async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<Product> {
    const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    if (this.dataSource === "firebase") {
      const db = await getDb();
      if (db) {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          const sanitized = sanitizeForFirestore(newProduct);
          await setDoc(doc(db, "products", newId), sanitized);
          return newProduct;
        } catch (err) {
          console.error("Erreur écriture produit Firestore:", err);
          throw new Error("Le produit n'a pas été enregistré dans Firestore. Aucune copie locale de secours n'a été créée.");
        }
      }
      throw new Error("Firebase est sélectionné mais Firestore n'est pas disponible.");
    }

    const local = this.getLocalProducts();
    localStorage.setItem(
      LOCAL_STORAGE_PRODUCTS_KEY,
      JSON.stringify([newProduct, ...local]),
    );
    return newProduct;
  }

  public async updateProduct(
    id: string,
    updates: Partial<Product>,
  ): Promise<Product> {
    const now = new Date().toISOString();
    const payloadWithTime = { ...updates, updatedAt: now };

    if (this.dataSource === "firebase") {
      const db = await getDb();
      if (db) {
        try {
          const { doc, updateDoc, getDoc } = await import("firebase/firestore");
          const sanitized = sanitizeForFirestore(payloadWithTime);
          const docRef = doc(db, "products", id);
          await updateDoc(docRef, sanitized);
          const updatedSnap = await getDoc(docRef);
          return { id, ...updatedSnap.data() } as Product;
        } catch (err) {
          console.error("Erreur modification produit Firestore:", err);
          throw new Error("La modification n'a pas été enregistrée dans Firestore. Aucune copie locale de secours n'a été créée.");
        }
      }
      throw new Error("Firebase est sélectionné mais Firestore n'est pas disponible.");
    }

    const local = this.getLocalProducts();
    const index = local.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Produit introuvable (ID: ${id})`);

    const updatedProduct = { ...local[index], ...payloadWithTime };
    local[index] = updatedProduct;
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(local));
    return updatedProduct;
  }

  public async deleteProduct(id: string): Promise<void> {
    if (this.dataSource === "firebase") {
      const db = await getDb();
      if (db) {
        try {
          const { collection, doc, deleteDoc, getDocs } = await import("firebase/firestore");
          const ordersSnapshot = await getDocs(collection(db, "orders"));
          const hasOrderHistory = ordersSnapshot.docs.some((orderDoc) =>
            Array.isArray(orderDoc.data().items) &&
            orderDoc.data().items.some((item: any) => item.productId === id)
          );
          if (hasOrderHistory) {
            throw new Error("Ce produit figure dans l'historique des commandes. Désactivez sa disponibilité au lieu de le supprimer afin de préserver les mouvements de stock.");
          }
          await deleteDoc(doc(db, "products", id));
          return;
        } catch (err) {
          if (err instanceof Error && err.message.startsWith("Ce produit figure")) throw err;
          console.error("Erreur suppression produit Firestore:", err);
          throw new Error("La suppression n'a pas été effectuée dans Firestore.");
        }
      }
      throw new Error("Firebase est sélectionné mais Firestore n'est pas disponible.");
    }

    const local = this.getLocalProducts();
    localStorage.setItem(
      LOCAL_STORAGE_PRODUCTS_KEY,
      JSON.stringify(local.filter((p) => p.id !== id)),
    );
  }

  public async toggleProductAvailability(id: string): Promise<boolean> {
    const product = await this.getProductById(id);
    if (!product) throw new Error("Produit non trouvé");
    const newState = !product.isAvailable;
    await this.updateProduct(id, { isAvailable: newState });
    return newState;
  }

  public async toggleProductFeatured(id: string): Promise<boolean> {
    const product = await this.getProductById(id);
    if (!product) throw new Error("Produit non trouvé");
    const newState = !product.featured;
    await this.updateProduct(id, { featured: newState });
    return newState;
  }

  public resetToDemoData(): void {
    localStorage.setItem(
      LOCAL_STORAGE_PRODUCTS_KEY,
      JSON.stringify(INITIAL_PRODUCTS),
    );
    localStorage.setItem(
      LOCAL_STORAGE_CATEGORIES_KEY,
      JSON.stringify(INITIAL_CATEGORIES),
    );
  }

  private getLocalProducts(): Product[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  }
}

export const productService = new ProductService();
