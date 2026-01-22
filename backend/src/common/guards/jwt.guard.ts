import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('[JwtGuard] canActivate() called for route:', request.url);
    console.log('[JwtGuard] Authorization header:', authHeader ? 'PRESENT' : 'MISSING');

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const payload = this.jwtService.verify(token);
      // Set request.user with the same structure as JwtStrategy.validate()
      request.user = {
        userId: payload.sub,
        roles: payload.roles || [],
      };
      console.log('[JwtGuard] Token verified, userId:', request.user.userId);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}