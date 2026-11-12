/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppConfig {
  firebase: {
    apiKey: string; authDomain: string; projectId: string; storageBucket: string;
    messagingSenderId: string; appId: string; appCheckSiteKey: string; isConfigured: boolean;
  };
  cloudinary: { cloudName: string; uploadPreset: string; assetFolder: string; uploadUrl: string; };
  shop: {
    name: string; tagline: string; logoUrl: string; currency: string; paymentMethod: "cash_on_delivery";
    whatsappNumber: string; phoneFormatted: string; email: string; location: string;
    showroomAddress: string; workingHours: string; guaranteeMonths: number;
    adminAuthorizedEmail: string; stockAlertThreshold: number; theme: "light" | "dark";
  };
}

const env = import.meta.env;
const firebaseApiKey = env.VITE_FIREBASE_API_KEY || "";
const firebaseProjectId = env.VITE_FIREBASE_PROJECT_ID || "";
const firebaseAuthDomain = env.VITE_FIREBASE_AUTH_DOMAIN || "";
const firebaseStorageBucket = env.VITE_FIREBASE_STORAGE_BUCKET || "";
const firebaseMessagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || "";
const firebaseAppId = env.VITE_FIREBASE_APP_ID || "";
const firebaseAppCheckSiteKey = env.VITE_FIREBASE_APPCHECK_SITE_KEY || "";

const rawWhatsApp = env.VITE_WHATSAPP_NUMBER || "";
const isPlaceholderNumber = (num: string): boolean => {
  if (!num) return true;
  if (/remplacez|votre|numero|placeholder|xxx/i.test(num)) return true;
  const digits = num.replace(/[^\d]/g, "");
  return digits === "22890000000" || digits === "22800000000" || digits.length < 8;
};
const validatedWhatsApp = isPlaceholderNumber(rawWhatsApp) ? "" : rawWhatsApp.replace(/[^\d]/g, "");

export const config: AppConfig = {
  firebase: {
    apiKey: firebaseApiKey, authDomain: firebaseAuthDomain, projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket, messagingSenderId: firebaseMessagingSenderId, appId: firebaseAppId,
    appCheckSiteKey: firebaseAppCheckSiteKey,
    isConfigured: Boolean(firebaseApiKey && firebaseAuthDomain && firebaseProjectId && firebaseStorageBucket && firebaseMessagingSenderId && firebaseAppId),
  },
  cloudinary: {
    cloudName: env.VITE_CLOUDINARY_CLOUD_NAME || "pgjikefb",
    uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET || "nantors_products",
    assetFolder: env.VITE_CLOUDINARY_ASSET_FOLDER || "nantors-electronics/products",
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME || "pgjikefb"}/image/upload`,
  },
  shop: {
    name: "Nantor's Electronics",
    tagline: "L'Excellence Technologique au Quotidien",
    logoUrl: "/favicon.svg",
    currency: "FCFA",
    paymentMethod: "cash_on_delivery",
    whatsappNumber: validatedWhatsApp,
    phoneFormatted: validatedWhatsApp ? `+${validatedWhatsApp}` : "+228 (À configurer)",
    email: "nantorelectronics@gmail.com",
    location: "Lomé, Togo",
    showroomAddress: "Avedji Léo 2000 Lomé",
    workingHours: "Lun - Sam : 08h30 - 19h00",
    guaranteeMonths: 12,
    adminAuthorizedEmail: "instantafrik@gmail.com",
    stockAlertThreshold: 3,
    theme: "light",
  },
};
