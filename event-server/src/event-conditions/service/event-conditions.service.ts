import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventConditionRepository } from '../repository/event-condition.repository';
import { EventCondition } from '../domain/event-condition';
import { CreateEventConditionRequestDto } from '../dto/request/create-event-condition.request.dto';
import { UpdateEventConditionRequestDto } from '../dto/request/update-event-condition.request.dto';
import { EventConditionResponseDto } from '../dto/response/event-condition.response.dto';

@Injectable()
export class EventConditionsService {
  constructor(
    private readonly eventConditionRepository: EventConditionRepository,
  ) {}

  async create(
    createConditionDto: CreateEventConditionRequestDto,
  ): Promise<EventConditionResponseDto> {
    const existingCondition =
      await this.eventConditionRepository.findByEventIdAndType(
        createConditionDto.eventId,
        createConditionDto.type,
      );

    if (existingCondition) {
      throw new ConflictException(
        `Condition with event ID ${createConditionDto.eventId} and type ${createConditionDto.type} already exists`,
      );
    }

    const condition = createConditionDto.toDomain();
    const createdCondition =
      await this.eventConditionRepository.create(condition);
    return EventConditionResponseDto.fromDomain(createdCondition);
  }

  async findAll(): Promise<EventConditionResponseDto[]> {
    const conditions = await this.eventConditionRepository.findAll();
    return conditions.map((condition) =>
      EventConditionResponseDto.fromDomain(condition),
    );
  }

  async findById(id: string): Promise<EventConditionResponseDto> {
    const condition = await this.eventConditionRepository.findById(id);
    if (!condition) {
      throw new NotFoundException(`Condition with ID ${id} not found`);
    }
    return EventConditionResponseDto.fromDomain(condition);
  }

  async findByEventId(eventId: string): Promise<EventConditionResponseDto[]> {
    const conditions =
      await this.eventConditionRepository.findByEventId(eventId);
    return conditions.map((condition) =>
      EventConditionResponseDto.fromDomain(condition),
    );
  }

  async update(
    id: string,
    updateConditionDto: UpdateEventConditionRequestDto,
  ): Promise<EventConditionResponseDto> {
    const existingCondition = await this.eventConditionRepository.findById(id);
    if (!existingCondition) {
      throw new NotFoundException(`Condition with ID ${id} not found`);
    }

    if (updateConditionDto.eventId && updateConditionDto.type) {
      const conditionWithSameEventIdAndType =
        await this.eventConditionRepository.findByEventIdAndType(
          updateConditionDto.eventId,
          updateConditionDto.type,
        );

      if (
        conditionWithSameEventIdAndType &&
        conditionWithSameEventIdAndType.id !== id
      ) {
        throw new ConflictException(
          `Condition with event ID ${updateConditionDto.eventId} and type ${updateConditionDto.type} already exists`,
        );
      }
    }

    const partialCondition = updateConditionDto.toPartialDomain();
    const updatedCondition = await this.eventConditionRepository.update(
      id,
      partialCondition,
    );
    if (!updatedCondition) {
      throw new NotFoundException(`Condition with ID ${id} not found`);
    }
    return EventConditionResponseDto.fromDomain(updatedCondition);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.eventConditionRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Condition with ID ${id} not found`);
    }
  }

  async deleteByEventId(eventId: string): Promise<number> {
    return this.eventConditionRepository.deleteByEventId(eventId);
  }
}
