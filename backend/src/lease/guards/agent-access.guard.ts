import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { LeaseService } from '../lease.service';
import { RequestWithUser } from '../../auth/auth.controller';

@Injectable()
export class AgentAccessGuard implements CanActivate {
  constructor(private readonly leaseService: LeaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    
    // Safely access user and agentId with fallback to undefined
    const user = request.user;
    const params = request.params as Record<string, string | undefined>;
    const body = request.body as Record<string, string | undefined>;
    
    const agentId = params.agentId || body.agentId;

    if (!user || !agentId) {
      throw new ForbiddenException('User or Agent identity missing');
    }

    const isAuthorized = await this.leaseService.hasActiveLease(user.userId, agentId);

    if (!isAuthorized) {
      throw new ForbiddenException('You do not have an active lease for this agent');
    }

    return true;
  }
}