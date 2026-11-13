import assert from "node:assert/strict";
import test from "node:test";
import {
  assertCategoryCanBeDeleted,
  assertCategorySlugChangeAllowed,
  assertCategorySlugIsUnique,
  CategoryValidationError,
  validateCatalogCategory,
} from "./categoryLogic.js";

const validCategory = {
  name: "Audio & Écouteurs",
  slug: "audio-ecouteurs",
  description: "Casques, écouteurs et enceintes.",
  icon: "Headphones",
};

test("valide et normalise une catégorie", () => {
  assert.deepEqual(validateCatalogCategory({ ...validCategory, name: "  Audio & Écouteurs  " }), validCategory);
});

test("refuse les slugs invalides et les champs inattendus", () => {
  assert.throws(() => validateCatalogCategory({ ...validCategory, slug: "Audio & écouteurs" }), CategoryValidationError);
  assert.throws(() => validateCatalogCategory({ ...validCategory, admin: true }), CategoryValidationError);
  assert.throws(() => validateCatalogCategory({ ...validCategory, name: "A" }), CategoryValidationError);
});

test("bloque le changement de slug tant que des produits y sont affectés", () => {
  assert.equal(assertCategorySlugChangeAllowed("audio-ecouteurs", "audio", false), undefined);
  assert.throws(() => assertCategorySlugChangeAllowed("audio-ecouteurs", "audio", true), CategoryValidationError);
});

test("bloque la suppression d'une catégorie encore utilisée", () => {
  assert.equal(assertCategoryCanBeDeleted(false), undefined);
  assert.throws(() => assertCategoryCanBeDeleted(true), CategoryValidationError);
});

test("bloque les slugs en doublon", () => {
  assert.equal(assertCategorySlugIsUnique(false), undefined);
  assert.throws(() => assertCategorySlugIsUnique(true), CategoryValidationError);
});
