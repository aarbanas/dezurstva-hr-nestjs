import { UserType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty()
  @IsEnum(UserType)
  type: UserType;
}
