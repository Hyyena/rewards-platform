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
import { ConditionType, EventCondition } from '../../domain/event-condition';

export class UpdateEventConditionRequestDto {
  @IsMongoId()
  @IsOptional()
  eventId?: string;

  @IsEnum(ConditionType)
  @IsOptional()
  type?: ConditionType;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  requiredCount?: number;

  toDomain(id: string, existingCondition?: EventCondition): EventCondition {
    return new EventCondition({
      id,
      eventId: this.eventId ?? existingCondition?.eventId ?? '',
      type: this.type ?? existingCondition?.type ?? ConditionType.CUSTOM,
      description: this.description ?? existingCondition?.description ?? '',
      requiredCount:
        this.requiredCount ?? existingCondition?.requiredCount ?? 1,
    });
  }

  toPartialDomain(): Partial<EventCondition> {
    const partialCondition: Partial<EventCondition> = {};

    if (this.eventId !== undefined) partialCondition.eventId = this.eventId;
    if (this.type !== undefined) partialCondition.type = this.type;
    if (this.description !== undefined)
      partialCondition.description = this.description;
    if (this.requiredCount !== undefined)
      partialCondition.requiredCount = this.requiredCount;

    return partialCondition;
  }
}
