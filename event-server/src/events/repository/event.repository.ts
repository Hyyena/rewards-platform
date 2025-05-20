import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventDocument } from '../schemas/event.schema';
import { Event } from '../domain/event';

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(EventDocument.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async create(event: Event): Promise<Event> {
    const createdEvent = await this.eventModel.create(event.toSchema());
    return createdEvent.toEvent();
  }

  async findAll(): Promise<Event[]> {
    const events = await this.eventModel.find().exec();
    return events.map((event) => event.toEvent());
  }

  async findById(id: string): Promise<Event | null> {
    const event = await this.eventModel.findById(id).exec();
    return event ? event.toEvent() : null;
  }

  async findByName(name: string): Promise<Event | null> {
    const event = await this.eventModel.findOne({ name }).exec();
    return event ? event.toEvent() : null;
  }

  async findActive(): Promise<Event[]> {
    const events = await this.eventModel
      .find({
        status: 'ACTIVE',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      })
      .exec();
    return events.map((event) => event.toEvent());
  }

  async update(id: string, event: Partial<Event>): Promise<Event | null> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, event, { new: true })
      .exec();
    return updatedEvent ? updatedEvent.toEvent() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
