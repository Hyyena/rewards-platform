import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventRepository } from '../repository/event.repository';
import { Event, EventStatus } from '../domain/event';
import { CreateEventRequestDto } from '../dto/request/create-event.request.dto';
import { UpdateEventRequestDto } from '../dto/request/update-event.request.dto';
import { EventResponseDto } from '../dto/response/event.response.dto';

@Injectable()
export class EventsService {
  constructor(private readonly eventRepository: EventRepository) {}

  async create(
    createEventDto: CreateEventRequestDto,
  ): Promise<EventResponseDto> {
    const existingEvent = await this.eventRepository.findByName(
      createEventDto.name,
    );
    if (existingEvent) {
      throw new ConflictException(
        `Event with name ${createEventDto.name} already exists`,
      );
    }

    const event = createEventDto.toDomain();
    const createdEvent = await this.eventRepository.create(event);
    return EventResponseDto.fromDomain(createdEvent);
  }

  async findAll(): Promise<EventResponseDto[]> {
    const events = await this.eventRepository.findAll();
    return events.map((event) => EventResponseDto.fromDomain(event));
  }

  async findById(id: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return EventResponseDto.fromDomain(event);
  }

  async findActive(): Promise<EventResponseDto[]> {
    const events = await this.eventRepository.findActive();
    return events.map((event) => EventResponseDto.fromDomain(event));
  }

  async update(
    id: string,
    updateEventDto: UpdateEventRequestDto,
  ): Promise<EventResponseDto> {
    const existingEvent = await this.eventRepository.findById(id);
    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (updateEventDto.name) {
      const eventWithSameName = await this.eventRepository.findByName(
        updateEventDto.name,
      );
      if (eventWithSameName && eventWithSameName.id !== id) {
        throw new ConflictException(
          `Event with name ${updateEventDto.name} already exists`,
        );
      }
    }

    const partialEvent = updateEventDto.toPartialDomain();
    const updatedEvent = await this.eventRepository.update(id, partialEvent);
    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return EventResponseDto.fromDomain(updatedEvent);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.eventRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async activateEvent(id: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updatedEvent = await this.eventRepository.update(id, {
      status: EventStatus.ACTIVE,
    });
    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return EventResponseDto.fromDomain(updatedEvent);
  }

  async deactivateEvent(id: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updatedEvent = await this.eventRepository.update(id, {
      status: EventStatus.INACTIVE,
    });
    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return EventResponseDto.fromDomain(updatedEvent);
  }
}
