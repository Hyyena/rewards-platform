import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/service/users.service';
import { LoginRequestDto } from './dto/request/loginRequest.dto';
import { CreateUserRequestDto } from '../users/dto/request/create-user.request.dto';
import { UserResponseDto } from '../users/dto/response/user.response.dto';
import { UserRole } from '../users/schemas/user.schema';
import { AuthResponseDto } from './dto/response/auth.response.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUsersService = {
    create: jest.fn(),
    getRawUserByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return auth response with token', async () => {
      // Arrange
      const createUserDto: CreateUserRequestDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.USER,
        toDomain: jest.fn(),
      };

      const userResponse: UserResponseDto = {
        id: 'user-id',
        _id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        uuid: 'user-uuid',
        role: UserRole.USER,
        isActive: true,
      };

      const token = 'jwt-token';
      mockUsersService.create.mockResolvedValue(userResponse);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      const result = await service.register(createUserDto);

      // Assert
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: userResponse.id,
        email: userResponse.email,
      });
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe(token);
      expect(result.user.id).toBe(userResponse.id);
      expect(result.user.email).toBe(userResponse.email);
      expect(result.user.name).toBe(userResponse.name);
      expect(result.user.uuid).toBe(userResponse.uuid);
      expect(result.user.role).toBe(userResponse.role);
    });
  });

  describe('login', () => {
    it('should authenticate user and return auth response with token', async () => {
      // Arrange
      const loginDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const rawUser = {
        _id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        uuid: 'user-uuid',
        role: UserRole.USER,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      const token = 'jwt-token';
      mockUsersService.getRawUserByEmail.mockResolvedValue(rawUser);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(mockUsersService.getRawUserByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(rawUser.comparePassword).toHaveBeenCalledWith(loginDto.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: rawUser._id,
        email: rawUser.email,
      });
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe(token);
      expect(result.user.id).toBe(rawUser._id.toString());
      expect(result.user.email).toBe(rawUser.email);
      expect(result.user.name).toBe(rawUser.name);
      expect(result.user.uuid).toBe(rawUser.uuid);
      expect(result.user.role).toBe(rawUser.role);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      const loginDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const rawUser = {
        _id: 'user-id',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockUsersService.getRawUserByEmail.mockResolvedValue(rawUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.getRawUserByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(rawUser.comparePassword).toHaveBeenCalledWith(loginDto.password);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      // Arrange
      const loginDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const rawUser = {
        _id: 'user-id',
        email: 'test@example.com',
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockUsersService.getRawUserByEmail.mockResolvedValue(rawUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.getRawUserByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(rawUser.comparePassword).toHaveBeenCalledWith(loginDto.password);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      // Arrange
      const loginDto: LoginRequestDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUsersService.getRawUserByEmail.mockRejectedValue(
        new Error('User not found'),
      );

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.getRawUserByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
    });
  });

  describe('validateToken', () => {
    it('should validate token and return payload', () => {
      // Arrange
      const token = 'valid-token';
      const payload = { sub: 'user-id', email: 'test@example.com' };
      const secret = 'jwt-secret';

      mockJwtService.verify.mockReturnValue(payload);
      mockConfigService.get.mockReturnValue(secret);

      // Act
      const result = service.validateToken(token);

      // Assert
      expect(mockJwtService.verify).toHaveBeenCalledWith(token, { secret });
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException if token is invalid', () => {
      // Arrange
      const token = 'invalid-token';
      const secret = 'jwt-secret';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      mockConfigService.get.mockReturnValue(secret);

      // Act & Assert
      expect(() => service.validateToken(token)).toThrow(UnauthorizedException);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token, { secret });
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });
});
