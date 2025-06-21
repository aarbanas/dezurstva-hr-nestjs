import { CertificateType } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CertificateNotifyUserDto {
  @ApiProperty()
  @IsEnum(CertificateType)
  certificateType: CertificateType;
}
