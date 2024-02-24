import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Param, Post } from '@nestjs/common';

import {
  CreateCertificateUploadURLDto,
  CertificateUploadUrlResponseDto,
} from '../dto';
import { CertificateFilesService } from '../services';

@ApiTags('certificate-files')
@Controller('certificate-files')
export class CertificateFilesController {
  constructor(
    private readonly certificateFilesService: CertificateFilesService,
  ) {}

  @Post('/upload-url')
  createUploadURL(
    @Body() data: CreateCertificateUploadURLDto,
  ): Promise<CertificateUploadUrlResponseDto> {
    return this.certificateFilesService.createUploadURL(data);
  }

  @ApiParam({
    name: 'certificateKey',
    required: true,
  })
  @Delete('/:certificateKey')
  deleteCertificateFromStorage(
    @Param('certificateKey') certificateKey: string,
  ): Promise<void> {
    return this.certificateFilesService.deleteCertificateFromStorage(
      certificateKey,
    );
  }
}
