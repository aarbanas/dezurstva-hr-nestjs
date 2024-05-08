import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SearchCertificatesQueryDto {
  @ApiProperty({
    type: Number,
    example: 1,
    description: 'User ID to search certificates for.',
  })
  @IsNumber()
  @Type(() => Number)
  userId: number;
}
