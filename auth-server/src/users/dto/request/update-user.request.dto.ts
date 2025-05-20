import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../schemas/user.schema';
import { User } from '../../domain/user';

export class UpdateUserRequestDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsOptional()
  isActive?: boolean;

  toDomain(id: string, existingUser?: User): User {
    return new User({
      id,
      email: this.email ?? existingUser?.email ?? '',
      password: this.password ?? existingUser?.password ?? '',
      name: this.name ?? existingUser?.name ?? '',
      role: this.role ?? existingUser?.role ?? UserRole.USER,
      isActive:
        this.isActive !== undefined
          ? this.isActive
          : (existingUser?.isActive ?? true),
    });
  }

  toPartialDomain(): Partial<User> {
    const partialUser: Partial<User> = {};

    if (this.email !== undefined) partialUser.email = this.email;
    if (this.password !== undefined) partialUser.password = this.password;
    if (this.name !== undefined) partialUser.name = this.name;
    if (this.role !== undefined) partialUser.role = this.role;
    if (this.isActive !== undefined) partialUser.isActive = this.isActive;

    return partialUser;
  }
}
