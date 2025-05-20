import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EventStatus } from '../domain/event';
import { Event } from '../domain/event';

export type EventDocument = HydratedDocument<EventEntity>;

@Schema({
  timestamps: true,
  collection: 'events',
})
export class EventEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({
    type: String,
    enum: EventStatus,
    default: EventStatus.INACTIVE,
  })
  status: EventStatus;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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

export const EventSchema = SchemaFactory.createForClass(EventEntity);
EventSchema.methods.toEvent = EventEntity.prototype.toEvent;
EventSchema.index({ name: 1 }, { unique: true });
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ status: 1 });
