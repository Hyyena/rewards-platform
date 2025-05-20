import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EventStatus } from '../domain/event';
import { Event } from '../domain/event';

@Schema({
  timestamps: true,
  collection: 'events',
})
export class EventDocument extends Document {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Date, index: true })
  startDate: Date;

  @Prop({ required: true, type: Date, index: true })
  endDate: Date;

  @Prop({
    type: String,
    enum: EventStatus,
    default: EventStatus.INACTIVE,
    index: true,
  })
  status: EventStatus;

  toEvent(): Event {
    return new Event({
      id: this._id.toString(),
      name: this.name,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}

export const EventSchema = SchemaFactory.createForClass(EventDocument);

EventSchema.index({ name: 1 }, { unique: true });
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ status: 1 });
