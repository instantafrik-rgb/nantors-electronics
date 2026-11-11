/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { config } from '../../config/environment';
import { AdminUser } from '../../types';
import { isFirebaseConfigured } from '../../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AdminUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${config.firebase.projectId}/authentication/settings`;
  const isFirebaseReady = isFirebaseConfigured();

  const handleCopyHostname = async () => {
    try {
      await navigator.clipboard.writeText(currentHostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
      const textArea = document.createElement('textarea');
      textArea.value = currentHostname;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setIsUnauthorizedDomain(false);

    try {
      const user = await authService.signInWithGoogle();

      if (
        !user.isAdmin ||
        user.email.toLowerCase().trim() !==
          config.shop.adminAuthorizedEmail.toLowerCase().trim()
      ) {
        setError(
          `Accès refusé : Le compte (${user.email}) n'est pas autorisé. Seul ${config.shop.adminAuthorizedEmail} est habilité.`
        );
        return;
      }

      onSuccess(user);
      onClose();
    } catch (err: any) {
      const isDomainError =
        err?.code === 'auth/unauthorized-domain' ||
        err?.isUnauthorizedDomain ||
        (err?.message && err.message.includes('auth/unauthorized-domain'));

      if (isDomainError) {
        setIsUnauthorizedDomain(true);
        setError(
          `Le domaine actuel (${currentHostname}) n'est pas autorisé dans Firebase Authentication.`
        );
      } else {
        setError(err?.message || 'Erreur lors de la connexion Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 text-[#F3F0E9]">
      <div
        className="relative w-full max-w-lg bg-[#141414] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#777777] hover:text-[#F3F0E9] p-2 transition-colors cursor-pointer rounded-full hover:bg-white/5"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center mx-auto text-[#FF6B00]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-[#F3F0E9] tracking-tight">
            Espace Administrateur Nantor's
          </h2>
          <p className="text-xs text-[#888888] max-w-sm mx-auto leading-relaxed font-light">
            Accès sécurisé réservé exclusivement au compte propriétaire{' '}
            <span className="font-mono text-[#FF6B00] font-medium">
              {config.shop.adminAuthorizedEmail}
            </span>.
          </p>
        </div>

        {isUnauthorizedDomain && (
          <div className="mb-6 p-4 rounded-2xl bg-[#1c1414] border border-amber-500/30 text-[#F3F0E9] space-y-3">
            <div className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Domaine Firebase non autorisé
                </h3>
                <p className="text-[11px] text-[#cccccc] leading-relaxed">
                  Firebase Authentication bloque les popups OAuth Google provenant d'un
                  domaine qui n'a pas encore été ajouté aux domaines autorisés du projet.
                </p>
              </div>
            </div>

            <div className="bg-[#111111] p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-[#FF6B00] truncate select-all">
                {currentHostname}
              </span>
              <button
                type="button"
                onClick={handleCopyHostname}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-[#F3F0E9] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copier le domaine</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[10px] text-[#888888] space-y-1 pt-1 border-t border-white/5">
              <p>
                1. Pour autoriser définitivement ce domaine, accédez à la console Firebase :
              </p>
              <a
                href={firebaseSettingsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#FF6B00] hover:underline font-medium"
              >
                <span>
                  Console Firebase &gt; Authentication &gt; Paramètres &gt; Domaines autorisés
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {error && !isUnauthorizedDomain && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#1c1c1c] border border-white/10 space-y-1.5">
            <span className="text-[11px] font-semibold text-[#FF6B00] uppercase tracking-wider block">
              Compte administrateur habilité
            </span>
            <div className="font-mono text-xs font-bold text-[#F3F0E9] select-all">
              {config.shop.adminAuthorizedEmail}
            </div>
            <span className="text-[10px] text-[#777777] block font-light">
              {isFirebaseReady
                ? 'Connexion contrôlée par Firebase Authentication. Seul le compte propriétaire vérifié est accepté.'
                : "Connexion indisponible : Firebase Authentication n'est pas configuré."}
            </span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading || !isFirebaseReady}
            className="w-full py-3.5 px-4 bg-[#FF6B00] hover:bg-[#e05f00] text-[#111111] font-bold text-xs rounded-xl shadow-[0_2px_15px_rgba(255,107,0,0.3)] transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#111111"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#111111"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#111111"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#111111"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continuer avec Google</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#777777]">
          <span className="flex items-center gap-1.5 text-[#FF6B00] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Vérification stricte de l'identité
          </span>
          <span className="font-mono text-[#555555]">v1.3</span>
        </div>
      </div>
    </div>
  );
};
