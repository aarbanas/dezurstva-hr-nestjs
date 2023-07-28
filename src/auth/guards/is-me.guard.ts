import { Observable } from 'rxjs';
import { Role } from '@prisma/client';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SessionUser } from '../passport-strategies/jwt.strategy';

export class IsMeGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: SessionUser = request.user;
    // Allow admins to see all data
    if (user.role === Role.ADMIN) return true;

    const { id } = request.params;

    return +id === user.id;
  }
}
