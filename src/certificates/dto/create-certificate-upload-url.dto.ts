import { ApiProperty } from '@nestjs/swagger';
import { Matches, Max } from 'class-validator';

import { MAX_CERTIFICATE_SIZE } from '../constants';

export class CreateCertificateUploadURLDto {
  @ApiProperty({
    example: 'file',
  })
  @Matches(new RegExp('.(jpg|jpeg|png|pdf)'), {
    message: 'filename must be of the following type: jpg, jpeg, png, pdf',
  })
  filename: string;

  @ApiProperty({
    example: 2000,
  })
  @Max(MAX_CERTIFICATE_SIZE)
  size: number;
}
