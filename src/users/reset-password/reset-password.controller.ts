import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResetPasswordService } from './reset-password.service';
import { ForgotPasswordDto, ResetPasswordDto } from './reset-password.dto';

@Controller('reset-password')
@ApiTags('reset-password')
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Post('forgot')
  async forgotPassword(@Body() data: ForgotPasswordDto) {
    const { email } = data;
    return this.resetPasswordService.forgotPassword(email);
  }

  @Post('')
  async resetPassword(
    @Query('token') token: string,
    @Body() data: ResetPasswordDto,
  ) {
    const { password } = data;
    return this.resetPasswordService.resetPassword(token, password);
  }
}
