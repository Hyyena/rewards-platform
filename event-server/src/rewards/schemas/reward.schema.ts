import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { RewardType, Reward } from '../domain/reward';

export type RewardDocument = HydratedDocument<RewardEntity>;

@Schema({
  timestamps: true,
  collection: 'rewards',
})
export class RewardEntity {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'EventEntity',
    index: true,
  })
  eventId: string;

  @Prop({ required: true, type: String, enum: RewardType, index: true })
  type: RewardType;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  description: string;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toReward(): Reward {
    return new Reward({
      id: this._id.toString(),
      eventId: this.eventId.toString(),
      type: this.type,
      amount: this.amount,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}

export const RewardSchema = SchemaFactory.createForClass(RewardEntity);
RewardSchema.methods.toReward = RewardEntity.prototype.toReward;
RewardSchema.index({ eventId: 1, type: 1 }, { unique: true });
