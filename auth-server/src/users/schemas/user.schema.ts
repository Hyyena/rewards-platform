import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  USER = 'USER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  ADMIN = 'ADMIN',
}

export type UserDocument = HydratedDocument<UserEntity>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
  },
})
export class UserEntity {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: uuidv4 })
  uuid: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  toUser() {
    return {
      id: this._id ? this._id.toString() : undefined,
      email: this.email,
      password: this.password,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
      uuid: this.uuid,
    };
  }
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);

UserSchema.methods.comparePassword = UserEntity.prototype.comparePassword;
UserSchema.methods.toUser = UserEntity.prototype.toUser;
UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});
