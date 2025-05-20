import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import {
  RewardRequest,
  RewardRequestStatus,
} from '../../domain/reward-request';

export class CreateRewardRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  eventId: string;

  @IsMongoId()
  @IsNotEmpty()
  rewardId: string;

  @IsString()
  @IsNotEmpty()
  requestIdempotencyKey: string;

  toDomain(): RewardRequest {
    return new RewardRequest({
      userId: this.userId,
      eventId: this.eventId,
      rewardId: this.rewardId,
      status: RewardRequestStatus.REQUESTED,
      requestedAt: new Date(),
      requestIdempotencyKey: this.requestIdempotencyKey,
    });
  }
}
