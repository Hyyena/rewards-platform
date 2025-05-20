import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  RewardRequest,
  RewardRequestStatus,
} from '../../domain/reward-request';

export class UpdateRewardRequestDto {
  @IsEnum(RewardRequestStatus)
  @IsOptional()
  status?: RewardRequestStatus;

  @IsDateString()
  @IsOptional()
  processedAt?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  toDomain(id: string, existingRequest?: RewardRequest): RewardRequest {
    return new RewardRequest({
      id,
      userId: existingRequest?.userId ?? '',
      eventId: existingRequest?.eventId ?? '',
      rewardId: existingRequest?.rewardId ?? '',
      status:
        this.status ?? existingRequest?.status ?? RewardRequestStatus.REQUESTED,
      requestedAt: existingRequest?.requestedAt ?? new Date(),
      processedAt: this.processedAt
        ? new Date(this.processedAt)
        : existingRequest?.processedAt,
      completedAt: this.completedAt
        ? new Date(this.completedAt)
        : existingRequest?.completedAt,
      rejectionReason: this.rejectionReason ?? existingRequest?.rejectionReason,
      requestIdempotencyKey: existingRequest?.requestIdempotencyKey ?? '',
    });
  }

  toPartialDomain(): Partial<RewardRequest> {
    const partialRequest: Partial<RewardRequest> = {};

    if (this.status !== undefined) partialRequest.status = this.status;
    if (this.processedAt !== undefined)
      partialRequest.processedAt = new Date(this.processedAt);
    if (this.completedAt !== undefined)
      partialRequest.completedAt = new Date(this.completedAt);
    if (this.rejectionReason !== undefined)
      partialRequest.rejectionReason = this.rejectionReason;

    return partialRequest;
  }
}
