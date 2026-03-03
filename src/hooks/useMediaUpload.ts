/**
 * useMediaUpload — Centralised media upload hook
 *
 * Provides a single, consistent interface for all media uploads in the app.
 * All uploads go through Cloudinary for:
 *   - Global CDN delivery (faster loads worldwide)
 *   - Automatic format negotiation (f_auto → WebP/AVIF)
 *   - Automatic quality reduction (q_auto → 60-80% filesize savings)
 *   - fl_lossy → lossless-looking but lossy compression for PNG/GIF
 *   - fl_strip_profile → EXIF metadata removed
 *   - Server-side eager video transcoding at upload time
 *
 * Usage:
 *   const { uploadImage, uploadVideo, uploadDocument, uploading, progress } = useMediaUpload();
 */

import { useState, useCallback } from 'react';
import { cloudinaryService, buildImageUrl, type ImageUploadResult, type VideoUploadResult, type DocumentUploadResult } from '../services/cloudinaryService';

// ─── Image upload config by context ──────────────────────────────────────────

const IMAGE_CONFIGS: Record<string, {
    folder: string;
    maxW?: number;
    maxH?: number;
    quality?: number;
}> = {
    avatar: { folder: 'ulink/avatars', maxW: 400, maxH: 400, quality: 0.85 },
    background: { folder: 'ulink/backgrounds', maxW: 1280, maxH: 480, quality: 0.80 },
    post: { folder: 'ulink/posts', maxW: 1280, maxH: 1280, quality: 0.82 },
    community: { folder: 'ulink/communities', maxW: 800, maxH: 800, quality: 0.85 },
    chat: { folder: 'ulink/messages', maxW: 1024, maxH: 1024, quality: 0.80 },
    comment: { folder: 'ulink/comments', maxW: 800, maxH: 800, quality: 0.80 },
};

// ─── Canvas pre-compressor ────────────────────────────────────────────────────

/**
 * Client-side canvas pre-compression before uploading to Cloudinary.
 * This reduces upload bandwidth (not just delivery bandwidth).
 * Cloudinary then re-optimises on delivery with f_auto,q_auto.
 */
async function canvasCompress(
    file: File,
    maxW = 1280,
    maxH = 1280,
    quality = 0.82
): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;

                // Scale down proportionally
                if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
                if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context failed'));

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, w, h);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error('Canvas toBlob failed'));
                        // Return as File so Cloudinary sees correct name
                        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('FileReader failed'));
        reader.readAsDataURL(file);
    });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseMediaUploadReturn {
    uploading: boolean;
    progress: number;      // 0-100
    error: string | null;
    uploadImage: (file: File, context?: keyof typeof IMAGE_CONFIGS) => Promise<ImageUploadResult>;
    uploadVideo: (file: File, onProgress?: (pct: number) => void) => Promise<VideoUploadResult>;
    uploadDocument: (file: File, courseId?: string) => Promise<DocumentUploadResult>;
    /** Get an optimised delivery URL for any Cloudinary image public_id */
    getImageUrl: typeof buildImageUrl;
    reset: () => void;
}

export function useMediaUpload(): UseMediaUploadReturn {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setUploading(false);
        setProgress(0);
        setError(null);
    }, []);

    // ── Image upload ──────────────────────────────────────────────────────────

    const uploadImage = useCallback(async (
        file: File,
        context: keyof typeof IMAGE_CONFIGS = 'post'
    ): Promise<ImageUploadResult> => {
        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            const cfg = IMAGE_CONFIGS[context] ?? IMAGE_CONFIGS.post;

            // Step 1: pre-compress client-side to reduce upload payload
            const compressed = await canvasCompress(file, cfg.maxW, cfg.maxH, cfg.quality);

            const beforeBytes = file.size;
            const afterBytes = compressed.size;
            const reduction = Math.round((1 - afterBytes / beforeBytes) * 100);
            console.debug(`[upload] Compressed ${file.name}: ${(beforeBytes / 1024).toFixed(0)}KB → ${(afterBytes / 1024).toFixed(0)}KB (${reduction}% reduction)`);

            // Step 2: upload to Cloudinary (adds f_auto,q_auto,fl_lossy on delivery)
            setProgress(10);
            const result = await cloudinaryService.uploadImage(compressed, {
                folder: cfg.folder,
                onProgress: (pct) => setProgress(10 + pct * 0.9),
            });

            setProgress(100);
            return result;
        } catch (e: any) {
            const msg = e?.message || 'Upload failed';
            setError(msg);
            throw e;
        } finally {
            setUploading(false);
        }
    }, []);

    // ── Video upload ──────────────────────────────────────────────────────────

    const uploadVideo = useCallback(async (
        file: File,
        onProgress?: (pct: number) => void
    ): Promise<VideoUploadResult> => {
        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            const result = await cloudinaryService.uploadVideo(file, {
                folder: 'ulink/videos',
                onProgress: (pct) => {
                    setProgress(pct);
                    onProgress?.(pct);
                },
            });
            setProgress(100);
            return result;
        } catch (e: any) {
            setError(e?.message || 'Video upload failed');
            throw e;
        } finally {
            setUploading(false);
        }
    }, []);

    // ── Document upload ───────────────────────────────────────────────────────

    const uploadDocument = useCallback(async (
        file: File,
        courseId?: string
    ): Promise<DocumentUploadResult> => {
        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            const folder = courseId
                ? `ulink/course-documents/${courseId}`
                : 'ulink/documents';

            const result = await cloudinaryService.uploadDocument(file, {
                folder,
                onProgress: (pct) => setProgress(pct),
            });
            setProgress(100);
            return result;
        } catch (e: any) {
            setError(e?.message || 'Document upload failed');
            throw e;
        } finally {
            setUploading(false);
        }
    }, []);

    return {
        uploading,
        progress,
        error,
        uploadImage,
        uploadVideo,
        uploadDocument,
        getImageUrl: buildImageUrl,
        reset,
    };
}
