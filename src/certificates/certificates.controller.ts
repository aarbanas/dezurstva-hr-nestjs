import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CertificatesService } from './certificates.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

const FILE_SIZE = 3 * 1000 * 1000;
@Controller('certificates')
@ApiTags('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  create(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificatesService.create(createCertificateDto);
  }
  @Patch(':id')
  update(
    @Body() updateCertificateDto: UpdateCertificateDto,
    @Param('id') id: string,
  ) {
    return this.certificatesService.update(+id, updateCertificateDto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.certificatesService.get(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certificatesService.remove(+id);
  }

  @Post('upload/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: FILE_SIZE,
            message: 'Max file size is 3MB',
          }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('id') id: string, // TODO Change when auth is implemented
  ) {
    return this.certificatesService.upload(file, id);
  }

  @Get('download/:id')
  download(@Param('id') id: string) {
    return this.certificatesService.getFile(+id);
  }

  @Delete('delete/:id')
  removeFile(@Param('id') id: string) {
    return this.certificatesService.deleteFile(+id);
  }
}
