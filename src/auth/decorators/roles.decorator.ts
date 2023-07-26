import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLE_KEY = 'roles';
export const HasRole = (role: Role) => SetMetadata(ROLE_KEY, role);
