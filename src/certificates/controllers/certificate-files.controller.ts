import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  CreateCertificateUploadURLDto,
  CertificateUploadUrlResponseDto,
} from '../dto';
import { CertificateFilesService } from '../services';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:certificateKey')
  async deleteCertificateFromStorage(
    @Param('certificateKey') certificateKey: string,
  ): Promise<void> {
    return this.certificateFilesService.deleteCertificateFromStorage(
      certificateKey,
    );
  }

  @ApiOperation({
    summary: 'Download a certificate file',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/:id/download')
  async download(@Param('id', ParseIntPipe) id: number) {
    return this.certificateFilesService.download(id);
  }
}
