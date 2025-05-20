import { UserRole } from '../../../users/schemas/user.schema';
import { Auth } from '../../domain/auth';

export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
    uuid?: string;
    role: UserRole;
  };
  accessToken: string;

  constructor(params: {
    user: {
      id: string;
      email: string;
      name: string;
      uuid?: string;
      role: UserRole;
    };
    accessToken: string;
  }) {
    this.user = params.user;
    this.accessToken = params.accessToken;
  }

  static fromDomain(auth: Auth): AuthResponseDto {
    return new AuthResponseDto({
      user: {
        id: auth.userId,
        email: auth.email,
        name: auth.name,
        uuid: auth.uuid,
        role: auth.role,
      },
      accessToken: auth.accessToken,
    });
  }
}
