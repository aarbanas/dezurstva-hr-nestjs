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
  ParseIntPipe,
} from '@nestjs/common';
import { Role, User as UserModel } from '@prisma/client';
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
import { UserResponseDto } from './dto/find-user-response.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { EmailService } from 'src/notification/email/email.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

const FILE_SIZE = 3 * 1000 * 1000;

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @Serialize(UserResponseDto)
  create(@Body() createUserDto: CreateUserDto) {
    switch (createUserDto.role) {
      case 'USER':
        return this.usersService.create(
          createUserDto,
          new CreateUserStrategy(
            this.prismaService,
            this.emailService,
            this.configService,
          ),
        );
      case 'ORGANISATION':
        return this.usersService.create(
          createUserDto,
          new CreateOrganisationStrategy(
            this.prismaService,
            this.emailService,
            this.configService,
            this.eventEmitter,
          ),
        );
      default:
        throw new ForbiddenException();
    }
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async find(@Query() query: FindUserDto, @User() sessionUser: UserModel) {
    const users = await this.usersService.find(query, sessionUser);
    if (!users.data.length) {
      return users;
    }

    return {
      ...users,
      data: users.data.map((user) => ({
        id: user.id,
        profilePhoto: user.profilePhoto,
        userAttributes: {
          firstname: user.userAttributes?.firstname,
          lastname: user.userAttributes?.lastname,
          city: user.userAttributes?.city,
          type: user.userAttributes?.type,
          certificates: (user.userAttributes as any)?.certificates,
        },
        ...(sessionUser.role === Role.ADMIN && {
          email: user.email,
          active: user.active,
        }),
      })),
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() sessionUser: UserModel,
  ) {
    const user = await this.usersService.findOne(id);
    if (
      sessionUser.role === Role.ADMIN ||
      sessionUser.role === Role.ORGANISATION ||
      sessionUser.id === id
    ) {
      return user;
    }

    return {
      userAttributes: {
        firstname: user.userAttributes?.firstname,
        lastname: user.userAttributes?.lastname,
        city: user.userAttributes?.city,
        type: user.userAttributes?.type,
        certificates: user.userAttributes?.certificates,
      },
      id: user.id,
      profilePhoto: user.profilePhoto,
    };
  }

  @Patch(':id')
  @Serialize(UserResponseDto)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, IsMeGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: UserModel,
  ) {
    return this.usersService.update(+id, updateUserDto, user);
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
