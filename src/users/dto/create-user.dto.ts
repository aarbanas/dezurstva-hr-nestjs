import { Role, UserType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsEnum(Role)
  role: Role;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reCaptchaToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  termsAndConditions: boolean;

  @ApiProperty()
  @ValidateIf((object) => object.role === Role.USER)
  @IsNotEmpty()
  @IsString()
  firstname?: string;

  @ApiProperty()
  @ValidateIf((object) => object.role === Role.USER)
  @IsNotEmpty()
  @IsString()
  lastname?: string;

  @ApiProperty()
  @ValidateIf((object) => object.role === Role.USER)
  @IsNotEmpty()
  @IsString()
  phone?: string;

  @ApiProperty()
  @ValidateIf((object) => object.role === Role.USER)
  @IsEnum(UserType)
  type?: UserType;

  @ApiProperty()
  @ValidateIf((object) => object.role === Role.ORGANISATION)
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty()
  @ValidateIf((object) => object.role === Role.ORGANISATION)
  @IsNotEmpty()
  @IsString()
  street?: string;

  @ApiProperty()
  @ValidateIf((object) => object.role === Role.ORGANISATION)
  @IsNotEmpty()
  @IsString()
  oib?: string;
}
