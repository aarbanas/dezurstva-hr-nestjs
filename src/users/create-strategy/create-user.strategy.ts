/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { User, UserAttributes } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ICreateStrategy } from './icreate.strategy';

export class CreateUserStrategy implements ICreateStrategy {
  constructor(private prismaService: PrismaService) {}
  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'> | undefined> {
    const userAttributes: Omit<UserAttributes, 'id'> = {
      city: createUserDto.city,
      firstname: createUserDto.firstname!,
      lastname: createUserDto.lastname!,
      phone: createUserDto.phone!,
      type: createUserDto.type!,
    };
    return this.prismaService.$transaction(async (tx) => {
      // 1. Create user attributes
      const _userAttributes = await tx.userAttributes.create({
        data: userAttributes,
      });

      // 2. Create user
      return tx.user.create({
        data: {
          email: createUserDto.email,
          password: createUserDto.password,
          role: createUserDto.role,
          userAttributesId: _userAttributes.id,
          termsAndConditionsAccepted: createUserDto.termsAndConditions,
        },
      });
    });
  }
}
