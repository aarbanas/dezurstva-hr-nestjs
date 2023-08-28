import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarResponse {
  @ApiProperty()
  avatarUrl: string;
}
