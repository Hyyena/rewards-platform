export enum RewardType {
  POINTS = 'POINTS',
  ITEM = 'ITEM',
  BADGE = 'BADGE',
  COUPON = 'COUPON',
}

export class Reward {
  id?: string;
  eventId: string;
  type: RewardType;
  amount: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(params: {
    id?: string;
    eventId: string;
    type: RewardType;
    amount: number;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.eventId = params.eventId;
    this.type = params.type;
    this.amount = params.amount;
    this.description = params.description;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toSchema(): Record<string, any> {
    const schema: Record<string, any> = {
      eventId: this.eventId,
      type: this.type,
      amount: this.amount,
      description: this.description,
    };

    if (this.id) {
      schema._id = this.id;
    }

    return schema;
  }
}
