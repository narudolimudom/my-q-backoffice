import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/user.interface';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
        const request = ctx.switchToHttp().getRequest();
        console.log("aaa =>", request.user)
        return request.user;
    });