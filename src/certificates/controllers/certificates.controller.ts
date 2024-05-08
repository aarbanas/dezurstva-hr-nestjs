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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
  CreateCertificateDto,
  UpdateCertificateDto,
  CertificateResponseDto,
  SearchCertificatesQueryDto,
} from '../dto';
import RoleGuard from '../../auth/guards/role.guard';
import { User } from '../../decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { CertificatesService } from '../services/certificates.service';
import { SessionUser } from '../../auth/passport-strategies/jwt.strategy';

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
    return this.certificatesService.create(user.id, createCertificateDto);
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
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.certificatesService.remove(id);
  }
}