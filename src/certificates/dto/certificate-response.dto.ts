import { CertificateType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class CertificateResponseDto {
  @Expose()
  id: number;

  @Expose()
  type: CertificateType;

  @Expose()
  validTill: Date;

  @Expose()
  key: string;
}
