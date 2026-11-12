/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CloudinaryService } from '../../services/cloudinaryService';

interface CloudinaryUploaderProps {
  onImageUploaded: (url: string) => void;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({ onImageUploaded }) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [directUrl, setDirectUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const info = CloudinaryService.getInfo();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const url = await CloudinaryService.uploadImage(file);
      onImageUploaded(url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      console.warn('Cloudinary upload error:', err);
      setUploadError(err instanceof Error
        ? err.message
        : "Le téléversement Cloudinary a échoué. Aucune image locale n'a été enregistrée.");
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleAddDirectUrl = () => {
    const candidate = directUrl.trim();
    if (!candidate) return;
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol !== 'https:') {
        throw new Error("L'image doit être hébergée sur une adresse HTTPS sécurisée.");
      }
      onImageUploaded(parsed.toString());
      setDirectUrl('');
      setUploadError(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "URL d'image invalide.");
    }
  };

  return (
    <div className="bg-[#181818] rounded-2xl p-4 border border-white/10 text-[#F3F0E9]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#F3F0E9]">
          Ajouter des photos au produit
        </span>
        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              tab === 'upload' ? 'bg-[#FF6B00] text-[#111111] shadow-sm' : 'text-[#888888] hover:text-[#F3F0E9]'
            }`}
          >
            Fichier Cloudinary
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              tab === 'url' ? 'bg-[#FF6B00] text-[#111111] shadow-sm' : 'text-[#888888] hover:text-[#F3F0E9]'
            }`}
          >
            Lien URL
          </button>
        </div>
      </div>

      {tab === 'upload' ? (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp, image/jpg, image/avif"
            className="hidden"
            id="cloudinary-file-input"
            disabled={uploading}
          />
          <label
            htmlFor="cloudinary-file-input"
            className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              uploading
                ? 'bg-[#141414] border-white/10 pointer-events-none'
                : 'bg-[#141414] border-white/15 hover:border-[#FF6B00]/50 hover:bg-[#1a1a1a]'
            }`}
          >
            {uploading ? (
              <div className="flex items-center gap-2 text-xs text-[#888888] font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-[#FF6B00]" />
                <span>Téléversement vers Cloudinary ({info.cloudName})...</span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-[#FF6B00] mb-1.5" />
                <span className="text-xs font-semibold text-[#F3F0E9]">
                  Sélectionner une photo depuis votre appareil
                </span>
                <span className="text-[11px] text-[#777777] mt-0.5">
                  Preset : <code className="font-mono text-[#FF6B00]">{info.uploadPreset}</code> · JPG, PNG, WEBP (&lt;8Mo)
                </span>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666666]" />
            <input
              type="url"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/... ou URL d'image"
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#141414] text-[#F3F0E9] rounded-xl border border-white/10 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder:text-[#555555]"
            />
          </div>
          <button
            type="button"
            onClick={handleAddDirectUrl}
            disabled={!directUrl.trim()}
            className="px-3.5 py-2 bg-[#FF6B00] text-[#111111] hover:bg-[#e05f00] text-xs font-bold rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
          >
            Ajouter
          </button>
        </div>
      )}

      {/* Status messages */}
      {uploadSuccess && (
        <div className="mt-2.5 text-xs text-[#FF6B00] flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Photo ajoutée à la galerie !</span>
        </div>
      )}

      {uploadError && (
        <div className="mt-2.5 text-[11px] text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
