import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID || '';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    this.bucket = process.env.R2_BUCKET_NAME || 'unilink-media';
    this.publicUrl = process.env.R2_PUBLIC_URL || '';

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async presign(folder: string, ext: string, mimeType?: string) {
    const cleanExt = ext.replace(/^\./, '');
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
    const contentType = mimeType || this.guessMime(cleanExt);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    const finalPublicUrl = this.publicUrl
      ? `${this.publicUrl.replace(/\/$/, '')}/${filename}`
      : uploadUrl.split('?')[0];

    return {
      uploadUrl,
      publicUrl: finalPublicUrl,
      key: filename,
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
