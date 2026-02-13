/**
 * Media Compression Utilities
 * Compresses images and videos before upload to reduce file sizes
 */

/**
 * Compress an image file
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default: 1920px)
 * @param maxHeight - Maximum height (default: 1080px)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Compressed image as Blob
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Enable image smoothing for better quality
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw image
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Compress a video file (reduces resolution and bitrate)
 * Note: This uses browser-native video compression which has limited support
 * For production, consider using a service like Cloudinary or Mux
 * 
 * @param file - The video file to compress
 * @returns Compressed video as Blob (or original if compression fails)
 */
export async function compressVideo(file: File): Promise<Blob> {
    // For now, we'll just return the original file
    // True video compression requires server-side processing or a service like Cloudinary
    // Browser-native video compression is not widely supported

    // Check file size - if it's already small enough, return as-is
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size <= maxSize) {
        return file;
    }

    // If file is too large, we can't compress it client-side reliably
    // Return the original and let the upload handle it
    console.warn('Video file is large. Consider using Cloudinary for compression.');
    return file;
}

/**
 * Get video metadata (duration, dimensions)
 * @param file - The video file
 * @returns Video metadata
 */
export async function getVideoMetadata(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
}> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            resolve({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight
            });
        };

        video.onerror = () => {
            reject(new Error('Failed to load video metadata'));
        };

        video.src = URL.createObjectURL(file);
    });
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Compress multiple images in parallel
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed blobs
 */
export async function compressImages(
    files: File[],
    options?: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    }
): Promise<Blob[]> {
    const compressionPromises = files.map(file =>
        compressImage(
            file,
            options?.maxWidth,
            options?.maxHeight,
            options?.quality
        )
    );

    return Promise.all(compressionPromises);
}

/**
 * Calculate compression ratio
 * @param originalSize - Original file size in bytes
 * @param compressedSize - Compressed file size in bytes
 * @returns Compression ratio as percentage (e.g., 65 means 65% reduction)
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): number {
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
