/**
 * Cloudinary Unified Upload Service
 * Handles video, image, and document uploads with maximum compression/optimization.
 *
 * URL transformation strategies used to minimize bandwidth:
 *
 * Images:
 *   f_auto        — serve WebP/AVIF if browser supports it (massive size savings)
 *   q_auto        — Cloudinary picks optimal quality (usually 70-80)
 *   fl_lossy      — allow lossy compression for PNGs/GIFs (dramatic savings)
 *   fl_strip_profile — strip EXIF metadata (saves 10-30KB per image)
 *   c_limit       — downscale only if larger than target, never upscale
 *
 * Videos:
 *   f_auto        — serve MP4/WebM based on browser support
 *   q_auto:good   — adaptive bitrate quality
 *   w_1280,h_720  — cap at 720p for feed videos
 *   vc_auto       — auto codec (H.264 for MP4, VP8 for WebM)
 *   fl_lossy      — enable lossy compression
 *
 * Documents (PDFs, DOCX, PPTX, etc.):
 *   resource_type=raw — store as-is, served via Cloudinary CDN
 *   No transformation (PDFs can't be transcoded, CDN caching is the saving)
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadProgressCallback {
    (progress: number): void;
}

export interface VideoUploadResult {
    url: string;
    secureUrl: string;
    publicId: string;
    thumbnailUrl: string;
    duration: number;
    format: string;
    width: number;
    height: number;
    bytes: number;
}

export interface ImageUploadResult {
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
}

export interface DocumentUploadResult {
    secureUrl: string;
    publicId: string;
    bytes: number;
    format: string;
    resourceType: string;
    originalFilename: string;
}

// ─── URL builder helpers ──────────────────────────────────────────────────────

/**
 * Build an optimized image delivery URL.
 * Applies all bandwidth-saving transformations automatically.
 *
 * @example
 * buildImageUrl('ulink/avatars/abc123', { w: 200, h: 200, crop: 'fill' })
 * → https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,fl_lossy,fl_strip_profile,c_fill,w_200,h_200/ulink/avatars/abc123
 */
export function buildImageUrl(
    publicId: string,
    opts: {
        w?: number;
        h?: number;
        crop?: 'fill' | 'limit' | 'thumb' | 'fit';
        quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number;
        format?: 'auto' | 'webp' | 'avif';
    } = {}
): string {
    if (!publicId) return '';
    const parts: string[] = [];

    // Core bandwidth savers — always applied
    parts.push('f_auto');                         // WebP/AVIF format negotiation
    parts.push(`q_${opts.quality ?? 'auto'}`);    // auto quality
    parts.push('fl_lossy');                       // lossy PNG/GIF compression
    parts.push('fl_strip_profile');               // strip EXIF metadata

    if (opts.crop) parts.push(`c_${opts.crop}`);
    if (opts.w) parts.push(`w_${opts.w}`);
    if (opts.h) parts.push(`h_${opts.h}`);

    const transform = parts.join(',');
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}`;
}

/**
 * Build an optimized video delivery URL.
 */
export function buildVideoUrl(
    publicId: string,
    opts: {
        w?: number;
        quality?: 'auto:low' | 'auto:good' | 'auto:best';
    } = {}
): string {
    if (!publicId) return '';
    const parts: string[] = [
        'f_auto',
        `q_${opts.quality ?? 'auto:good'}`,
        'vc_auto',
        'fl_lossy',
    ];
    if (opts.w) parts.push(`w_${opts.w}`, 'c_limit');

    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${parts.join(',')}/${publicId}`;
}

/**
 * Build a video poster/thumbnail URL from a video public_id.
 */
export function buildVideoThumbnailUrl(publicId: string, w = 640, h = 360): string {
    if (!publicId) return '';
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,f_auto,q_auto,fl_strip_profile,c_fill,w_${w},h_${h}/${publicId}.jpg`;
}

// ─── Upload helpers ───────────────────────────────────────────────────────────

async function uploadToCloudinary(
    file: File,
    resourceType: 'image' | 'video' | 'raw',
    folder: string,
    onProgress?: UploadProgressCallback
): Promise<any> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    // For videos: request eager transformation at upload time (done async server-side)
    if (resourceType === 'video') {
        // Eager: Cloudinary auto-transcodes to optimal format/quality server-side
        // This means the ORIGINAL raw video is stored once, transformations are cached on CDN
        formData.append('eager', 'f_auto,q_auto:good,vc_auto,fl_lossy,w_1280,h_720,c_limit');
        formData.append('eager_async', 'true');
    }

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
            });
        }

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch {
                    reject(new Error('Failed to parse Cloudinary response'));
                }
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    reject(new Error(err.error?.message || `Upload failed: ${xhr.status}`));
                } catch {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);
        xhr.send(formData);
    });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export class CloudinaryService {

    isConfigured(): boolean {
        return !!(CLOUD_NAME && UPLOAD_PRESET);
    }

    // ── Video upload ────────────────────────────────────────────────────────

    async uploadVideo(
        file: File,
        opts: { folder?: string; onProgress?: UploadProgressCallback } = {}
    ): Promise<VideoUploadResult> {
        const res = await uploadToCloudinary(
            file,
            'video',
            opts.folder ?? 'ulink/videos',
            opts.onProgress
        );

        return {
            url: res.url,
            secureUrl: res.secure_url,
            publicId: res.public_id,
            thumbnailUrl: buildVideoThumbnailUrl(res.public_id),
            duration: res.duration ?? 0,
            format: res.format,
            width: res.width,
            height: res.height,
            bytes: res.bytes,
        };
    }

    // ── Image upload ────────────────────────────────────────────────────────
    // Client pre-compresses via canvas, then Cloudinary serves via CDN with f_auto,q_auto

    async uploadImage(
        file: File,
        opts: { folder?: string; onProgress?: UploadProgressCallback } = {}
    ): Promise<ImageUploadResult> {
        const res = await uploadToCloudinary(
            file,
            'image',
            opts.folder ?? 'ulink/images',
            opts.onProgress
        );

        return {
            secureUrl: res.secure_url,
            publicId: res.public_id,
            width: res.width,
            height: res.height,
            bytes: res.bytes,
            format: res.format,
        };
    }

    // ── Document upload (PDF, DOCX, PPTX, etc.) ─────────────────────────────
    // Stored as `raw` resource type — served from Cloudinary CDN, no transformation cost

    async uploadDocument(
        file: File,
        opts: { folder?: string; onProgress?: UploadProgressCallback } = {}
    ): Promise<DocumentUploadResult> {
        const res = await uploadToCloudinary(
            file,
            'raw',
            opts.folder ?? 'ulink/documents',
            opts.onProgress
        );

        return {
            secureUrl: res.secure_url,
            publicId: res.public_id,
            bytes: res.bytes,
            format: res.format,
            resourceType: res.resource_type,
            originalFilename: res.original_filename ?? file.name,
        };
    }

    // ── Convenience URL builders (re-exported for use in components) ─────────

    imageUrl = buildImageUrl;
    videoUrl = buildVideoUrl;
    thumbnailUrl = buildVideoThumbnailUrl;

    // ── Legacy method kept for backward compat (videos via old service) ──────
    async upload(file: File, options?: { onProgress?: UploadProgressCallback; folder?: string }): Promise<VideoUploadResult> {
        return this.uploadVideo(file, options);
    }

    getThumbnailUrl = buildVideoThumbnailUrl;

    getOptimizedUrl(publicId: string, opts?: { quality?: 'auto:low' | 'auto:good' | 'auto:best'; width?: number; height?: number }): string {
        return buildVideoUrl(publicId, { quality: opts?.quality, w: opts?.width });
    }

    extractPublicId(url: string): string | null {
        try {
            const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
            return match ? match[1] : null;
        } catch {
            return null;
        }
    }
}

// Singleton
export const cloudinaryService = new CloudinaryService();

// Named re-exports for convenience
export { buildImageUrl as getOptimizedImageUrl };
export { buildVideoUrl as getOptimizedVideoUrl };
export { buildVideoThumbnailUrl as getVideoThumbnail };
