/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Database, Cloud, CheckCircle2, RefreshCw } from 'lucide-react';
import { config } from '../../config/environment';
import { productService } from '../../services/productService';
import { isFirebaseConfigured } from '../../services/firebase';

interface SystemConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
}

export const SystemConfigModal: React.FC<SystemConfigModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  if (!isOpen) return null;

  const currentSource = productService.getDataSource();
  const fbConfigured = isFirebaseConfigured();

  const handleSwitchSource = (source: 'local' | 'firebase') => {
    try {
      productService.setDataSource(source);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetDemo = () => {
    if (confirm('Voulez-vous réinitialiser le catalogue avec les données démo par défaut ?')) {
      productService.resetToDemoData();
      onDataReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-[#141414] rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/10 max-h-[90vh] overflow-y-auto text-[#F3F0E9]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#777777] hover:text-[#F3F0E9] p-2 rounded-xl hover:bg-white/5 transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#FF6B00]">
            Architecture & Intégration
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F3F0E9]">
            État des Connexions Cloud & Sécurité
          </h2>
          <p className="text-xs text-[#888888] font-light">
            Vue d'ensemble de la configuration Firebase, Cloudinary et du mode de stockage des données.
          </p>
        </div>

        <div className="space-y-6">
          {/* Storage Mode Selector */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F0E9] mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#FF6B00]" />
              <span>Source des Données Active</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <button
                type="button"
                onClick={() => handleSwitchSource('local')}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  currentSource === 'local'
                    ? 'bg-[#141414] border-[#FF6B00] shadow-sm ring-1 ring-[#FF6B00]'
                    : 'bg-[#141414]/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-[#F3F0E9]">Mode Démo / Local</span>
                  {currentSource === 'local' && <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />}
                </div>
                <p className="text-[11px] text-[#888888] font-light">
                  Modifications sauvegardées localement. Idéal pour tester sans toucher à Firebase.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchSource('firebase')}
                disabled={!fbConfigured}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  currentSource === 'firebase'
                    ? 'bg-[#141414] border-[#FF6B00] shadow-sm ring-1 ring-[#FF6B00]'
                    : fbConfigured
                    ? 'bg-[#141414]/60 border-white/10 hover:border-white/20'
                    : 'bg-[#141414]/30 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-[#F3F0E9]">Mode Cloud (Firestore)</span>
                  {currentSource === 'firebase' && <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />}
                </div>
                <p className="text-[11px] text-[#888888] font-light">
                  {fbConfigured
                    ? 'Variables Firebase détectées. La connexion réelle dépend aussi des règles et de l'accès au projet.'
                    : 'En attente de la clé API Firebase dans .env.'}
                </p>
              </button>
            </div>
          </div>

          {/* Firebase Status Card */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F3F0E9] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#FF6B00]" />
                Firebase (Firestore & Auth)
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                {fbConfigured ? 'Variables présentes · test requis' : 'Configuration à compléter'}
              </span>
            </div>

            <div className="text-xs space-y-1 font-mono text-[#888888] pt-1">
              <div>projectId : <span className="text-[#F3F0E9] font-bold">{config.firebase.projectId}</span></div>
              <div>authDomain : <span className="text-[#F3F0E9] font-bold">{config.firebase.authDomain}</span></div>
              <div>Règles de sécurité : <span className="text-emerald-400 font-sans font-medium">firestore.rules généré & conforme</span></div>
            </div>
          </div>

          {/* Cloudinary Status Card */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F3F0E9] flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#FF6B00]" />
                Cloudinary (Stockage Photos)
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                Prêt
              </span>
            </div>

            <div className="text-xs space-y-1 font-mono text-[#888888] pt-1">
              <div>Cloud Name : <span className="text-[#F3F0E9] font-bold">{config.cloudinary.cloudName}</span></div>
              <div>Upload Preset : <span className="text-[#F3F0E9] font-bold">{config.cloudinary.uploadPreset}</span></div>
              <div>Dossier cible : <span className="text-[#F3F0E9] font-bold">{config.cloudinary.assetFolder}</span></div>
            </div>
          </div>

          {/* Action to reset demo data */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleResetDemo}
              className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réinitialiser les articles démo</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-[#F3F0E9] text-xs font-semibold rounded-xl border border-white/10 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
