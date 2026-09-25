/**
 * storage.ts — Centralised file upload utility
 *
 * PRIMARY:  Cloudinary (free 25 GB bandwidth/month, no egress costs)
 * FALLBACK: Supabase Storage (used only when Cloudinary is not configured)
 *
 * Usage:
 *   import { uploadFile } from '../../lib/storage';
 *   const url = await uploadFile(file, { folder: 'avatars' });
 */

import { supabase } from './supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export type UploadOptions = {
    /** Sub-folder in Cloudinary / bucket path prefix in Supabase */
    folder?: string;
    /** Override the Supabase bucket name (default: 'uploads') */
    bucket?: string;
    /** Cloudinary resource type. default is 'auto' (detects image/video/raw) */
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
};

// ─── Cloudinary ──────────────────────────────────────────────────────────────

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const isCloudinaryConfigured =
    Boolean(CLOUDINARY_CLOUD_NAME) && Boolean(CLOUDINARY_UPLOAD_PRESET);

async function uploadToCloudinary(
    file: File,
    options: UploadOptions = {}
): Promise<string> {
    const { folder = 'unilink', resourceType = 'auto' } = options;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
            `Cloudinary upload failed: ${err?.error?.message ?? res.statusText}`
        );
    }

    const data = await res.json();
    // Use the secure_url (HTTPS CDN link, served from Cloudflare globally)
    return data.secure_url as string;
}

// ─── Supabase fallback ───────────────────────────────────────────────────────

async function uploadToSupabase(
    file: File,
    options: UploadOptions = {}
): Promise<string> {
    const { folder = '', bucket = 'uploads' } = options;
    const ext = file.name.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = folder ? `${folder}/${uniqueName}` : uniqueName;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Upload a file. Tries Cloudinary first (no egress cost), falls back to
 * Supabase Storage if Cloudinary is not configured.
 *
 * Returns a public HTTPS URL to the uploaded file.
 */
export async function uploadFile(
    file: File,
    options: UploadOptions = {}
): Promise<string> {
    if (isCloudinaryConfigured) {
        try {
            return await uploadToCloudinary(file, options);
        } catch (err) {
            console.warn(
                '[storage] Cloudinary upload failed, falling back to Supabase:',
                err
            );
        }
    }

    return uploadToSupabase(file, options);
}

/**
 * Returns true when Cloudinary is active (primary provider).
 * Useful to conditionally show upload size limits, etc.
 */
export const isUsingCloudinary = isCloudinaryConfigured;
