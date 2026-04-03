import { Injectable } from '@nestjs/common';
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
    const internalEndpoint = `http://localhost:${minioPort}`;

    // Public URL = what browsers use to load images
    const publicIp = this.configService.get<string>('PUBLIC_IP', 'localhost');
    this.publicBaseUrl = `http://${publicIp}:${minioPort}`;

    console.log(`[QRFoto-Media] Internal endpoint: ${internalEndpoint}`);
    console.log(`[QRFoto-Media] Public base URL: ${this.publicBaseUrl}`);

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

  /**
   * Ensures the bucket exists and is publicly readable.
   * This eliminates all signature mismatch problems.
   */
  private async ensureBucketPublic() {
    try {
      await this.s3Client.send(new S3.HeadBucketCommand({ Bucket: this.bucketName }));
      console.log(`[QRFoto-Media] Bucket "${this.bucketName}" already exists.`);
    } catch {
      console.log(`[QRFoto-Media] Creating bucket "${this.bucketName}"...`);
      await this.s3Client.send(new S3.CreateBucketCommand({ Bucket: this.bucketName }));
    }

    // Set a public READ policy so any browser can load images without signatures
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
      console.log(`[QRFoto-Media] ✅ Bucket is now PUBLIC. Images will load on all devices.`);
    } catch (err) {
      console.error(`[QRFoto-Media] ❌ Could not set bucket policy:`, err.message);
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    const fileKey = `${folder}/${uuidv4()}-${file.originalname}`;

    await this.s3Client.send(
      new S3.PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return fileKey;
  }

  /**
   * Returns a direct public URL — no signature, no expiry, works from any device.
   * Format: http://PUBLIC_IP:9000/bucket-name/key
   */
  getPublicUrl(fileKey: string): string | null {
    if (!fileKey) return null;
    return `${this.publicBaseUrl}/${this.bucketName}/${fileKey}`;
  }

  async getFileStream(fileKey: string): Promise<any> {
    const command = new S3.GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });
    const response = await this.s3Client.send(command);
    return response.Body;
  }
}
