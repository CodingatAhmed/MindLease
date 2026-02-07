import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@mindlease/shared';

// The key 'roles' must match what we look for in the RolesGuard
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);