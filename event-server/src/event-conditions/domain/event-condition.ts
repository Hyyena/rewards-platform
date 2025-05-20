export enum ConditionType {
  LOGIN_DAYS = 'LOGIN_DAYS',
  INVITE_FRIENDS = 'INVITE_FRIENDS',
  COMPLETE_PROFILE = 'COMPLETE_PROFILE',
  CUSTOM = 'CUSTOM',
}

export class EventCondition {
  id?: string;
  eventId: string;
  type: ConditionType;
  description: string;
  requiredCount: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(params: {
    id?: string;
    eventId: string;
    type: ConditionType;
    description: string;
    requiredCount: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.eventId = params.eventId;
    this.type = params.type;
    this.description = params.description;
    this.requiredCount = params.requiredCount;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toSchema(): Record<string, any> {
    const schema: Record<string, any> = {
      eventId: this.eventId,
      type: this.type,
      description: this.description,
      requiredCount: this.requiredCount,
    };

    if (this.id) {
      schema._id = this.id;
    }

    return schema;
  }
}
