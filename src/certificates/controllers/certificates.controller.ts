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
  UseGuards,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import {
  CreateCertificateDto,
  UpdateCertificateDto,
  CertificateResponseDto,
  SearchCertificatesQueryDto,
} from '../dto';
import RoleGuard from '../../auth/guards/role.guard';
import { User } from '../../decorators/user.decorator';
import { IsMeGuard } from '../../auth/guards/is-me.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CertificatesService } from '../services/certificates.service';
import { SessionUser } from '../../auth/passport-strategies/jwt.strategy';

const FILE_SIZE = 3 * 1000 * 1000;
@Controller('certificates')
@ApiTags('certificates')
@ApiBearerAuth()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard([Role.USER, Role.ADMIN]))
  async create(
    @Body() createCertificateDto: CreateCertificateDto,
    @User() user: SessionUser,
  ) {
    if (user.id !== createCertificateDto.userId) throw new ForbiddenException();

    return this.certificatesService.create(createCertificateDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() updateCertificateDto: UpdateCertificateDto,
    @Param('id') id: string,
  ) {
    return this.certificatesService.update(+id, updateCertificateDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(CertificateResponseDto)
  async getAll(@Query() query: SearchCertificatesQueryDto) {
    return this.certificatesService.getAllByUserId(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Param('id') id: string) {
    return this.certificatesService.get(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.certificatesService.remove(+id);
  }

  @Post('upload')
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
  @UseGuards(JwtAuthGuard, RoleGuard([Role.ADMIN, Role.USER]))
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
    @User() user: SessionUser,
  ) {
    return this.certificatesService.upload(file, user.id.toString());
  }

  @Get('download/:id')
  @UseGuards(JwtAuthGuard)
  download(@Param('id') id: string) {
    return this.certificatesService.getFile(+id);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, IsMeGuard)
  removeFile(@Param('id') id: string) {
    return this.certificatesService.deleteFile(+id);
  }
}
