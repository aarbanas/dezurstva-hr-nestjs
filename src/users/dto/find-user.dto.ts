import { ApiPropertyOptional } from '@nestjs/swagger';

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
}
