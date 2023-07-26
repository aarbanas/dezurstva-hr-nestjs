import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async authenticate(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.userService.findByEmail(email);
    if (!user) return undefined;

    const validate = await this.userService.bcryptService.validatePassword(
      password,
      user.password,
    );
    if (!validate) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pwd, ...rest } = user;
    return rest;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { username: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
