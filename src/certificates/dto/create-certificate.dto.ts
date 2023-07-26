import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CertificateType } from '@prisma/client';

export class CreateCertificateDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsEnum(CertificateType)
  type: CertificateType;

  @ApiProperty()
  @IsNotEmpty()
  validTill: string;

  @ApiProperty()
  @IsNotEmpty()
  key: string;
}
