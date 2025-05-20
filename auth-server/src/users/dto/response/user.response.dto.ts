import { UserRole } from '../../schemas/user.schema';
import { User } from '../../domain/user';

export class UserResponseDto {
  id: string;
  _id: string;
  email: string;
  name: string;
  uuid?: string;
  role: UserRole;
  isActive: boolean;

  constructor(params: {
    id: string;
    email: string;
    name: string;
    uuid?: string;
    role: UserRole;
    isActive: boolean;
  }) {
    this.id = params.id;
    this._id = params.id;
    this.email = params.email;
    this.name = params.name;
    this.uuid = params.uuid;
    this.role = params.role;
    this.isActive = params.isActive;
  }

  static fromDomain(user: User): UserResponseDto {
    if (!user.id) {
      throw new Error('User ID is required');
    }

    return new UserResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      uuid: user.uuid,
      role: user.role,
      isActive: user.isActive,
    });
  }
}
