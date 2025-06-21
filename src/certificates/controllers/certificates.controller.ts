import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CreateCertificateDto,
  UpdateCertificateDto,
  CertificateResponseDto,
  SearchCertificatesQueryDto,
  CreateCertificateOnBehalfOfDto,
} from '../dto';
import RoleGuard from '../../auth/guards/role.guard';
import { User } from '../../decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CertificatesService } from '../services';
import { SessionUser } from '../../auth/passport-strategies/jwt.strategy';
import { CertificateNotifyUserDto } from '../dto/certificate-notify-user.dto';

@Controller('certificates')
@ApiTags('certificates')
@ApiBearerAuth()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @ApiOperation({
    summary: 'Create a certificate entry',
  })
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard([Role.ADMIN, Role.USER]))
  async create(
    @Body() createCertificateDto: CreateCertificateDto,
    @User() user: SessionUser,
  ) {
    return this.certificatesService.create(user.id, createCertificateDto);
  }

  @ApiOperation({
    summary: 'Create a certificate entry on behalf of a user',
  })
  @Post('create-on-behalf-of')
  @UseGuards(JwtAuthGuard, RoleGuard([Role.ADMIN]))
  async createOnBehalfOf(@Body() body: CreateCertificateOnBehalfOfDto) {
    return this.certificatesService.create(body.userId, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() updateCertificateDto: UpdateCertificateDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.certificatesService.update(id, updateCertificateDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(CertificateResponseDto)
  async getAll(@Query() query: SearchCertificatesQueryDto) {
    return this.certificatesService.search(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.certificatesService.get(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @User() user: SessionUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.certificatesService.remove(user, id);
  }

  @Post('notify/:id')
  @UseGuards(JwtAuthGuard, RoleGuard([Role.ADMIN]))
  async notifyToUpload(
    @Body() body: CertificateNotifyUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const { certificateType } = body;
    return this.certificatesService.notifyToUpload(id, certificateType);
  }
}
