/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from '../config/environment';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export class CloudinaryService {
  private static cloudName = config.cloudinary.cloudName;
  private static uploadPreset = config.cloudinary.uploadPreset;
  private static assetFolder = config.cloudinary.assetFolder;
  private static uploadUrl = config.cloudinary.uploadUrl;

  /**
   * Validate image file before uploading
   */
  public static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Format d\'image non supporté. Veuillez choisir un fichier JPG, PNG ou WEBP.',
      };
    }

    const maxSizeBytes = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: 'Taille du fichier trop volumineuse (maximum 8 Mo).',
      };
    }

    return { valid: true };
  }

  /**
   * Upload an image to Cloudinary using an unsigned upload preset
   */
  public static async uploadImage(
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<string> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    if (this.assetFolder) {
      formData.append('folder', this.assetFolder);
    }

    try {
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || `Erreur Cloudinary HTTP ${response.status}`;
        throw new Error(message);
      }

      const data: CloudinaryUploadResponse = await response.json();
      return data.secure_url;
    } catch (err: any) {
      console.warn('Cloudinary upload warning:', err.message);
      throw err;
    }
  }

  /**
   * Helper to get Cloudinary settings status
   */
  public static getInfo() {
    return {
      cloudName: this.cloudName,
      uploadPreset: this.uploadPreset,
      assetFolder: this.assetFolder,
      configured: Boolean(this.cloudName && this.uploadPreset),
    };
  }
}
