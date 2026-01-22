/**
 * Cloudinary Video Upload Service
 * Handles video uploads with automatic optimization and transformation
 */

interface CloudinaryConfig {
    cloudName: string;
    uploadPreset: string;
}

interface VideoUploadOptions {
    onProgress?: (progress: number) => void;
    folder?: string;
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

export class CloudinaryVideoService {
    private config: CloudinaryConfig;

    constructor() {
        this.config = {
            cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
            uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
        };

        if (!this.config.cloudName || !this.config.uploadPreset) {
            console.warn('Cloudinary credentials not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env');
        }
    }

    /**
     * Upload video to Cloudinary with automatic optimization
     */
    async upload(
        file: File,
        options?: VideoUploadOptions
    ): Promise<VideoUploadResult> {
        if (!this.config.cloudName || !this.config.uploadPreset) {
            throw new Error('Cloudinary is not configured. Please add credentials to .env file.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.config.uploadPreset);

        // Set folder for organization
        if (options?.folder) {
            formData.append('folder', options.folder);
        } else {
            formData.append('folder', 'ulink/videos');
        }

        // Eager transformations - optimize on upload
        formData.append('eager', JSON.stringify([
            {
                // Optimize for web delivery
                quality: 'auto:good',
                fetch_format: 'auto',
                // Limit to 720p for bandwidth savings
                width: 1280,
                height: 720,
                crop: 'limit',
                // Use modern codec
                video_codec: 'auto',
            }
        ]));

        // Add resource type
        formData.append('resource_type', 'video');

        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && options?.onProgress) {
                    const progress = (e.loaded / e.total) * 100;
                    options.onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve({
                            url: response.url,
                            secureUrl: response.secure_url,
                            publicId: response.public_id,
                            thumbnailUrl: this.getThumbnailUrl(response.public_id),
                            duration: response.duration || 0,
                            format: response.format,
                            width: response.width,
                            height: response.height,
                            bytes: response.bytes,
                        });
                    } catch (error) {
                        reject(new Error('Failed to parse upload response'));
                    }
                } else {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        reject(new Error(errorResponse.error?.message || 'Upload failed'));
                    } catch {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload was cancelled'));
            });

            xhr.open(
                'POST',
                `https://api.cloudinary.com/v1_1/${this.config.cloudName}/video/upload`
            );
            xhr.send(formData);
        });
    }

    /**
     * Generate thumbnail URL from video public ID
     */
    getThumbnailUrl(publicId: string, options?: {
        width?: number;
        height?: number;
        quality?: string;
    }): string {
        const width = options?.width || 400;
        const height = options?.height || 225;
        const quality = options?.quality || 'auto';

        return `https://res.cloudinary.com/${this.config.cloudName}/video/upload/so_0,w_${width},h_${height},c_fill,q_${quality}/${publicId}.jpg`;
    }

    /**
     * Get optimized video URL with transformations
     */
    getOptimizedUrl(publicId: string, options?: {
        quality?: 'auto:low' | 'auto:good' | 'auto:best';
        width?: number;
        height?: number;
    }): string {
        const quality = options?.quality || 'auto:good';
        const transformations: string[] = [`q_${quality}`, 'f_auto'];

        if (options?.width) {
            transformations.push(`w_${options.width}`);
        }
        if (options?.height) {
            transformations.push(`h_${options.height}`);
        }

        const transformStr = transformations.join(',');
        return `https://res.cloudinary.com/${this.config.cloudName}/video/upload/${transformStr}/${publicId}`;
    }

    /**
     * Get video URL optimized for mobile devices
     */
    getMobileUrl(publicId: string): string {
        return this.getOptimizedUrl(publicId, {
            quality: 'auto:low',
            width: 720,
        });
    }

    /**
     * Get video URL optimized for desktop
     */
    getDesktopUrl(publicId: string): string {
        return this.getOptimizedUrl(publicId, {
            quality: 'auto:good',
            width: 1280,
        });
    }

    /**
     * Extract public ID from Cloudinary URL
     */
    extractPublicId(url: string): string | null {
        try {
            const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
            return match ? match[1] : null;
        } catch {
            return null;
        }
    }

    /**
     * Check if Cloudinary is properly configured
     */
    isConfigured(): boolean {
        return !!(this.config.cloudName && this.config.uploadPreset);
    }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryVideoService();
