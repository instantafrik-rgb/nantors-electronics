export interface CatalogCategoryInput {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export type CategoryErrorCode = "invalid-argument" | "already-exists" | "failed-precondition";

export class CategoryValidationError extends Error {
  constructor(public readonly code: CategoryErrorCode, message: string) {
    super(message);
    this.name = "CategoryValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateCatalogCategory(value: unknown): CatalogCategoryInput {
  if (!isRecord(value)) {
    throw new CategoryValidationError("invalid-argument", "Les données de la catégorie sont invalides.");
  }

  const allowed = new Set(["name", "slug", "description", "icon"]);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new CategoryValidationError("invalid-argument", "La catégorie contient un champ non autorisé.");
  }

  const name = typeof value.name === "string" ? value.name.trim() : "";
  const slug = typeof value.slug === "string" ? value.slug.trim() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";
  const icon = typeof value.icon === "string" ? value.icon.trim() : "";

  if (name.length < 2 || name.length > 100) {
    throw new CategoryValidationError("invalid-argument", "Le nom de la catégorie doit contenir entre 2 et 100 caractères.");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
    throw new CategoryValidationError("invalid-argument", "L'identifiant de catégorie doit être en minuscules, sans espace ni accent.");
  }
  if (description.length > 400 || icon.length < 1 || icon.length > 50) {
    throw new CategoryValidationError("invalid-argument", "La description ou l'icône de la catégorie est invalide.");
  }

  return { name, slug, description, icon };
}

export function assertCategorySlugChangeAllowed(
  currentSlug: string,
  nextSlug: string,
  hasAssignedProducts: boolean,
): void {
  if (currentSlug !== nextSlug && hasAssignedProducts) {
    throw new CategoryValidationError(
      "failed-precondition",
      "Cette catégorie contient encore des produits. Réaffectez-les avant de modifier son identifiant.",
    );
  }
}

export function assertCategoryCanBeDeleted(hasAssignedProducts: boolean): void {
  if (hasAssignedProducts) {
    throw new CategoryValidationError(
      "failed-precondition",
      "Cette catégorie contient encore des produits. Réaffectez-les avant de la supprimer.",
    );
  }
}

export function assertCategorySlugIsUnique(duplicateExists: boolean): void {
  if (duplicateExists) {
    throw new CategoryValidationError("already-exists", "Cet identifiant de catégorie est déjà utilisé.");
  }
}
