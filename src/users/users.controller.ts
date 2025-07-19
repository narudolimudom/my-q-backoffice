import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RegisterUserDto } from './dto/register.dto';

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    @UsePipes(ValidationPipe)
    public createUser(
        @Body() registerUserDto: RegisterUserDto
    ) {
        return this.usersService.registerUser(registerUserDto)
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    public getUserProfile(@Request() req: any) {
        return this.usersService.getUserProfile(req.user.email)
    }

}
