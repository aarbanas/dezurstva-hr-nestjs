import { User } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { FindUserDto } from './dto/find-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../service/bcrypt.service';
import { ICreateStrategy } from './create-strategy/icreate.strategy';
import { UploadProfilePhotoResponse } from './dto/upload-avatar-response.dto';
import { UsersRepository } from './repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private usersRepository: UsersRepository,
    public bcryptService: BcryptService,
  ) {}

  async create(createUserDto: CreateUserDto, strategy: ICreateStrategy) {
    const password = await this.bcryptService.hashPassword(
      createUserDto.password,
    );

    return strategy.create({ ...createUserDto, password });
  }

  async find(query: FindUserDto, user: User) {
    return this.usersRepository.find(query, user);
  }

  async findOne(id: number) {
    return this.usersRepository.findOne(id);
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    return this.usersRepository.remove(id);
  }

  async uploadProfilePhoto(
    id: number,
    file: Express.Multer.File,
  ): Promise<UploadProfilePhotoResponse> {
    return this.usersRepository.uploadProfilePhoto(id, file);
  }
}
