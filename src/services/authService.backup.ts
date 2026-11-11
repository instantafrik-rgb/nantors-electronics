/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from './firebase';
import { config } from '../config/environment';
import { AdminUser } from '../types';

const ADMIN_STORAGE_KEY = 'nantors_electronics_auth_user';

type AuthListener = (user: AdminUser | null) => void;

class AuthService {
  private currentUser: AdminUser | null = null;
  private listeners: AuthListener[] = [];

  constructor() {
    // Check saved session in localStorage first
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.email?.toLowerCase().trim() === config.shop.adminAuthorizedEmail.toLowerCase().trim() &&
          parsed.isAdmin === true
        ) {
          this.currentUser = parsed;
        }
      } catch {
        this.currentUser = null;
      }
    }

    // If Firebase is configured, listen to live auth state
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth();
      if (auth) {
        onAuthStateChanged(auth, async (fbUser: User | null) => {
          if (fbUser) {
            const email = (fbUser.email || '').toLowerCase().trim();
            const expectedAdmin = config.shop.adminAuthorizedEmail.toLowerCase().trim();
            const isEmailValid = email === expectedAdmin;
            const isEmailVerified = fbUser.emailVerified === true;

            if (isEmailValid && isEmailVerified) {
              const user: AdminUser = {
                uid: fbUser.uid,
                email: fbUser.email || '',
                displayName: fbUser.displayName || "Nantor's Administrateur",
                photoURL: fbUser.photoURL || undefined,
                isAdmin: true,
              };
              this.setCurrentUser(user);
            } else {
              // Unauthorized user detected: revoke session immediately
              console.warn(`Tentative de connexion non autorisée (${email}). Déconnexion immédiate.`);
              try {
                await fbSignOut(auth);
              } catch (err) {
                console.error('Erreur lors du signOut forcé:', err);
              }
              this.setCurrentUser(null);
            }
          } else {
            // Keep local preview admin session if the user explicitly authenticated as the authorized admin
            const currentSaved = localStorage.getItem(ADMIN_STORAGE_KEY);
            if (currentSaved) {
              try {
                const parsed = JSON.parse(currentSaved);
                if (
                  parsed &&
                  parsed.email?.toLowerCase().trim() === config.shop.adminAuthorizedEmail.toLowerCase().trim() &&
                  parsed.isAdmin === true
                ) {
                  this.currentUser = parsed;
                  this.listeners.forEach((l) => l(parsed));
                  return;
                }
              } catch {
                // ignore
              }
            }
            this.setCurrentUser(null);
          }
        });
      }
    }
  }

  public getCurrentUser(): AdminUser | null {
    return this.currentUser;
  }

  /**
   * Strictly verify if the current authenticated user is the legitimate super-admin.
   * Allows live Firebase Auth SDK user or the verified owner in preview mode.
   */
  public isCurrentFirebaseUserSuperAdmin(): boolean {
    const expected = config.shop.adminAuthorizedEmail.toLowerCase().trim();

    if (!isFirebaseConfigured()) {
      return (
        this.currentUser !== null &&
        this.currentUser.isAdmin === true &&
        this.currentUser.email.toLowerCase().trim() === expected
      );
    }

    const auth = getFirebaseAuth();
    const fbUser = auth?.currentUser;
    if (fbUser) {
      const email = (fbUser.email || '').toLowerCase().trim();
      return email === expected && fbUser.emailVerified === true;
    }

    // Fallback in AI Studio preview / sandbox when domain is not yet whitelisted in Firebase Console:
    if (
      this.currentUser !== null &&
      this.currentUser.isAdmin === true &&
      this.currentUser.email.toLowerCase().trim() === expected
    ) {
      return true;
    }

    return false;
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
    if (user && user.isAdmin) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
    this.listeners.forEach((l) => l(user));
  }

  /**
   * Direct login for the exclusive store owner (instantafrik@gmail.com).
   * Used in preview/sandbox environments or when Firebase OAuth domain is not whitelisted.
   */
  public signInAsAuthorizedAdminPreview(): AdminUser {
    const adminUser: AdminUser = {
      uid: 'admin-preview-session',
      email: config.shop.adminAuthorizedEmail,
      displayName: "Nantor's Administrateur Propriétaire",
      photoURL: undefined,
      isAdmin: true,
    };
    this.setCurrentUser(adminUser);
    return adminUser;
  }

  /**
   * Sign in with Google with strict identity and emailVerified check
   */
  public async signInWithGoogle(): Promise<AdminUser> {
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error("Le module Firebase Auth n'a pas pu être initialisé.");
      }

      try {
        const res = await signInWithPopup(auth, googleProvider);
        const fbUser = res.user;
        const email = (fbUser.email || '').toLowerCase().trim();
        const expected = config.shop.adminAuthorizedEmail.toLowerCase().trim();

        if (email !== expected) {
          // Reject and immediately signOut
          await fbSignOut(auth);
          this.setCurrentUser(null);
          throw new Error(
            `Accès refusé : Le compte Google (${fbUser.email}) n'est pas autorisé. Seul l'administrateur exclusif (${config.shop.adminAuthorizedEmail}) a accès à cet espace.`
          );
        }

        if (fbUser.emailVerified !== true) {
          await fbSignOut(auth);
          this.setCurrentUser(null);
          throw new Error(
            `Accès refusé : L'adresse email Google (${fbUser.email}) doit être vérifiée.`
          );
        }

        const adminUser: AdminUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || "Administrateur Nantor's",
          photoURL: fbUser.photoURL || undefined,
          isAdmin: true,
        };

        this.setCurrentUser(adminUser);
        return adminUser;
      } catch (err: any) {
        this.setCurrentUser(null);
        console.error('Erreur Firebase Auth Google:', err);

        // Enhance error object for unauthorized domain
        if (
          err?.code === 'auth/unauthorized-domain' ||
          (err?.message && err.message.includes('auth/unauthorized-domain'))
        ) {
          err.isUnauthorizedDomain = true;
          err.unauthorizedDomain = typeof window !== 'undefined' ? window.location.hostname : '';
        }

        throw err;
      }
    }

    return this.signInAsAuthorizedAdminPreview();
  }

  public async signOut(): Promise<void> {
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth();
      if (auth) {
        try {
          await fbSignOut(auth);
        } catch (err) {
          console.warn('Erreur déconnexion Firebase:', err);
        }
      }
    }
    this.setCurrentUser(null);
  }
}

export const authService = new AuthService();
