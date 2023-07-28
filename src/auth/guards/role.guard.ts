import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { SessionUser } from '../passport-strategies/jwt.strategy';

const RoleGuard = (roles: Role[]): Type<any> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const user: SessionUser = request.user;

      return roles.includes(user.role);
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
