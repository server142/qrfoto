import { Injectable, BadRequestException } from '@nestjs/common';
import * as S3 from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private s3Client: S3.S3Client;
  private bucketName: string;
  private publicBaseUrl: string;

  constructor(private configService: ConfigService) {
    const minioPort = this.configService.get<string>('MINIO_PORT', '9000');
    const minioEndpoint = this.configService.get<string>('MINIO_ENDPOINT', '127.0.0.1');
    const internalEndpoint = `http://${minioEndpoint}:${minioPort}`;

    const publicIp = this.configService.get<string>('PUBLIC_IP', 'localhost');
    this.publicBaseUrl = `http://${publicIp}:${minioPort}`;

    this.s3Client = new S3.S3Client({
      region: this.configService.get<string>('MINIO_REGION', 'us-east-1'),
      endpoint: internalEndpoint,
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true,
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'qrfoto-media');
    this.ensureBucketPublic();
  }

  private async ensureBucketPublic() {
    try {
      await this.s3Client.send(new S3.HeadBucketCommand({ Bucket: this.bucketName }));
    } catch (e) {
      try {
        await this.s3Client.send(new S3.CreateBucketCommand({ Bucket: this.bucketName }));
      } catch (err) {
        console.warn(`[MinIO] Warning: Could not verify or create bucket ${this.bucketName}. Check if MinIO is running.`, err.message);
        return; // Don't proceed with policy if bucket doesn't exist
      }
    }

    const publicPolicy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    });

    try {
      await this.s3Client.send(
        new S3.PutBucketPolicyCommand({
          Bucket: this.bucketName,
          Policy: publicPolicy,
        }),
      );
    } catch (err) {
      console.error(`[QRFoto-Media] ❌ Policy error:`, err.message);
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    let finalBuffer = file.buffer;
    let finalMimeType = file.mimetype;
    let finalExtension = file.originalname.split('.').pop() || 'jpg';

    const isImage = file.mimetype.startsWith('image/') && !file.mimetype.includes('gif');

    if (isImage) {
      try {
        const sharp = require('sharp');
        const path = require('path');
        const fs = require('fs');

        let watermarkPath = path.join(process.cwd(), 'src', 'assets', 'watermark.png');
        if (!fs.existsSync(watermarkPath)) {
          watermarkPath = path.join(process.cwd(), 'assets', 'watermark.png');
        }

        // --- PROCESAMIENTO ROBUSTO DE IMAGEN ---
        // Forzamos rotación según EXIF y siempre convertimos a JPEG para máxima compatibilidad
        let pipeline = sharp(file.buffer)
          .rotate() // Corrige la orientación automáticamente
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true }) // Redimensionamos para que no pesen demasiado
          .jpeg({ quality: 80, mozjpeg: true });

        if (fs.existsSync(watermarkPath)) {
          const metadata = await sharp(file.buffer).metadata();
          const watermarkWidth = Math.round((metadata.width || 1000) * 0.20);
          const watermark = await sharp(watermarkPath).resize(watermarkWidth).toBuffer();

          pipeline = pipeline.composite([
            { input: watermark, gravity: 'southeast', blend: 'over' }
          ]);
          console.log(`[QRFoto-Media] 💧 Watermark & Auto-JPEG applied to ${file.originalname}`);
        } else {
          console.log(`[QRFoto-Media] ✅ Auto-JPEG applied to ${file.originalname}`);
        }

        finalBuffer = await pipeline.toBuffer();
        finalMimeType = 'image/jpeg';
        finalExtension = 'jpg';
      } catch (err) {
        console.error(`[QRFoto-Media] ⚠️ Error processing image (Sharp):`, err.message);
        // Silently continue with original if sharp fails
      }
    }

    const fileKey = `${folder}/${uuidv4()}.${finalExtension}`;

    try {
      await this.s3Client.send(
        new S3.PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
          Body: finalBuffer,
          ContentType: finalMimeType,
        }),
      );
    } catch (err) {
      console.error(`[UploadsService] Error sending to MinIO:`, err.message);
      throw new BadRequestException('Storage service unavailable. Please check if MinIO is running.');
    }

    return fileKey;
  }

  getPublicUrl(fileKey: string): string | null {
    if (!fileKey) return null;
    const apiUrl = this.configService.get<string>('FRONTEND_URL', '').includes('localhost')
      ? 'http://localhost:3001/api'
      : 'https://api.qrfoto.com.mx/api';
    return `${apiUrl}/media/s3/${fileKey}`;
  }

  async getFileStream(fileKey: string): Promise<any> {
    const command = new S3.GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });
    const response = await this.s3Client.send(command);
    return response.Body;
  }

  /**
   * Deletes a single file from S3/MinIO
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      await this.s3Client.send(
        new S3.DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
        }),
      );
      console.log(`[QRFoto-Media] 🗑️ Archivo "${fileKey}" eliminado físicamente.`);
    } catch (err) {
      console.error(`[QRFoto-Media] ⚠️ Error deleting file ${fileKey}:`, err.message);
    }
  }

  /**
   * Deletes all files within a folder in the bucket.
   * Crucial for freeing up S3/MinIO space.
   */
  async deleteFolder(folder: string): Promise<void> {
    try {
      // 1. List all objects in the folder
      const listCommand = new S3.ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folder, // e.g. "events/UUID"
      });
      const listedObjects = await this.s3Client.send(listCommand);

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

      // 2. Map objects to delete
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
        },
      };

      // 3. Execute delete
      await this.s3Client.send(new S3.DeleteObjectsCommand(deleteParams));

      // 4. If truncated, repeat (recurse)
      if (listedObjects.IsTruncated) await this.deleteFolder(folder);

      console.log(`[QRFoto-Media] 🗑️ Folder "${folder}" cleared from storage.`);
    } catch (err) {
      console.error(`[QRFoto-Media] ⚠️ Error deleting folder ${folder}:`, err.message);
    }
  }
}
