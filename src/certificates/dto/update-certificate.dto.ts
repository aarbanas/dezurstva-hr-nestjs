import { PartialType } from '@nestjs/swagger';
import { CreateCertificateDto } from './create-certificate.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {
  @IsNotEmpty()
  active: boolean;
}
