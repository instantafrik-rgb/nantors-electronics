import assert from "node:assert/strict";
import test from "node:test";
import {
  OrderValidationError, assertPaymentAllowed, assertStatusTransition, buildOrderItems,
  calculateSubtotal, calculateOrderTotalWithDeliveryFee, computeStockAdjustments, isSameIdempotentOrder, normalizeRequestedItems,
  normalizeStoredOrderItems, validateRequestId,
} from "./orderLogic.js";

const products = new Map([
  ["charger-1", { name: "Chargeur GaN 65W", isAvailable: true, price: 24500, stockCount: 8 }],
  ["cable-1", { name: "Câble USB-C", isAvailable: true, price: 5000, stockCount: 2 }],
]);

test("normalise les lignes dupliquées et limite les quantités", () => {
  assert.deepEqual(normalizeRequestedItems([{ productId: "charger-1", quantity: 2 }, { productId: "charger-1", quantity: 1 }]), [{ productId: "charger-1", quantity: 3 }]);
  assert.throws(() => normalizeRequestedItems([{ productId: "charger-1", quantity: 0 }]), OrderValidationError);
  assert.throws(() => normalizeRequestedItems([{ productId: "charger-1", quantity: 40 }, { productId: "charger-1", quantity: 20 }]), OrderValidationError);
});
test("valide les références idempotentes", () => {
  const id = "b7a5c4d2-1111-4222-8333-123456789abc";
  assert.equal(validateRequestId(id), id);
  assert.throws(() => validateRequestId("order-1"), OrderValidationError);
  const fingerprint = "a".repeat(64);
  assert.equal(isSameIdempotentOrder({ idempotencyKey: id, requestFingerprint: fingerprint, source: "website" }, id, fingerprint), true);
  assert.equal(isSameIdempotentOrder({ idempotencyKey: id, requestFingerprint: "b".repeat(64), source: "website" }, id, fingerprint), false);
  assert.equal(isSameIdempotentOrder({ idempotencyKey: "other", requestFingerprint: fingerprint, source: "website" }, id, fingerprint), false);
});
test("relit les prix et le stock côté serveur pour créer l'instantané", () => {
  const items = buildOrderItems(normalizeRequestedItems([{ productId: "charger-1", quantity: 2 }]), products);
  assert.deepEqual(items, [{ productId: "charger-1", productName: "Chargeur GaN 65W", unitPrice: 24500, quantity: 2 }]);
  assert.equal(calculateSubtotal(items), 49000);
  assert.throws(() => buildOrderItems([{ productId: "cable-1", quantity: 3 }], products), OrderValidationError);
  assert.throws(() => buildOrderItems([{ productId: "unknown", quantity: 1 }], products), OrderValidationError);
  assert.throws(() => buildOrderItems([{ productId: "charger-1", quantity: 1 }], new Map([["charger-1", { name: "Chargeur", isAvailable: false, price: 24500, stockCount: 8 }]])), OrderValidationError);
});
test("déduit le stock agrégé et bloque les stocks insuffisants", () => {
  const items = normalizeStoredOrderItems([
    { productId: "charger-1", productName: "Chargeur GaN 65W", unitPrice: 24500, quantity: 1 },
    { productId: "charger-1", productName: "Chargeur GaN 65W", unitPrice: 24500, quantity: 2 },
  ]);
  assert.deepEqual(computeStockAdjustments(items, new Map([["charger-1", 8]]), "deduct"), [{ productId: "charger-1", quantity: 3, previousStock: 8, newStock: 5 }]);
  assert.throws(() => computeStockAdjustments(items, new Map([["charger-1", 2]]), "deduct"), OrderValidationError);
});
test("restaure le stock après annulation et bloque une seconde transition", () => {
  const items = normalizeStoredOrderItems([{ productId: "cable-1", productName: "Câble USB-C", unitPrice: 5000, quantity: 2 }]);
  assert.deepEqual(computeStockAdjustments(items, new Map([["cable-1", 0]]), "restore"), [{ productId: "cable-1", quantity: 2, previousStock: 0, newStock: 2 }]);
  assert.equal(assertStatusTransition("confirmed", "cancelled"), true);
  assert.equal(assertStatusTransition("cancelled", "cancelled"), false);
  assert.throws(() => assertStatusTransition("cancelled", "confirmed"), OrderValidationError);
});
test("n'enregistre le paiement qu'après livraison", () => {
  assert.throws(() => assertPaymentAllowed("out_for_delivery", "unpaid", 25000), OrderValidationError);
  assert.equal(assertPaymentAllowed("delivered", "unpaid", 25000), true);
  assert.equal(assertPaymentAllowed("delivered", "paid_on_delivery", 25000), false);
  assert.throws(() => assertPaymentAllowed("delivered", "unpaid", null), OrderValidationError);
});


test("refuse une modification de frais basée sur une version de commande périmée", () => {
  const currentUpdatedAt = "2026-11-12T19:00:00.000Z";
  assert.equal(calculateOrderTotalWithDeliveryFee({
    status: "pending_confirmation",
    currentUpdatedAt,
    expectedUpdatedAt: currentUpdatedAt,
    subtotal: 49000,
    deliveryFee: 1500,
  }), 50500);
  assert.throws(() => calculateOrderTotalWithDeliveryFee({
    status: "pending_confirmation",
    currentUpdatedAt,
    expectedUpdatedAt: "2026-11-12T18:59:00.000Z",
    subtotal: 49000,
    deliveryFee: 1500,
  }), OrderValidationError);
  assert.throws(() => calculateOrderTotalWithDeliveryFee({
    status: "confirmed",
    currentUpdatedAt,
    expectedUpdatedAt: currentUpdatedAt,
    subtotal: 49000,
    deliveryFee: 1500,
  }), OrderValidationError);
  assert.throws(() => calculateOrderTotalWithDeliveryFee({
    status: "pending_confirmation",
    currentUpdatedAt,
    expectedUpdatedAt: currentUpdatedAt,
    subtotal: 49000,
    deliveryFee: -1,
  }), OrderValidationError);
});
