import { RewardType, Reward } from '../../domain/reward';

export class RewardResponseDto {
  id: string;
  eventId: string;
  type: RewardType;
  amount: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    eventId: string;
    type: RewardType;
    amount: number;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.eventId = params.eventId;
    this.type = params.type;
    this.amount = params.amount;
    this.description = params.description;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static fromDomain(reward: Reward): RewardResponseDto {
    if (!reward.id) {
      throw new Error('Reward ID is required');
    }

    return new RewardResponseDto({
      id: reward.id,
      eventId: reward.eventId,
      type: reward.type,
      amount: reward.amount,
      description: reward.description,
      createdAt: reward.createdAt || new Date(),
      updatedAt: reward.updatedAt || new Date(),
    });
  }
}
