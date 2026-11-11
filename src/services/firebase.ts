/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from "../config/environment";

// Types importés sans être exécutés (tree-shakés)
import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import type { Auth, GoogleAuthProvider } from "firebase/auth";

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

export function isFirebaseConfigured(): boolean {
  return config.firebase.isConfigured;
}

/**
 * Initialise Firebase App (lazy, dynamique).
 * N'exécute le chargement du SDK firebase/app que si appelé.
 */
export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (!config.firebase.isConfigured) return null;
  if (firebaseApp) return firebaseApp;

  try {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = getApp();
    } else {
      firebaseApp = initializeApp({
        apiKey: config.firebase.apiKey,
        authDomain: config.firebase.authDomain,
        projectId: config.firebase.projectId,
        storageBucket: config.firebase.storageBucket,
        messagingSenderId: config.firebase.messagingSenderId,
        appId: config.firebase.appId,
      });
    }
    return firebaseApp;
  } catch (err) {
    console.warn("Firebase initialization skipped or failed:", err);
    return null;
  }
}

/**
 * Initialise Firestore (lazy).
 */
export async function getDb(): Promise<Firestore | null> {
  if (firestoreDb) return firestoreDb;

  const app = await getFirebaseApp();
  if (!app) return null;

  try {
    const { getFirestore } = await import("firebase/firestore");
    firestoreDb = getFirestore(app);
    return firestoreDb;
  } catch (err) {
    console.warn("Firestore initialization failed:", err);
    return null;
  }
}

/**
 * Initialise Firebase Auth (lazy).
 */
export async function getFirebaseAuth(): Promise<Auth | null> {
  if (firebaseAuth) return firebaseAuth;

  const app = await getFirebaseApp();
  if (!app) return null;

  try {
    const { getAuth } = await import("firebase/auth");
    firebaseAuth = getAuth(app);
    return firebaseAuth;
  } catch (err) {
    console.warn("Firebase Auth initialization failed:", err);
    return null;
  }
}

/**
 * Retourne un GoogleAuthProvider (lazy).
 */
export async function getGoogleProvider(): Promise<GoogleAuthProvider | null> {
  if (googleProviderInstance) return googleProviderInstance;

  try {
    const { GoogleAuthProvider } = await import("firebase/auth");
    googleProviderInstance = new GoogleAuthProvider();
    return googleProviderInstance;
  } catch (err) {
    console.warn("GoogleAuthProvider initialization failed:", err);
    return null;
  }
}
