import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventConditionDocument,
  EventConditionEntity,
} from '../schemas/event-condition.schema';
import { EventCondition } from '../domain/event-condition';

@Injectable()
export class EventConditionRepository {
  constructor(
    @InjectModel(EventConditionEntity.name)
    private readonly eventConditionModel: Model<EventConditionDocument>,
  ) {}

  async create(condition: EventCondition): Promise<EventCondition> {
    const createdCondition = await this.eventConditionModel.create(
      condition.toSchema(),
    );
    return createdCondition.toEventCondition();
  }

  async findAll(): Promise<EventCondition[]> {
    const conditions = await this.eventConditionModel.find().exec();
    return conditions.map((condition) => condition.toEventCondition());
  }

  async findById(id: string): Promise<EventCondition | null> {
    const condition = await this.eventConditionModel.findById(id).exec();
    return condition ? condition.toEventCondition() : null;
  }

  async findByEventId(eventId: string): Promise<EventCondition[]> {
    const conditions = await this.eventConditionModel.find({ eventId }).exec();
    return conditions.map((condition) => condition.toEventCondition());
  }

  async findByEventIdAndType(
    eventId: string,
    type: string,
  ): Promise<EventCondition | null> {
    const condition = await this.eventConditionModel
      .findOne({ eventId, type })
      .exec();
    return condition ? condition.toEventCondition() : null;
  }

  async update(
    id: string,
    condition: Partial<EventCondition>,
  ): Promise<EventCondition | null> {
    const updatedCondition = await this.eventConditionModel
      .findByIdAndUpdate(id, condition, { new: true })
      .exec();
    return updatedCondition ? updatedCondition.toEventCondition() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.eventConditionModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async deleteByEventId(eventId: string): Promise<number> {
    const result = await this.eventConditionModel
      .deleteMany({ eventId })
      .exec();
    return result.deletedCount || 0;
  }
}
