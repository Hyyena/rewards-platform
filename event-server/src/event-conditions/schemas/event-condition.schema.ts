import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ConditionType, EventCondition } from '../domain/event-condition';

@Schema({
  timestamps: true,
  collection: 'event_conditions',
})
export class EventConditionDocument extends Document {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'EventDocument',
    index: true,
  })
  eventId: string;

  @Prop({ required: true, type: String, enum: ConditionType, index: true })
  type: ConditionType;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 1 })
  requiredCount: number;

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

export const EventConditionSchema = SchemaFactory.createForClass(
  EventConditionDocument,
);

EventConditionSchema.index({ eventId: 1, type: 1 }, { unique: true });
