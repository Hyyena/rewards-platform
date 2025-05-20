import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Reward, RewardType } from '../../domain/reward';

export class CreateRewardRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  eventId: string;

  @IsEnum(RewardType)
  @IsNotEmpty()
  type: RewardType;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  toDomain(): Reward {
    return new Reward({
      eventId: this.eventId,
      type: this.type,
      amount: this.amount,
      description: this.description,
    });
  }
}
