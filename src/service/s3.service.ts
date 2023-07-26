/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}

  private bucket = this.configService.get('S3_BUCKET');

  private s3Client = new S3Client({
    region: this.configService.get('S3_REGION'),
    credentials: {
      accessKeyId: this.configService.get('S3_ACCESS_KEY_ID')!,
      secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY')!,
    },
  });

  async upload(file: Express.Multer.File, userId: string): Promise<string> {
    const key = `documents/${userId}/${file.originalname}`;
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ACL: 'private',
        ContentType: file.mimetype,
      }),
    );

    return key;
  }

  async get(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command);
  }

  async delete(key: string): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return this.s3Client.send(command);
  }
}
