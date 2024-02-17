import { Injectable, NotFoundException } from '@nestjs/common';
import { FindUserDto } from '../dto/find-user.dto';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FindResponse } from '../../prisma/types';
import { S3Service } from '../../service/s3.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UploadProfilePhotoResponse } from '../dto/upload-avatar-response.dto';
import { extname } from 'path';
import { createHash } from 'crypto';

type UserAttributesFilter = {
  userAttributes: {
    [key: string]: { startsWith: string; mode: 'insensitive' };
  };
};

@Injectable()
export class UsersRepository {
  constructor(
    private s3Service: S3Service,
    private prismaService: PrismaService,
  ) {}

  private prepareFindQuery(query: FindUserDto, user: User) {
    const take = query.limit ? Number(query.limit) : 10;
    const skip = query.page ? Number(query.page) * take : 0;
    const orderBy =
      query.sort && (query.dir === 'asc' || query.dir === 'desc')
        ? { [query.sort]: query.dir }
        : null;
    const filter = query.filter
      ? Object.entries(query.filter).reduce<UserAttributesFilter>(
          (filterObject: UserAttributesFilter, [key, value]) => {
            filterObject.userAttributes[key] = {
              startsWith: value,
              mode: 'insensitive',
            };
            return filterObject;
          },
          { userAttributes: {} },
        )
      : null;
    const where = {
      role: Role.USER,
      ...(user.role !== Role.ADMIN && { active: true }),
      ...(filter && { ...filter }),
    };

    return { take, skip, orderBy, where };
  }
  async find(query: FindUserDto, user: User): Promise<FindResponse<User>> {
    const { take, skip, where, orderBy } = this.prepareFindQuery(query, user);

    const [count, data] = await this.prismaService.$transaction([
      this.prismaService.user.count({
        where,
      }),

      this.prismaService.user.findMany({
        skip,
        take,
        where,
        include: { userAttributes: true },
        ...(orderBy && { orderBy }),
      }),
    ]);

    return { data, meta: { skip, take, count } };
  }

  async findOne(
    id: number,
  ): Promise<
    Omit<
      User,
      | 'password'
      | 'createdAt'
      | 'updatedAt'
      | 'userAttributesId'
      | 'organisationAttributesId'
      | 'profilePhotoKey'
    > & { profilePhoto: string }
  > {
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

    let profilePhoto = '';
    if (profilePhotoKey) {
      profilePhoto = await this.s3Service.get(profilePhotoKey);
    }

    return {
      ...restUser,
      profilePhoto,
    };
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

  async uploadProfilePhoto(
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
    const profilePhotoKey = `profile_photos/${filename}${fileExt}`;

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
