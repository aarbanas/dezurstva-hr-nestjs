import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '@prisma/client';

export interface ICreateStrategy {
  create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'> | undefined>;
}
