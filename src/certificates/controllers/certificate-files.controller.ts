import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';

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

  @ApiOperation({
    summary: 'Generate a presigned URL for uploading a certificate file',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CertificateUploadUrlResponseDto,
  })
  @Post('/upload-url')
  async createUploadURL(
    @Body() data: CreateCertificateUploadURLDto,
  ): Promise<CertificateUploadUrlResponseDto> {
    return this.certificateFilesService.createUploadURL(data);
  }

  @ApiOperation({
    summary:
      'Delete a certificate file from the storage using a certificate key',
  })
  @ApiParam({
    name: 'certificateKey',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'No Content',
  })
  @Delete('/:certificateKey')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCertificateFromStorage(
    @Param('certificateKey') certificateKey: string,
  ): Promise<void> {
    return this.certificateFilesService.deleteCertificateFromStorage(
      certificateKey,
    );
  }
}
