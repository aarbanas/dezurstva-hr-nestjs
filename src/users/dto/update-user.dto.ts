import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserType } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  firstname: string;

  @ApiProperty()
  @IsOptional()
  lastname: string;

  @ApiProperty()
  @IsOptional()
  active: boolean;

  @ApiProperty()
  @IsEnum(UserType)
  @IsOptional()
  type: UserType;
}
