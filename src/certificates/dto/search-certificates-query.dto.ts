import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SearchCertificatesQueryDto {
  @ApiProperty({
    type: Number,
    example: 1,
    description: 'User ID to search certificates for.',
  })
  @IsNumber()
  userId: number;
}
