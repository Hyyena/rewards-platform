import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Event, EventStatus } from '../../domain/event';

export class CreateEventRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  toDomain(): Event {
    return new Event({
      name: this.name,
      description: this.description,
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate),
      status: this.status,
    });
  }
}
