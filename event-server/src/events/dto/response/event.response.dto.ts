import { Event, EventStatus } from '../../domain/event';

export class EventResponseDto {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.startDate = params.startDate;
    this.endDate = params.endDate;
    this.status = params.status;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static fromDomain(event: Event): EventResponseDto {
    if (!event.id) {
      throw new Error('Event ID is required');
    }

    return new EventResponseDto({
      id: event.id,
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      createdAt: event.createdAt || new Date(),
      updatedAt: event.updatedAt || new Date(),
    });
  }
}
