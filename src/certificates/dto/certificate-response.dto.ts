import { CertificateType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class CertificateResponseDto {
  @Expose()
  id: number;

  @Expose()
  type: CertificateType;

  @Expose()
  validTill?: Date | null;

  @Expose()
  key: string;

  @Expose()
  active: boolean;
}
