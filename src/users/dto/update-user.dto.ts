import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { UserType } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  firstname?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  lastname?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsPhoneNumber('HR')
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  street?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  oib?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty()
  @IsEnum(UserType)
  @IsOptional()
  type?: UserType;
}
