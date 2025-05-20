import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { RewardRequestStatus, RewardRequest } from '../domain/reward-request';

export type RewardRequestDocument = HydratedDocument<RewardRequestEntity>;

@Schema({
  timestamps: true,
  collection: 'reward_requests',
})
export class RewardRequestEntity {
  @Prop({ required: true })
  userId: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'EventEntity',
  })
  eventId: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'RewardEntity',
  })
  rewardId: string;

  @Prop({
    type: String,
    enum: RewardRequestStatus,
    default: RewardRequestStatus.REQUESTED,
  })
  status: RewardRequestStatus;

  @Prop({ required: true, type: Date, default: Date.now })
  requestedAt: Date;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ required: true, unique: true })
  requestIdempotencyKey: string;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toRewardRequest(): RewardRequest {
    return new RewardRequest({
      id: this._id.toString(),
      userId: this.userId,
      eventId: this.eventId.toString(),
      rewardId: this.rewardId.toString(),
      status: this.status,
      requestedAt: this.requestedAt,
      processedAt: this.processedAt,
      completedAt: this.completedAt,
      rejectionReason: this.rejectionReason,
      requestIdempotencyKey: this.requestIdempotencyKey,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}

export const RewardRequestSchema =
  SchemaFactory.createForClass(RewardRequestEntity);
RewardRequestSchema.methods.toRewardRequest =
  RewardRequestEntity.prototype.toRewardRequest;
RewardRequestSchema.index({ userId: 1, eventId: 1 });
RewardRequestSchema.index({ userId: 1, rewardId: 1 });
RewardRequestSchema.index({ status: 1 });
