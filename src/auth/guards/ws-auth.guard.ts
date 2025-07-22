import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { Socket } from 'socket.io';

interface JwtPayload {
  email: string;
  sub: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const wsContext = context.switchToWs();
    const client = wsContext.getClient<Socket & { user?: unknown }>();
    const handshake = client.handshake;

    const authHeader = handshake?.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: JwtPayload;

    try {
      decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      } as JwtVerifyOptions);
    } catch (error) {
      console.error('JWT verification error:', error);
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.getUserProfile(decoded.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    client.user = user;

    return true;
  }
}
