import { ConditionType, EventCondition } from '../../domain/event-condition';

export class EventConditionResponseDto {
  id: string;
  eventId: string;
  type: ConditionType;
  description: string;
  requiredCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    eventId: string;
    type: ConditionType;
    description: string;
    requiredCount: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.eventId = params.eventId;
    this.type = params.type;
    this.description = params.description;
    this.requiredCount = params.requiredCount;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static fromDomain(condition: EventCondition): EventConditionResponseDto {
    if (!condition.id) {
      throw new Error('EventCondition ID is required');
    }

    return new EventConditionResponseDto({
      id: condition.id,
      eventId: condition.eventId,
      type: condition.type,
      description: condition.description,
      requiredCount: condition.requiredCount,
      createdAt: condition.createdAt || new Date(),
      updatedAt: condition.updatedAt || new Date(),
    });
  }
}
