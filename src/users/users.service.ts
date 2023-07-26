import { Injectable } from '@nestjs/common';
import { FindUserDto } from './dto/find-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../service/bcrypt.service';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    public bcryptService: BcryptService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const password = await this.bcryptService.hashPassword(
      createUserDto.password,
    );
    return this.prismaService.user.create({
      data: { ...createUserDto, role: 'USER', password },
    });
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
      }),
    ]);

    return { data, meta: { skip, take, count } };
  }

  findOne(id: number) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id },
      data: { ...updateUserDto },
    });
  }

  remove(id: number) {
    return this.prismaService.user.delete({ where: { id } });
  }
}
