import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { ConditionType, EventCondition } from '../domain/event-condition';

export type EventConditionDocument = HydratedDocument<EventConditionEntity>;

@Schema({
  timestamps: true,
  collection: 'event_conditions',
})
export class EventConditionEntity {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'EventEntity',
    index: true,
  })
  eventId: string;

  @Prop({ required: true, type: String, enum: ConditionType, index: true })
  type: ConditionType;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 1 })
  requiredCount: number;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toEventCondition(): EventCondition {
    return new EventCondition({
      id: this._id.toString(),
      eventId: this.eventId.toString(),
      type: this.type,
      description: this.description,
      requiredCount: this.requiredCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}

export const EventConditionSchema =
  SchemaFactory.createForClass(EventConditionEntity);
EventConditionSchema.methods.toEventCondition =
  EventConditionEntity.prototype.toEventCondition;
EventConditionSchema.index({ eventId: 1, type: 1 }, { unique: true });
