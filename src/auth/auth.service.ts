import { Role, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BcryptService } from '../service/bcrypt.service';

type TokenPayloadType = {
  username: string;
  sub: number;
  role: Role;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
  ) {}

  async authenticate(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.userService.findByEmail(email);
    if (!user?.active) return undefined;

    const validate = await this.bcryptService.validatePassword(
      password,
      user.password,
    );
    if (!validate) return undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pwd, ...rest } = user;
    return rest;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = {
      username: user.email,
      sub: user.id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const decodedToken = this.jwtService.decode(
      accessToken,
    ) as TokenPayloadType;

    return {
      accessToken,
      expiredAt: decodedToken.exp * 1000,
    };
  }
}
