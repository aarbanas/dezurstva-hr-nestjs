import { IsEmail, IsStrongPassword } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsStrongPassword({
    minLength: 8,
  })
  password: string;
}
