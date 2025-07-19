import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { IUserDetailResponse } from 'src/users/dto/interface';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService) { }

    async validateUser(email: string, password: string): Promise<IUserDetailResponse> {
        const user = await this.usersService.getUserDetailByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            throw new UnauthorizedException();
        }
        const { password: _, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
