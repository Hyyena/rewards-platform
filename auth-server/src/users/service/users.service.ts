import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../schemas/user.schema';
import { UserRepository } from '../repository/user.repository';
import { CreateUserRequestDto } from '../dto/request/create-user.request.dto';
import { UpdateUserRequestDto } from '../dto/request/update-user.request.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { User } from '../domain/user';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserRequestDto): Promise<UserResponseDto> {
    try {
      const existingUser = await this.userRepository.findByEmail(
        createUserDto.email,
      );

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const user = createUserDto.toDomain();
      const createdUser = await this.userRepository.create(user);

      return UserResponseDto.fromDomain(createdUser);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => UserResponseDto.fromDomain(user));
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return UserResponseDto.fromDomain(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async getRawUserByEmail(email: string): Promise<any> {
    const user = await this.userRepository.getRawUserByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const partialUser = updateUserDto.toPartialDomain();
    const updatedUser = await this.userRepository.update(id, partialUser);

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return UserResponseDto.fromDomain(updatedUser);
  }

  async updateRole(id: string, role: UserRole): Promise<UserResponseDto> {
    const updatedUser = await this.userRepository.updateRole(id, role);

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return UserResponseDto.fromDomain(updatedUser);
  }

  async remove(id: string): Promise<UserResponseDto> {
    const deletedUser = await this.userRepository.remove(id);

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return UserResponseDto.fromDomain(deletedUser);
  }
}
