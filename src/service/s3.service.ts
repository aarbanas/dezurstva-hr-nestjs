/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type UploadFileMetadata = {
  mimetype?: string;
};

@Injectable()
export class S3Service {
  private bucket = this.configService.get('S3_BUCKET');

  private readonly s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('S3_SECRET_ACCESS_KEY'),
      },
      endpoint: this.configService.get('S3_MOCK_URL'),
      forcePathStyle: !!this.configService.get('S3_MOCK_URL'),
    });
  }

  async upload(
    dataBuffer: Buffer,
    key: string,
    metadata?: UploadFileMetadata,
  ): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: dataBuffer,
        ACL: 'private',
        ContentType: metadata?.mimetype,
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

  async deleteOne(key: string): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return this.s3Client.send(command);
  }

  async deleteMany(keys: string[]): Promise<DeleteObjectsCommandOutput> {
    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((key) => {
          return { Key: key };
        }),
      },
    });

    return this.s3Client.send(command);
  }
}
