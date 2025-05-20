import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RewardType, Reward } from '../domain/reward';

@Schema({
  timestamps: true,
  collection: 'rewards',
})
export class RewardDocument extends Document {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'EventDocument',
    index: true,
  })
  eventId: string;

  @Prop({ required: true, type: String, enum: RewardType, index: true })
  type: RewardType;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  description: string;

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

export const RewardSchema = SchemaFactory.createForClass(RewardDocument);

RewardSchema.index({ eventId: 1, type: 1 }, { unique: true });
