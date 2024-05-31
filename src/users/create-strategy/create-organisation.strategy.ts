/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ICreateStrategy } from './icreate.strategy';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganisationAttributes, User } from '@prisma/client';

export class CreateOrganisationStrategy implements ICreateStrategy {
  constructor(private prismaService: PrismaService) {}
  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'> | undefined> {
    const organisationAttributes: Omit<OrganisationAttributes, 'id'> = {
      city: createUserDto.city,
      name: createUserDto.name!,
      oib: createUserDto.oib!,
      street: createUserDto.street!,
    };
    return this.prismaService.$transaction(async (tx) => {
      const _organisationAttributes = await tx.organisationAttributes.create({
        data: organisationAttributes,
      });

      return tx.user.create({
        data: {
          email: createUserDto.email,
          password: createUserDto.password,
          role: createUserDto.role,
          organisationAttributesId: _organisationAttributes.id,
          termsAndConditions: createUserDto.termsAndConditions,
        },
      });
    });
  }
}
