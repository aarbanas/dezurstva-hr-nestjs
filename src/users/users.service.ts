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
import { S3Service } from '../service/s3.service';
import { extname } from 'path';
import { createHash } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
    private readonly usersRepository: UsersRepository,
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
    const user = await this.usersRepository.findOne(id);
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

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    const certificates = await this.usersRepository.remove(id);

    if (certificates?.length) {
      const keys = certificates.map(({ key }) => key);
      await this.s3Service.deleteMany(keys);
    }
  }

  async uploadProfilePhoto(
    id: number,
    file: Express.Multer.File,
  ): Promise<UploadProfilePhotoResponse> {
    const fileExt = extname(file.originalname);
    const filename = createHash('md5').update(String(id)).digest('hex');
    const profilePhotoKey = `profile_photos/${filename}${fileExt}`;

    await this.usersRepository.uploadProfilePhoto(id, profilePhotoKey);

    await this.s3Service.upload(file.buffer, profilePhotoKey, {
      mimetype: file.mimetype,
    });

    const profilePhoto = await this.s3Service.get(profilePhotoKey);
    return {
      profilePhoto,
    };
  }
}
