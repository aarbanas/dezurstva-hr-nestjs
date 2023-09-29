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
  UseInterceptors,
  FileTypeValidator,
  MaxFileSizeValidator,
  UploadedFile,
  ParseFilePipe,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import RoleGuard from '../auth/guards/role.guard';
import { FindUserDto } from './dto/find-user.dto';
import { User } from '../decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IsMeGuard } from '../auth/guards/is-me.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionUser } from '../auth/passport-strategies/jwt.strategy';
import { CreateUserStrategy } from './create-strategy/create-user.strategy';
import { CreateOrganisationStrategy } from './create-strategy/create-organisation.strategy';
import { UploadProfilePhotoResponse } from './dto/upload-avatar-response.dto';

const FILE_SIZE = 3 * 1000 * 1000;
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
  @UseGuards(JwtAuthGuard)
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

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    type: UploadProfilePhotoResponse,
  })
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('profilePhoto'))
  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  uploadProfilePhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: FILE_SIZE,
            message: 'Max file size is 3MB',
          }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @User() user: SessionUser,
  ): Promise<UploadProfilePhotoResponse> {
    return this.usersService.uploadProfilePhoto(user.id, file);
  }
}
