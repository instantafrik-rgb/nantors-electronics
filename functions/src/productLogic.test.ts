import assert from "node:assert/strict";
import test from "node:test";
import {
  buildInitialStockMovement,
  ProductValidationError,
  validateCatalogProduct,
} from "./productLogic.js";

const validProduct = {
  id: "prod-20261112-abcd",
  name: "Chargeur GaN 65W",
  slug: "chargeur-gan-65w",
  category: "chargeurs",
  categoryLabel: "Chargeurs",
  price: 24500,
  originalPrice: 29000,
  shortDescription: "Chargeur compact multiport.",
  description: "Chargeur USB-C.",
  features: ["USB-C Power Delivery"],
  specifications: { Puissance: "65W" },
  images: ["https://res.cloudinary.com/demo/image/upload/charger.jpg"],
  featured: true,
  isAvailable: true,
  stockCount: 6,
};

test("valide une fiche produit sans inventer de SKU ni de coût", () => {
  const product = validateCatalogProduct(validProduct);
  assert.equal(product.id, validProduct.id);
  assert.equal(product.price, 24500);
  assert.equal(product.stockCount, 6);
  assert.equal(product.sku, undefined);
  assert.equal("purchaseCost" in product, false);
});

test("refuse les montants non entiers, les photos base64 et les champs inconnus", () => {
  assert.throws(() => validateCatalogProduct({ ...validProduct, price: 24500.5 }), ProductValidationError);
  assert.throws(() => validateCatalogProduct({ ...validProduct, images: ["data:image/png;base64,AAAA"] }), ProductValidationError);
  assert.throws(() => validateCatalogProduct({ ...validProduct, purchaseCost: 10000 }), ProductValidationError);
});

test("enregistre le stock initial comme mouvement d'entrée", () => {
  const product = validateCatalogProduct(validProduct);
  assert.deepEqual(buildInitialStockMovement(product, "2026-11-12T20:00:00.000Z"), {
    productId: product.id,
    productName: product.name,
    type: "manual_in",
    quantity: 6,
    previousStock: 0,
    newStock: 6,
    note: "Stock initial à la création du produit",
    createdAt: "2026-11-12T20:00:00.000Z",
  });
  assert.equal(buildInitialStockMovement(validateCatalogProduct({ ...validProduct, stockCount: 0 }), "now"), null);
});

test("laisse le seuil global s'appliquer sans seuil produit explicite", () => {
  const product = validateCatalogProduct(validProduct);
  assert.equal(product.lowStockThreshold, undefined);
});
