import { config } from "../config/environment";
import { getDb } from "./firebase";

export interface ShopSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string;
  phoneFormatted: string;
  email: string;
  location: string;
  showroomAddress: string;
  workingHours: string;
  currency: "XOF";
  paymentMethod: "cash_on_delivery";
  stockAlertThreshold: number;
  theme: "light" | "dark";
}

export function getDefaultShopSettings(): ShopSettings {
  return {
    name: config.shop.name,
    tagline: config.shop.tagline,
    logoUrl: config.shop.logoUrl,
    whatsappNumber: config.shop.whatsappNumber,
    phoneFormatted: config.shop.phoneFormatted,
    email: config.shop.email,
    location: config.shop.location,
    showroomAddress: config.shop.showroomAddress,
    workingHours: config.shop.workingHours,
    currency: "XOF",
    paymentMethod: "cash_on_delivery",
    stockAlertThreshold: config.shop.stockAlertThreshold,
    theme: config.shop.theme,
  };
}

const safeText = (value: unknown, fallback: string, max: number): string =>
  typeof value === "string" && value.length <= max ? value : fallback;

export async function getShopSettings(): Promise<ShopSettings> {
  const defaults = getDefaultShopSettings();
  const db = await getDb();
  if (!db) return defaults;

  const { doc, getDoc } = await import("firebase/firestore");
  const snapshot = await getDoc(doc(db, "settings", "shop"));
  if (!snapshot.exists()) return defaults;
  const data = snapshot.data();
  const rawNumber = safeText(data.whatsappNumber, defaults.whatsappNumber, 30);
  const digits = rawNumber.replace(/[^\d]/g, "");
  const whatsappNumber = digits.length >= 8 && digits.length <= 15 ? digits : "";

  return {
    name: safeText(data.name, defaults.name, 100),
    tagline: safeText(data.tagline, defaults.tagline, 200),
    logoUrl: safeText(data.logoUrl, defaults.logoUrl, 1500),
    whatsappNumber,
    phoneFormatted: safeText(data.phoneFormatted, whatsappNumber ? `+${whatsappNumber}` : defaults.phoneFormatted, 40),
    email: safeText(data.email, defaults.email, 150),
    location: safeText(data.location, defaults.location, 150),
    showroomAddress: safeText(data.showroomAddress, defaults.showroomAddress, 250),
    workingHours: safeText(data.workingHours, defaults.workingHours, 150),
    currency: "XOF",
    paymentMethod: "cash_on_delivery",
    stockAlertThreshold: Number.isSafeInteger(data.stockAlertThreshold) && data.stockAlertThreshold >= 0 && data.stockAlertThreshold <= 100000
      ? data.stockAlertThreshold : defaults.stockAlertThreshold,
    theme: data.theme === "dark" ? "dark" : "light",
  };
}

export function applyShopSettings(settings: ShopSettings): void {
  Object.assign(config.shop, {
    name: settings.name,
    tagline: settings.tagline,
    logoUrl: settings.logoUrl,
    whatsappNumber: settings.whatsappNumber,
    phoneFormatted: settings.phoneFormatted,
    email: settings.email,
    location: settings.location,
    showroomAddress: settings.showroomAddress,
    workingHours: settings.workingHours,
    currency: "FCFA",
    paymentMethod: "cash_on_delivery",
    stockAlertThreshold: settings.stockAlertThreshold,
    theme: settings.theme,
  });
  if (typeof document !== "undefined") document.documentElement.dataset.theme = settings.theme;
}

export async function saveShopSettings(settings: ShopSettings): Promise<void> {
  if (settings.name.trim().length < 2 || settings.name.length > 100) throw new Error("Le nom de la boutique est obligatoire.");
  if (settings.tagline.length > 200 || settings.logoUrl.length > 1500 || settings.email.length > 150 ||
      settings.location.length > 150 || settings.showroomAddress.length > 250 || settings.workingHours.length > 150) {
    throw new Error("Un des champs dépasse la longueur autorisée.");
  }
  if (settings.whatsappNumber && !/^\d{8,15}$/.test(settings.whatsappNumber.replace(/[^\d]/g, ""))) {
    throw new Error("Le numéro WhatsApp doit contenir entre 8 et 15 chiffres avec l'indicatif pays.");
  }
  if (!Number.isSafeInteger(settings.stockAlertThreshold) || settings.stockAlertThreshold < 0 || settings.stockAlertThreshold > 100000) {
    throw new Error("Le seuil global de stock doit être un entier positif ou nul.");
  }
  if (settings.theme !== "light" && settings.theme !== "dark") throw new Error("Thème invalide.");
  if (settings.logoUrl && !/^https:\/\//i.test(settings.logoUrl) && !settings.logoUrl.startsWith("/")) {
    throw new Error("Le logo doit être une URL HTTPS ou un chemin local.");
  }

  const db = await getDb();
  if (!db) throw new Error("Firebase/Firestore n'est pas configuré. Les paramètres ne peuvent pas être enregistrés localement.");
  const { doc, setDoc } = await import("firebase/firestore");
  await setDoc(doc(db, "settings", "shop"), {
    ...settings,
    whatsappNumber: settings.whatsappNumber.replace(/[^\d]/g, ""),
    currency: "XOF",
    paymentMethod: "cash_on_delivery",
    updatedAt: new Date().toISOString(),
  });
}
