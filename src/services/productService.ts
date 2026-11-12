/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDb, isFirebaseConfigured } from "./firebase";
import { callCloudFunction } from "./cloudFunctions";
import { authService } from "./authService";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "../data/seedProducts";
import { CategoryInfo, Product, CatalogFilter } from "../types";

const LOCAL_STORAGE_PRODUCTS_KEY = "nantors_electronics_products_v1";
const LOCAL_STORAGE_CATEGORIES_KEY = "nantors_electronics_categories_v1";
const LOCAL_STORAGE_DATA_SOURCE_KEY = "nantors_electronics_datasource_v2";

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
      if (savedSource === "local") this.dataSource = "local";
      else if (isFirebaseConfigured()) this.dataSource = "firebase";
      else this.dataSource = "local";
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
        "La configuration Firebase est incomplète. Vérifiez les six variables VITE_FIREBASE_* dans Vercel.",
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
      try {
        return await callCloudFunction<Record<string, unknown>, Product>(
          "createCatalogProduct",
          sanitizeForFirestore(newProduct),
        );
      } catch (err) {
        console.error("Erreur création produit Firestore:", err);
        throw new Error(err instanceof Error ? err.message : "Le produit n'a pas été enregistré dans Firestore.");
      }
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
    if (this.dataSource === "firebase" && updates.stockCount !== undefined) {
      throw new Error("Le stock doit être modifié depuis l'onglet Stock afin de conserver un historique fiable.");
    }

    if (this.dataSource === "firebase") {
      const db = await getDb();
      if (db) {
        try {
          const { doc, updateDoc, getDoc, deleteField } = await import("firebase/firestore");
          const sanitized = sanitizeForFirestore(payloadWithTime);
          if (Object.prototype.hasOwnProperty.call(updates, "lowStockThreshold") && updates.lowStockThreshold === undefined) {
            sanitized.lowStockThreshold = deleteField();
          }
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
      try {
        await callCloudFunction("deleteCatalogProduct", { productId: id });
        return;
      } catch (err) {
        console.error("Erreur suppression produit Firestore:", err);
        throw new Error(err instanceof Error ? err.message : "La suppression du produit n'a pas été effectuée.");
      }
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

  public async createCategory(input: Omit<CategoryInfo, "id">): Promise<CategoryInfo> {
    const category: CategoryInfo = { ...input, id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    if (this.dataSource === "firebase") {
      const db = await getDb();
      if (!db) throw new Error("Firestore n'est pas disponible.");
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "categories", category.id), category);
      return category;
    }
    const categories = await this.getCategories();
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify([...categories, category]));
    return category;
  }

  public async updateCategory(id: string, updates: Partial<CategoryInfo>): Promise<void> {
    const categories = await this.getCategories();
    const existing = categories.find((category) => category.id === id);
    if (!existing) throw new Error("Catégorie introuvable.");

    if (updates.slug && updates.slug !== existing.slug) {
      const products = await this.getProducts({}, true);
      if (products.some((product) => product.category === existing.slug)) {
        throw new Error("Cette catégorie contient encore des produits. Réaffectez-les avant de modifier son identifiant.");
      }
    }

    if (this.dataSource === "firebase") {
      const db = await getDb();
      if (!db) throw new Error("Firestore n'est pas disponible.");
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "categories", id), updates);
      return;
    }

    const index = categories.findIndex((category) => category.id === id);
    categories[index] = { ...categories[index], ...updates };
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  }

  public async deleteCategory(id: string): Promise<void> {
    const category = (await this.getCategories()).find((item) => item.id === id);
    if (!category) throw new Error("Catégorie introuvable.");
    const products = await this.getProducts({}, true);
    if (products.some((product) => product.category === category.slug)) {
      throw new Error("Cette catégorie contient encore des produits. Réaffectez-les avant de la supprimer.");
    }
    if (this.dataSource === "firebase") {
      const db = await getDb();
      if (!db) throw new Error("Firestore n'est pas disponible.");
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "categories", id));
      return;
    }
    const categories = await this.getCategories();
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories.filter((item) => item.id !== id)));
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
