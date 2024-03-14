import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import { Injectable } from '@nestjs/common';

import {
  CreateCertificateUploadURLDto,
  CertificateUploadUrlResponseDto,
} from '../dto';
import { S3Service } from '../../storage/s3.service';
import { CERTIFICATE_STORAGE_KEY } from '../constants';
import { resolveContentType } from '../../common/helpers';

@Injectable()
export class CertificateFilesService {
  constructor(private readonly s3Service: S3Service) {}

  async createUploadURL(
    data: CreateCertificateUploadURLDto,
  ): Promise<CertificateUploadUrlResponseDto> {
    const fileExtension = extname(data.filename);
    const certificateKey = this.generateCertificateKey(fileExtension);
    const contentType = resolveContentType(fileExtension);

    const uploadUrl = await this.s3Service.getPresignedUploadUrl({
      key: certificateKey,
      contentType,
    });

    return {
      key: certificateKey,
      contentType,
      uploadUrl,
    };
  }

  async deleteCertificateFromStorage(certificateKey: string): Promise<void> {
    await this.s3Service.deleteOne(certificateKey);
  }

  private generateCertificateKey(fileExtension: string): string {
    const uuid = randomUUID();

    return `${CERTIFICATE_STORAGE_KEY}/${uuid}${fileExtension}`;
  }
}
