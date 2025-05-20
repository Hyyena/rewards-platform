import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/service/users.service';
import { LoginRequestDto } from './dto/request/loginRequest.dto';
import { CreateUserRequestDto } from '../users/dto/request/create-user.request.dto';
import { Auth } from './domain/auth';
import { AuthResponseDto } from './dto/response/auth.response.dto';
import { UserResponseDto } from '../users/dto/response/user.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(
    createUserDto: CreateUserRequestDto,
  ): Promise<AuthResponseDto> {
    const userResponse: UserResponseDto =
      await this.usersService.create(createUserDto);

    const payload = { sub: userResponse.id, email: userResponse.email };
    const accessToken = this.jwtService.sign(payload);

    const auth = new Auth({
      userId: userResponse.id,
      email: userResponse.email,
      name: userResponse.name,
      uuid: userResponse.uuid,
      role: userResponse.role,
      accessToken,
    });

    return AuthResponseDto.fromDomain(auth);
  }

  async login(loginDto: LoginRequestDto): Promise<AuthResponseDto> {
    try {
      const rawUser = await this.usersService.getRawUserByEmail(loginDto.email);

      const isPasswordValid = await rawUser.comparePassword(loginDto.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!rawUser.isActive) {
        throw new UnauthorizedException('User is inactive');
      }

      const payload = { sub: rawUser._id, email: rawUser.email };
      const accessToken = this.jwtService.sign(payload);

      const auth = new Auth({
        userId: rawUser._id.toString(),
        email: rawUser.email,
        name: rawUser.name,
        uuid: rawUser.uuid,
        role: rawUser.role,
        accessToken,
      });

      return AuthResponseDto.fromDomain(auth);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  validateToken(token: string): any {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
