import { extname } from 'path';
import { createHash } from 'crypto';
import { Role } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';

import { FindUserDto } from './dto/find-user.dto';
import { S3Service } from '../service/s3.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../service/bcrypt.service';
import { ICreateStrategy } from './create-strategy/icreate.strategy';
import { UploadProfilePhotoResponse } from './dto/upload-avatar-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private s3Service: S3Service,
    public bcryptService: BcryptService,
  ) {}

  async create(createUserDto: CreateUserDto, strategy: ICreateStrategy) {
    const password = await this.bcryptService.hashPassword(
      createUserDto.password,
    );

    return strategy.create({ ...createUserDto, password });
  }

  async find(query: FindUserDto) {
    const skip =
      query.page && query.limit ? Number(query.page) * Number(query.limit) : 0;
    const take = query.limit ? Number(query.limit) : 10;
    const orderBy =
      query.sort && (query.dir === 'asc' || query.dir === 'desc')
        ? { [query.sort]: query.dir }
        : null;
    const [count, data] = await this.prismaService.$transaction([
      this.prismaService.user.count({ where: { role: 'USER', active: true } }),
      this.prismaService.user.findMany({
        skip,
        take,
        ...(orderBy && { orderBy }),
        where: { role: 'USER', active: true },
        include: { userAttributes: true },
      }),
    ]);

    return { data, meta: { skip, take, count } };
  }

  async findOne(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        userAttributes: true,
        organisationAttributes: true,
        id: true,
        role: true,
        email: true,
        active: true,
        profilePhotoKey: true,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    const { profilePhotoKey, ...restUser } = user;

    let profilePhoto = null;
    if (profilePhotoKey) {
      profilePhoto = await this.s3Service.get(profilePhotoKey);
    }

    return {
      ...restUser,
      profilePhoto,
    };
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) throw new NotFoundException();

    const userData = { active: updateUserDto.active };

    const userAttributesData = {
      firstname: updateUserDto.firstname,
      lastname: updateUserDto.lastname,
      city: updateUserDto.city,
      phone: updateUserDto.phone,
      type: updateUserDto.type,
    };

    const organisationAttributesData = {
      name: updateUserDto.name,
      street: updateUserDto.street,
      oib: updateUserDto.oib,
      city: updateUserDto.city,
    };

    return this.prismaService.user.update({
      where: { id },
      data: {
        ...userData,
        ...(user.role === Role.USER && {
          userAttributes: { update: { ...userAttributesData } },
        }),
        ...(user.role === Role.ORGANISATION && {
          organisationAttributes: { update: { ...organisationAttributesData } },
        }),
      },
      select: {
        userAttributes: true,
        organisationAttributes: true,
        id: true,
        email: true,
        active: true,
      },
    });
  }

  async remove(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        userAttributes: { select: { certificates: { select: { key: true } } } },
        email: true,
      },
    });
    if (user?.userAttributes?.certificates?.length) {
      const keys = user.userAttributes.certificates.map(({ key }) => key);
      await this.s3Service.deleteMany(keys);
    }

    return this.prismaService.user.delete({ where: { id } });
  }

  async uploadAvatar(
    id: number,
    file: Express.Multer.File,
  ): Promise<UploadProfilePhotoResponse> {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
      },
    });

    const fileExt = extname(file.originalname);
    const filename = createHash('md5').update(String(user.id)).digest('hex');
    const profilePhotoKey = `profile_pictures/${filename}${fileExt}`;

    await this.s3Service.upload(file.buffer, profilePhotoKey, {
      mimetype: file.mimetype,
    });

    await this.prismaService.user.update({
      where: { id },
      data: {
        profilePhotoKey,
      },
    });

    const profilePhoto = await this.s3Service.get(profilePhotoKey);

    return {
      profilePhoto,
    };
  }
}
