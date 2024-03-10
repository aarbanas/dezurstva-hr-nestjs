import { Injectable, NotFoundException } from '@nestjs/common';
import { FindUserDto } from '../dto/find-user.dto';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FindResponse } from '../../prisma/types';
import { UpdateUserDto } from '../dto/update-user.dto';

type UserAttributesFilter = {
  userAttributes: {
    [key: string]: { startsWith: string; mode: 'insensitive' };
  };
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

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
      ...(user.role !== Role.ADMIN && { role: Role.USER }),
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
    >
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

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException();
    }

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

  async remove(id: number): Promise<
    | (Pick<User, 'email'> & {
        userAttributes: { certificates: { key: string }[] } | null;
      })
    | null
  > {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        userAttributes: { select: { certificates: { select: { key: true } } } },
        email: true,
      },
    });
    await this.prismaService.user.delete({ where: { id } });

    return user;
  }

  async updateProfilePhoto(id: number, profilePhotoKey: string): Promise<void> {
    await this.prismaService.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
      },
    });

    await this.prismaService.user.update({
      where: { id },
      data: {
        profilePhotoKey,
      },
    });
  }
}
