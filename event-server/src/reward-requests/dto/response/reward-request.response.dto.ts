import {
  RewardRequest,
  RewardRequestStatus,
} from '../../domain/reward-request';

export class RewardRequestResponseDto {
  id: string;
  userId: string;
  eventId: string;
  rewardId: string;
  status: RewardRequestStatus;
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  rejectionReason?: string;
  requestIdempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    userId: string;
    eventId: string;
    rewardId: string;
    status: RewardRequestStatus;
    requestedAt: Date;
    processedAt?: Date;
    completedAt?: Date;
    rejectionReason?: string;
    requestIdempotencyKey: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.eventId = params.eventId;
    this.rewardId = params.rewardId;
    this.status = params.status;
    this.requestedAt = params.requestedAt;
    this.processedAt = params.processedAt;
    this.completedAt = params.completedAt;
    this.rejectionReason = params.rejectionReason;
    this.requestIdempotencyKey = params.requestIdempotencyKey;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static fromDomain(rewardRequest: RewardRequest): RewardRequestResponseDto {
    if (!rewardRequest.id) {
      throw new Error('RewardRequest ID is required');
    }

    return new RewardRequestResponseDto({
      id: rewardRequest.id,
      userId: rewardRequest.userId,
      eventId: rewardRequest.eventId,
      rewardId: rewardRequest.rewardId,
      status: rewardRequest.status,
      requestedAt: rewardRequest.requestedAt,
      processedAt: rewardRequest.processedAt,
      completedAt: rewardRequest.completedAt,
      rejectionReason: rewardRequest.rejectionReason,
      requestIdempotencyKey: rewardRequest.requestIdempotencyKey,
      createdAt: rewardRequest.createdAt || new Date(),
      updatedAt: rewardRequest.updatedAt || new Date(),
    });
  }
}
