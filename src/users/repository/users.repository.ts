import { Injectable, NotFoundException } from '@nestjs/common';
import { FindUserDto } from '../dto/find-user.dto';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FindResponse } from '../../prisma/types';
import { UpdateUserDto } from '../dto/update-user.dto';

type UserAttribute = {
  [key: string]: { startsWith: string; mode: string };
};

type UserAttributesFilter = {
  userAttributes?: {
    [key: string]: { startsWith: string; mode: string };
  };
};

type UserFilter = UserAttribute & UserAttributesFilter;

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private prepareOrderBy(sort: string, dir: string) {
    if (!sort || !(dir === 'asc' || dir === 'desc')) return null;

    if (!sort.includes('.')) return { [sort]: dir };

    const keys = sort.split('.');
    return keys.reduceRight((acc, current, currentIndex) => {
      if (currentIndex + 1 < keys.length) return { [current]: acc };
      return { [current]: dir };
    }, {});
  }

  private prepareFilter(filter: object) {
    if (!filter) return null;

    const filterObject = Object.entries(filter).reduce<
      UserFilter | UserFilter[]
    >(
      (filterObject, [key, value]) => {
        const filterValue = {
          startsWith: value,
          mode: 'insensitive',
        };

        // Check if we are not searching by userAttributes or any other nested object
        if (!key.includes('.')) {
          // Check if we are searching by multiple keys
          if (Array.isArray(filterObject)) {
            filterObject.push({ [key]: filterValue } as UserAttribute);
          } else {
            filterObject[key] = filterValue;
          }
        } else {
          const attributeKey = key.split('.')[1];
          // Check if we are searching by multiple keys
          if (Array.isArray(filterObject)) {
            filterObject.push({
              userAttributes: { [attributeKey]: filterValue },
            } as any);
          } else {
            filterObject.userAttributes = { [attributeKey]: filterValue };
          }
        }

        return filterObject;
      },
      Object.entries(filter).length === 1 ? {} : [],
    );

    return Array.isArray(filterObject) ? { OR: filterObject } : filterObject;
  }

  private prepareUserRoleFilter(user: User, type?: Omit<Role, 'ADMIN'>) {
    switch (user.role) {
      case Role.ADMIN:
        if (type === Role.ORGANISATION) return { role: Role.ORGANISATION };

        return {
          OR: [{ role: Role.USER }, { role: Role.ADMIN }],
        };
      default:
        return { role: Role.USER };
    }
  }

  private prepareFindQuery(query: FindUserDto, user: User) {
    const take = query.limit ? Number(query.limit) : 10;
    const skip = query.page ? Number(query.page) * take : 0;
    const orderBy = this.prepareOrderBy(query.sort, query.dir);
    const filter = this.prepareFilter(query.filter);
    const where = {
      ...this.prepareUserRoleFilter(user, query.type),
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
        include: {
          userAttributes: query.type === Role.USER,
          organisationAttributes: query.type === Role.ORGANISATION,
        },
        ...(orderBy && { orderBy }),
      }),
    ]);

    return { data, meta: { skip, take, count } };
  }

  async findOne(
    id: number,
  ): Promise<
    Omit<User, 'password' | 'userAttributesId' | 'organisationAttributesId'>
  > {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        userAttributes: {
          include: {
            certificates: true,
          },
        },
        organisationAttributes: true,
        id: true,
        role: true,
        email: true,
        active: true,
        profilePhotoKey: true,
        createdAt: true,
        updatedAt: true,
        termsAndConditions: true,
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
