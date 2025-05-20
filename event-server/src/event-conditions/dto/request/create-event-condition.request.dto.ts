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
import { ConditionType, EventCondition } from '../../domain/event-condition';

export class CreateEventConditionRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  eventId: string;

  @IsEnum(ConditionType)
  @IsNotEmpty()
  type: ConditionType;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  requiredCount: number;

  toDomain(): EventCondition {
    return new EventCondition({
      eventId: this.eventId,
      type: this.type,
      description: this.description,
      requiredCount: this.requiredCount,
    });
  }
}
