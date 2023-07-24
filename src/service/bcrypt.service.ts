import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService {
  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return bcrypt.hash(password, saltOrRounds);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
