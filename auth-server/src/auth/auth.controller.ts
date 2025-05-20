import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/request/loginRequest.dto';
import { CreateUserRequestDto } from '../users/dto/request/create-user.request.dto';
import { AuthResponseDto } from './dto/response/auth.response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserRequestDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any): any {
    return req.user;
  }

  @Post('validate')
  validateToken(@Body('token') token: string): any {
    return this.authService.validateToken(token);
  }
}
