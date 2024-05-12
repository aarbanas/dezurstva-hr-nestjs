import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { CreateCertificateDto } from './create-certificate.dto';

export class CreateCertificateOnBehalfOfDto extends CreateCertificateDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: number;
}
