import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '../common/public.decorator';
import { readToken } from '../common/read-token';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest();
    const token = readToken(request);
    if (!token) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED' });
    }
    try {
      request.user = this.auth.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED' });
    }
  }
}
