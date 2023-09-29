import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePhotoResponse {
  @ApiProperty()
  profilePhoto: string;
}
