import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { RewardType, Reward } from '../../domain/reward';

export class UpdateRewardRequestDto {
  @IsMongoId()
  @IsOptional()
  eventId?: string;

  @IsEnum(RewardType)
  @IsOptional()
  type?: RewardType;

  @IsInt()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  toDomain(id: string, existingReward?: Reward): Reward {
    return new Reward({
      id,
      eventId: this.eventId ?? existingReward?.eventId ?? '',
      type: this.type ?? existingReward?.type ?? RewardType.POINTS,
      amount: this.amount ?? existingReward?.amount ?? 0,
      description: this.description ?? existingReward?.description ?? '',
    });
  }

  toPartialDomain(): Partial<Reward> {
    const partialReward: Partial<Reward> = {};

    if (this.eventId !== undefined) partialReward.eventId = this.eventId;
    if (this.type !== undefined) partialReward.type = this.type;
    if (this.amount !== undefined) partialReward.amount = this.amount;
    if (this.description !== undefined)
      partialReward.description = this.description;

    return partialReward;
  }
}
