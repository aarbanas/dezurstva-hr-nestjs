import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SessionUser } from '../passport-strategies/jwt.strategy';
import { Role } from '@prisma/client';

export class AdminLoginGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.body.isAdmin) return true;

    const user: SessionUser = request.user;
    return user.role === Role.ADMIN;
  }
}
