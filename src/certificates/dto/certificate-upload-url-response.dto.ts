import { ApiProperty } from '@nestjs/swagger';

export class CertificateUploadUrlResponseDto {
  @ApiProperty({
    example: 'certificates/d7d49a23-6ed8-43b9-9c5a-ed5e6152ecb3.png',
  })
  key: string;

  @ApiProperty({
    example:
      'http://localhost:9000/test-bucket/certificates/d7d49a23-6ed8-43b9-9c5a-ed5e6152ecb3.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ibANggNPRZUeMCtoQ5Pz%2F20240218%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20240218T174625Z&X-Amz-Expires=900&X-Amz-Signature=c4661060c8af6609c43e3e324e8a8194cf7f72d9ba6992a6e4e5f41cf085ab0e&X-Amz-SignedHeaders=host&x-amz-acl=public-read-write&x-id=PutObject',
  })
  uploadUrl: string;

  @ApiProperty({
    required: false,
    example: 'image/png',
  })
  contentType?: string;
}
