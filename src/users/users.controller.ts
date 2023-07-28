import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import RoleGuard from '../auth/guards/role.guard';
import { FindUserDto } from './dto/find-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IsMeGuard } from '../auth/guards/is-me.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserStrategy } from './create-strategy/create-user.strategy';
import { CreateOrganisationStrategy } from './create-strategy/create-organisation.strategy';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private prismaService: PrismaService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    switch (createUserDto.role) {
      case 'USER':
        return this.usersService.create(
          createUserDto,
          new CreateUserStrategy(this.prismaService),
        );
      case 'ORGANISATION':
        return this.usersService.create(
          createUserDto,
          new CreateOrganisationStrategy(this.prismaService),
        );
      default:
        throw new ForbiddenException();
    }
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard([Role.ADMIN, Role.ORGANISATION]))
  find(@Query() query: FindUserDto) {
    return this.usersService.find(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsMeGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsMeGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard([Role.ADMIN]))
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
