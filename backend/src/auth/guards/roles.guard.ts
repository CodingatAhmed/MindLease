import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@mindlease/shared';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Define the shape of a Request that has been processed by our JwtStrategy
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    walletAddress: string;
    role: UserRole;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Explicitly type the request object to satisfy ESLint
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // Check if user exists and their role matches the requirements
    return user && requiredRoles.includes(user.role);
  }
}