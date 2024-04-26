import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CertificateType } from '@prisma/client';

export class CreateCertificateDto {
  @ApiProperty({
    enum: CertificateType,
  })
  @IsEnum(CertificateType)
  type: CertificateType;

  @ApiProperty()
  @IsNotEmpty()
  validTill: string;

  @ApiProperty()
  @IsNotEmpty()
  key: string;
}
