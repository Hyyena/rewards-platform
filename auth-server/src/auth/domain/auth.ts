import { UserRole } from '../../users/schemas/user.schema';

export class Auth {
  userId: string;
  email: string;
  name: string;
  uuid?: string;
  role: UserRole;
  accessToken: string;

  constructor(params: {
    userId: string;
    email: string;
    name: string;
    uuid?: string;
    role: UserRole;
    accessToken: string;
  }) {
    this.userId = params.userId;
    this.email = params.email;
    this.name = params.name;
    this.uuid = params.uuid;
    this.role = params.role;
    this.accessToken = params.accessToken;
  }
}
