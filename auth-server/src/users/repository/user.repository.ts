import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User as UserSchema, UserRole } from '../schemas/user.schema';
import { User } from '../domain/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserSchema.name) private readonly userModel: Model<UserSchema>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const userSchema = await this.userModel.findOne({ email }).exec();
    return userSchema ? new User(userSchema.toUser()) : null;
  }

  async findById(id: string): Promise<User | null> {
    const userSchema = await this.userModel.findById(id).exec();
    return userSchema ? new User(userSchema.toUser()) : null;
  }

  async findAll(): Promise<User[]> {
    const userSchemas = await this.userModel.find().exec();
    return userSchemas.map((userSchema) => new User(userSchema.toUser()));
  }

  async create(user: User): Promise<User> {
    const createdUser = new this.userModel(user.toSchema());
    const savedUser = await createdUser.save();
    return new User(savedUser.toUser());
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, user.toSchema ? user.toSchema() : user, {
        new: true,
      })
      .exec();

    return updatedUser ? new User(updatedUser.toUser()) : null;
  }

  async updateRole(id: string, role: UserRole): Promise<User | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .exec();

    return updatedUser ? new User(updatedUser.toUser()) : null;
  }

  async remove(id: string): Promise<User | null> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    return deletedUser ? new User(deletedUser.toUser()) : null;
  }

  async comparePassword(user: UserSchema, password: string): Promise<boolean> {
    return await user.comparePassword(password);
  }

  async getRawUserByEmail(email: string): Promise<UserSchema | null> {
    return await this.userModel.findOne({ email }).exec();
  }
}
