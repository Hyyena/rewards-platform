import { UserRole } from '../schemas/user.schema';

export class User {
  id?: string;
  email: string;
  password: string;
  name: string;
  uuid?: string;
  role: UserRole;
  isActive: boolean;

  constructor(params: {
    id?: string;
    email: string;
    password: string;
    name: string;
    uuid?: string;
    role?: UserRole;
    isActive?: boolean;
  }) {
    this.id = params.id;
    this.email = params.email;
    this.password = params.password;
    this.name = params.name;
    this.uuid = params.uuid;
    this.role = params.role || UserRole.USER;
    this.isActive = params.isActive !== undefined ? params.isActive : true;
  }

  toSchema(): Record<string, any> {
    const schema: Record<string, any> = {
      email: this.email,
      password: this.password,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
    };

    if (this.uuid) {
      schema.uuid = this.uuid;
    }

    return schema;
  }
}
