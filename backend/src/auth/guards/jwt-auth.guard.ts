import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Ensure you are extending AuthGuard('jwt')
export class JwtAuthGuard extends AuthGuard('jwt') {}