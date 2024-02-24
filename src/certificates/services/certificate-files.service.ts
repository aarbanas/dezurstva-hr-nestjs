import { Injectable } from '@nestjs/common';

import {
  CreateCertificateUploadURLDto,
  CertificateUploadUrlResponseDto,
} from '../dto';
import { S3Service } from '../../storage/s3.service';

@Injectable()
export class CertificateFilesService {
  constructor(private readonly s3Service: S3Service) {}

  createUploadURL(
    data: CreateCertificateUploadURLDto,
  ): Promise<CertificateUploadUrlResponseDto> {
    throw new Error('Method not implemented.');
  }

  deleteCertificateFromStorage(certificateKey: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
