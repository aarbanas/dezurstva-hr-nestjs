import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsIn } from 'class-validator';

export class FindUserDto {
  @ApiPropertyOptional()
  page: string;

  @ApiPropertyOptional()
  limit: string;

  @ApiPropertyOptional()
  sort: string;

  @ApiPropertyOptional()
  dir: string;

  @ApiPropertyOptional()
  filter: object;

  @IsIn(['USER', 'ORGANISATION'])
  type: Omit<Role, 'ADMIN'>;

  @ApiPropertyOptional()
  populateCertificates?: boolean;
}
