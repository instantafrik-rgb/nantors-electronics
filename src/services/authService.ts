/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getFirebaseAuth,
  getGoogleProvider,
  isFirebaseConfigured,
} from "./firebase";
import { config } from "../config/environment";
import { AdminUser } from "../types";

const ADMIN_STORAGE_KEY = "nantors_electronics_auth_user";

type AuthListener = (user: AdminUser | null) => void;

class AuthService {
  private currentUser: AdminUser | null = null;
  private listeners: AuthListener[] = [];
  private firebaseUnsubscribe: (() => void) | null = null;
  private initPromise: Promise<void> | null = null;
  private firebaseAuthInstance: any = null; // ← pour accès sync

  constructor() {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  public async initSessionCheck(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (!isFirebaseConfigured()) return;

      const auth = await getFirebaseAuth();
      if (!auth) return;

      this.firebaseAuthInstance = auth; // ← stocker pour accès sync

      const { onAuthStateChanged } = await import("firebase/auth");

      if (auth.currentUser) {
        await this.handleFirebaseUser(auth.currentUser);
      }

      this.firebaseUnsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        await this.handleFirebaseUser(fbUser);
      });
    })();

    return this.initPromise;
  }

  private async handleFirebaseUser(fbUser: any): Promise<void> {
    if (!fbUser) {
      this.setCurrentUser(null);
      return;
    }

    const email = (fbUser.email || "").toLowerCase().trim();
    const expectedAdmin = config.shop.adminAuthorizedEmail.toLowerCase().trim();
    const isAuthorizedEmail = email === expectedAdmin;
    const isEmailVerified = fbUser.emailVerified === true;

    if (isAuthorizedEmail && isEmailVerified) {
      this.setCurrentUser({
        uid: fbUser.uid,
        email: fbUser.email || "",
        displayName: fbUser.displayName || "Nantor's Administrateur",
        photoURL: fbUser.photoURL || undefined,
        isAdmin: true,
      });
      return;
    }

    console.warn(
      `Tentative de connexion non autorisée (${email}). Déconnexion immédiate.`,
    );
    try {
      const auth = await getFirebaseAuth();
      if (auth) {
        const { signOut } = await import("firebase/auth");
        await signOut(auth);
      }
    } catch (err) {
      console.error("Erreur lors du signOut forcé:", err);
    }
    this.setCurrentUser(null);
  }

  public getCurrentUser(): AdminUser | null {
    return this.currentUser;
  }

  /**
   * Version synchrone. Retourne false tant que initSessionCheck() n'est pas appelée
   * (comportement safe : l'admin reste déconnecté jusqu'à init explicite).
   */
  public isCurrentFirebaseUserSuperAdmin(): boolean {
    if (!isFirebaseConfigured()) return false;
    const auth = this.firebaseAuthInstance;
    if (!auth) return false;
    const fbUser = auth.currentUser;
    if (!fbUser || fbUser.emailVerified !== true) return false;
    const email = (fbUser.email || "").toLowerCase().trim();
    const expected = config.shop.adminAuthorizedEmail.toLowerCase().trim();
    return email === expected;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private setCurrentUser(user: AdminUser | null): void {
    this.currentUser = user;
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch {
      // ignore
    }
    this.listeners.forEach((listener) => listener(user));
  }

  public async signInWithGoogle(): Promise<AdminUser> {
    if (!isFirebaseConfigured()) {
      throw new Error(
        "Connexion impossible : Firebase Authentication n'est pas configuré.",
      );
    }

    await this.initSessionCheck();

    const auth = await getFirebaseAuth();
    const provider = await getGoogleProvider();
    if (!auth || !provider) {
      throw new Error("Le module Firebase Auth n'a pas pu être initialisé.");
    }

    const { signInWithPopup, signOut } = await import("firebase/auth");

    try {
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;
      const email = (fbUser.email || "").toLowerCase().trim();
      const expected = config.shop.adminAuthorizedEmail.toLowerCase().trim();

      if (email !== expected) {
        await signOut(auth);
        this.setCurrentUser(null);
        throw new Error(
          `Accès refusé : Le compte Google (${fbUser.email || "inconnu"}) n'est pas autorisé.`,
        );
      }

      if (fbUser.emailVerified !== true) {
        await signOut(auth);
        this.setCurrentUser(null);
        throw new Error(
          `Accès refusé : L'adresse email Google (${fbUser.email || "inconnue"}) doit être vérifiée.`,
        );
      }

      const adminUser: AdminUser = {
        uid: fbUser.uid,
        email: fbUser.email || "",
        displayName: fbUser.displayName || "Administrateur Nantor's",
        photoURL: fbUser.photoURL || undefined,
        isAdmin: true,
      };

      this.setCurrentUser(adminUser);
      return adminUser;
    } catch (err: any) {
      this.setCurrentUser(null);
      console.error("Erreur Firebase Auth Google:", err);

      if (
        err?.code === "auth/unauthorized-domain" ||
        (err?.message && err.message.includes("auth/unauthorized-domain"))
      ) {
        err.isUnauthorizedDomain = true;
        err.unauthorizedDomain =
          typeof window !== "undefined" ? window.location.hostname : "";
      }

      throw err;
    }
  }

  public async signOut(): Promise<void> {
    if (isFirebaseConfigured()) {
      const auth = await getFirebaseAuth();
      if (auth) {
        try {
          const { signOut } = await import("firebase/auth");
          await signOut(auth);
        } catch (err) {
          console.warn("Erreur déconnexion Firebase:", err);
        }
      }
    }
    this.setCurrentUser(null);
  }
}

export const authService = new AuthService();
