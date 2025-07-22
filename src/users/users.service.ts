import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  public async registerUser(registerUserRequest: RegisterUserDto) {
    try {
      const { password } = registerUserRequest;
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltOrRounds);
      return await this.prismaService.user.create({
        data: {
          ...registerUserRequest,
          password: hashedPassword,
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Register user error:', err.message);
      } else {
        console.error('Unknown error during registration:', err);
      }
      throw err;
    }
  }

  public async getUserDetailByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  public async getUserProfile(email: string) {
    const response = await this.getUserDetailByEmail(email);
    return {
      id: response?.id,
      email: response?.email,
      name: response?.name,
    };
  }
}
