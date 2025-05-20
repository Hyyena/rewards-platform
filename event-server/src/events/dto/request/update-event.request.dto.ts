import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Event, EventStatus } from '../../domain/event';

export class UpdateEventRequestDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  toDomain(id: string, existingEvent?: Event): Event {
    return new Event({
      id,
      name: this.name ?? existingEvent?.name ?? '',
      description: this.description ?? existingEvent?.description ?? '',
      startDate: this.startDate
        ? new Date(this.startDate)
        : (existingEvent?.startDate ?? new Date()),
      endDate: this.endDate
        ? new Date(this.endDate)
        : (existingEvent?.endDate ?? new Date()),
      status: this.status ?? existingEvent?.status ?? EventStatus.INACTIVE,
    });
  }

  toPartialDomain(): Partial<Event> {
    const partialEvent: Partial<Event> = {};

    if (this.name !== undefined) partialEvent.name = this.name;
    if (this.description !== undefined)
      partialEvent.description = this.description;
    if (this.startDate !== undefined)
      partialEvent.startDate = new Date(this.startDate);
    if (this.endDate !== undefined)
      partialEvent.endDate = new Date(this.endDate);
    if (this.status !== undefined) partialEvent.status = this.status;

    return partialEvent;
  }
}
