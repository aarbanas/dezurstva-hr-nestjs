import { Role } from '@prisma/client';
import RoleGuard from '../auth/guards/role.guard';
import { User } from '../decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { SessionUser } from '../auth/passport-strategies/jwt.strategy';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
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
} from '@nestjs/common';
import { IsMeGuard } from '../auth/guards/is-me.guard';

const FILE_SIZE = 3 * 1000 * 1000;
@Controller('certificates')
@ApiTags('certificates')
@ApiBearerAuth()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard([Role.USER, Role.ADMIN]))
  create(
    @Body() createCertificateDto: CreateCertificateDto,
    @User() user: SessionUser,
  ) {
    if (user.id !== createCertificateDto.userId) throw new ForbiddenException();

    return this.certificatesService.create(createCertificateDto);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, IsMeGuard)
  update(
    @Body() updateCertificateDto: UpdateCertificateDto,
    @Param('id') id: string,
  ) {
    return this.certificatesService.update(+id, updateCertificateDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, IsMeGuard)
  get(@Param('id') id: string) {
    return this.certificatesService.get(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, IsMeGuard)
  remove(@Param('id') id: string) {
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
