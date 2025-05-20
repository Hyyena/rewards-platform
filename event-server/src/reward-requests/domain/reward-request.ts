export enum RewardRequestStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export class RewardRequest {
  id?: string;
  userId: string;
  eventId: string;
  rewardId: string;
  status: RewardRequestStatus;
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  rejectionReason?: string;
  requestIdempotencyKey: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(params: {
    id?: string;
    userId: string;
    eventId: string;
    rewardId: string;
    status?: RewardRequestStatus;
    requestedAt?: Date;
    processedAt?: Date;
    completedAt?: Date;
    rejectionReason?: string;
    requestIdempotencyKey: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.eventId = params.eventId;
    this.rewardId = params.rewardId;
    this.status = params.status || RewardRequestStatus.REQUESTED;
    this.requestedAt = params.requestedAt || new Date();
    this.processedAt = params.processedAt;
    this.completedAt = params.completedAt;
    this.rejectionReason = params.rejectionReason;
    this.requestIdempotencyKey = params.requestIdempotencyKey;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toSchema(): Record<string, any> {
    const schema: Record<string, any> = {
      userId: this.userId,
      eventId: this.eventId,
      rewardId: this.rewardId,
      status: this.status,
      requestedAt: this.requestedAt,
      requestIdempotencyKey: this.requestIdempotencyKey,
    };

    if (this.id) {
      schema._id = this.id;
    }

    if (this.processedAt) {
      schema.processedAt = this.processedAt;
    }

    if (this.completedAt) {
      schema.completedAt = this.completedAt;
    }

    if (this.rejectionReason) {
      schema.rejectionReason = this.rejectionReason;
    }

    return schema;
  }
}
