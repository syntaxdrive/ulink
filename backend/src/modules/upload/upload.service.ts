import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3?: S3Client;
  private bucket: string;
  private publicUrl: string;
  private hasR2 = false;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID || '';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    this.bucket = process.env.R2_BUCKET_NAME || 'unilink-media';
    this.publicUrl = process.env.R2_PUBLIC_URL || '';

    if (accountId && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.hasR2 = true;
    } else {
      this.logger.log('Cloudflare R2 credentials not configured. Using Azure VM / Local Disk storage engine.');
    }
  }

  async presign(folder: string, ext: string, mimeType?: string) {
    const cleanFolder = (folder || 'posts').replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanExt = (ext || 'jpg').replace(/^\./, '').replace(/[^a-zA-Z0-9]/g, '');
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
    const contentType = mimeType || this.guessMime(cleanExt);

    // If R2 is configured, use S3 presigned URL
    if (this.hasR2 && this.s3) {
      try {
        const fullKey = `${cleanFolder}/${filename}`;
        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: fullKey,
          ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
        const finalPublicUrl = this.publicUrl
          ? `${this.publicUrl.replace(/\/$/, '')}/${fullKey}`
          : uploadUrl.split('?')[0];

        return {
          uploadUrl,
          publicUrl: finalPublicUrl,
          key: fullKey,
        };
      } catch (err) {
        this.logger.warn('Failed to generate R2 presigned URL, falling back to Azure disk storage', err);
      }
    }

    // Default Azure VM / Self-Hosted Disk Storage:
    const baseUrl = process.env.BASE_MEDIA_URL || process.env.API_BASE_URL || 'https://158-158-120-244.sslip.io';
    const uploadUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/upload/file/${cleanFolder}/${filename}`;
    const publicUrl = `${baseUrl.replace(/\/$/, '')}/uploads/${cleanFolder}/${filename}`;

    return {
      uploadUrl,
      publicUrl,
      key: `${cleanFolder}/${filename}`,
    };
  }

  async saveBinaryFile(req: any, folder: string, filename: string) {
    const cleanFolder = (folder || 'posts').replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanFilename = (filename || `${Date.now()}.jpg`).replace(/[^a-zA-Z0-9_.-]/g, '');

    // Target upload directory on Azure VM (/var/www/unilink-api/uploads or ./uploads)
    const uploadBase = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    const targetFolder = path.join(uploadBase, cleanFolder);

    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const targetPath = path.join(targetFolder, cleanFilename);
    const writeStream = fs.createWriteStream(targetPath);

    await new Promise((resolve, reject) => {
      req.pipe(writeStream);
      req.on('end', resolve);
      req.on('error', reject);
      writeStream.on('error', reject);
    });

    const baseUrl = process.env.BASE_MEDIA_URL || 'https://158-158-120-244.sslip.io';
    const publicUrl = `${baseUrl.replace(/\/$/, '')}/uploads/${cleanFolder}/${cleanFilename}`;

    return {
      success: true,
      publicUrl,
      url: publicUrl,
      filename: cleanFilename,
    };
  }

  private guessMime(ext: string): string {
    const map: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      mp3: 'audio/mpeg',
      m4a: 'audio/mp4',
      pdf: 'application/pdf',
    };
    return map[ext.toLowerCase()] || 'application/octet-stream';
  }
}
