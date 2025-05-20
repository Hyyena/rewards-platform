import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventRepository } from '../repository/event.repository';
import { Event, EventStatus } from '../domain/event';
import { CreateEventRequestDto } from '../dto/request/create-event.request.dto';
import { UpdateEventRequestDto } from '../dto/request/update-event.request.dto';
import { EventResponseDto } from '../dto/response/event.response.dto';

describe('EventsService', () => {
  let service: EventsService;
  let repository: EventRepository;

  const mockEventRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findActive: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EventRepository,
          useValue: mockEventRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get<EventRepository>(EventRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new event and return event response', async () => {
      // Arrange
      const createEventDto: CreateEventRequestDto = {
        name: 'Test Event',
        description: 'Test Description',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        status: EventStatus.INACTIVE,
        toDomain: jest.fn().mockReturnValue({
          name: 'Test Event',
          description: 'Test Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.INACTIVE,
        }),
      };

      const createdEvent: Event = {
        id: 'event-id',
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: EventStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          name: 'Test Event',
          description: 'Test Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.INACTIVE,
          _id: 'event-id',
        }),
      };

      mockEventRepository.findByName.mockResolvedValue(null);
      mockEventRepository.create.mockResolvedValue(createdEvent);

      // Act
      const result = await service.create(createEventDto);

      // Assert
      expect(mockEventRepository.findByName).toHaveBeenCalledWith(
        createEventDto.name,
      );
      expect(createEventDto.toDomain).toHaveBeenCalled();
      expect(mockEventRepository.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(EventResponseDto);
      expect(result.id).toBe(createdEvent.id);
      expect(result.name).toBe(createdEvent.name);
      expect(result.description).toBe(createdEvent.description);
      expect(result.status).toBe(createdEvent.status);
    });

    it('should throw ConflictException if event with same name exists', async () => {
      // Arrange
      const createEventDto: CreateEventRequestDto = {
        name: 'Existing Event',
        description: 'Test Description',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        status: EventStatus.INACTIVE,
        toDomain: jest.fn(),
      };

      const existingEvent: Event = {
        id: 'existing-id',
        name: 'Existing Event',
        description: 'Existing Description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: EventStatus.INACTIVE,
        toSchema: () => ({
          name: 'Existing Event',
          description: 'Existing Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.INACTIVE,
          _id: 'existing-id',
        }),
      };

      mockEventRepository.findByName.mockResolvedValue(existingEvent);

      // Act & Assert
      await expect(service.create(createEventDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockEventRepository.findByName).toHaveBeenCalledWith(
        createEventDto.name,
      );
      expect(createEventDto.toDomain).not.toHaveBeenCalled();
      expect(mockEventRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of event responses', async () => {
      // Arrange
      const events: Event[] = [
        {
          id: 'event-1',
          name: 'Event 1',
          description: 'Description 1',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          toSchema: () => ({
            name: 'Event 1',
            description: 'Description 1',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-12-31'),
            status: EventStatus.ACTIVE,
            _id: 'event-1',
          }),
        },
        {
          id: 'event-2',
          name: 'Event 2',
          description: 'Description 2',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.INACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          toSchema: () => ({
            name: 'Event 2',
            description: 'Description 2',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-12-31'),
            status: EventStatus.INACTIVE,
            _id: 'event-2',
          }),
        },
      ];

      mockEventRepository.findAll.mockResolvedValue(events);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockEventRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(EventResponseDto);
      expect(result[0].id).toBe(events[0].id);
      expect(result[1]).toBeInstanceOf(EventResponseDto);
      expect(result[1].id).toBe(events[1].id);
    });
  });

  describe('findById', () => {
    it('should return event response if event exists', async () => {
      // Arrange
      const eventId = 'event-id';
      const event: Event = {
        id: eventId,
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: EventStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          name: 'Test Event',
          description: 'Test Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.ACTIVE,
          _id: eventId,
        }),
      };

      mockEventRepository.findById.mockResolvedValue(event);

      // Act
      const result = await service.findById(eventId);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(result).toBeInstanceOf(EventResponseDto);
      expect(result.id).toBe(event.id);
      expect(result.name).toBe(event.name);
      expect(result.description).toBe(event.description);
      expect(result.status).toBe(event.status);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      // Arrange
      const eventId = 'non-existent-id';
      mockEventRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(eventId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
    });
  });

  describe('findActive', () => {
    it('should return array of active event responses', async () => {
      // Arrange
      const activeEvents: Event[] = [
        {
          id: 'event-1',
          name: 'Active Event 1',
          description: 'Description 1',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          toSchema: () => ({
            name: 'Active Event 1',
            description: 'Description 1',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-12-31'),
            status: EventStatus.ACTIVE,
            _id: 'event-1',
          }),
        },
        {
          id: 'event-2',
          name: 'Active Event 2',
          description: 'Description 2',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          toSchema: () => ({
            name: 'Active Event 2',
            description: 'Description 2',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-12-31'),
            status: EventStatus.ACTIVE,
            _id: 'event-2',
          }),
        },
      ];

      mockEventRepository.findActive.mockResolvedValue(activeEvents);

      // Act
      const result = await service.findActive();

      // Assert
      expect(mockEventRepository.findActive).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(EventResponseDto);
      expect(result[0].id).toBe(activeEvents[0].id);
      expect(result[0].status).toBe(EventStatus.ACTIVE);
      expect(result[1]).toBeInstanceOf(EventResponseDto);
      expect(result[1].id).toBe(activeEvents[1].id);
      expect(result[1].status).toBe(EventStatus.ACTIVE);
    });
  });

  describe('update', () => {
    it('should update event and return updated event response', async () => {
      // Arrange
      const eventId = 'event-id';
      const updateEventDto: UpdateEventRequestDto = {
        name: 'Updated Event',
        description: 'Updated Description',
        toPartialDomain: jest.fn().mockReturnValue({
          name: 'Updated Event',
          description: 'Updated Description',
        }),
        toDomain: jest
          .fn()
          .mockImplementation((id: string, existingEvent?: Event) => {
            return new Event({
              id,
              name: 'Updated Event',
              description: 'Updated Description',
              startDate: existingEvent?.startDate ?? new Date(),
              endDate: existingEvent?.endDate ?? new Date(),
              status: existingEvent?.status ?? EventStatus.INACTIVE,
            });
          }),
      };

      const existingEvent: Event = {
        id: eventId,
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: EventStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          name: 'Test Event',
          description: 'Test Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.INACTIVE,
          _id: eventId,
        }),
      };

      const updatedEvent: Event = {
        id: eventId,
        name: 'Updated Event',
        description: 'Updated Description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: EventStatus.INACTIVE,
        createdAt: existingEvent.createdAt,
        updatedAt: new Date(),
        toSchema: () => ({
          name: 'Updated Event',
          description: 'Updated Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.INACTIVE,
          _id: eventId,
        }),
      };

      mockEventRepository.findById.mockResolvedValue(existingEvent);
      mockEventRepository.findByName.mockResolvedValue(null);
      mockEventRepository.update.mockResolvedValue(updatedEvent);

      // Act
      const result = await service.update(eventId, updateEventDto);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.findByName).toHaveBeenCalledWith(
        updateEventDto.name,
      );
      expect(updateEventDto.toPartialDomain).toHaveBeenCalled();
      expect(mockEventRepository.update).toHaveBeenCalledWith(eventId, {
        name: 'Updated Event',
        description: 'Updated Description',
      });
      expect(result).toBeInstanceOf(EventResponseDto);
      expect(result.id).toBe(updatedEvent.id);
      expect(result.name).toBe(updatedEvent.name);
      expect(result.description).toBe(updatedEvent.description);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      // Arrange
      const eventId = 'non-existent-id';
      const updateEventDto: UpdateEventRequestDto = {
        name: 'Updated Event',
        toPartialDomain: jest.fn(),
        toDomain: jest
          .fn()
          .mockImplementation((id: string, existingEvent?: Event) => {
            return new Event({
              id,
              name: 'Updated Event',
              description: existingEvent?.description ?? '',
              startDate: existingEvent?.startDate ?? new Date(),
              endDate: existingEvent?.endDate ?? new Date(),
              status: existingEvent?.status ?? EventStatus.INACTIVE,
            });
          }),
      };

      mockEventRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(eventId, updateEventDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(updateEventDto.toPartialDomain).not.toHaveBeenCalled();
      expect(mockEventRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if updated name conflicts with existing event', async () => {
      // Arrange
      const eventId = 'event-id';
      const updateEventDto: UpdateEventRequestDto = {
        name: 'Existing Event',
        toPartialDomain: jest.fn(),
        toDomain: jest
          .fn()
          .mockImplementation((id: string, existingEvent?: Event) => {
            return new Event({
              id,
              name: 'Existing Event',
              description: existingEvent?.description ?? '',
              startDate: existingEvent?.startDate ?? new Date(),
              endDate: existingEvent?.endDate ?? new Date(),
              status: existingEvent?.status ?? EventStatus.INACTIVE,
            });
          }),
      };

      const existingEvent: Event = {
        id: eventId,
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: EventStatus.INACTIVE,
        toSchema: () => ({
          name: 'Test Event',
          description: 'Test Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.INACTIVE,
          _id: eventId,
        }),
      };

      const conflictingEvent: Event = {
        id: 'other-id',
        name: 'Existing Event',
        description: 'Other Description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: EventStatus.INACTIVE,
        toSchema: () => ({
          name: 'Existing Event',
          description: 'Other Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.INACTIVE,
          _id: 'other-id',
        }),
      };

      mockEventRepository.findById.mockResolvedValue(existingEvent);
      mockEventRepository.findByName.mockResolvedValue(conflictingEvent);

      // Act & Assert
      await expect(service.update(eventId, updateEventDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.findByName).toHaveBeenCalledWith(
        updateEventDto.name,
      );
      expect(updateEventDto.toPartialDomain).not.toHaveBeenCalled();
      expect(mockEventRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete event if it exists', async () => {
      // Arrange
      const eventId = 'event-id';
      mockEventRepository.delete.mockResolvedValue(true);

      // Act
      await service.delete(eventId);

      // Assert
      expect(mockEventRepository.delete).toHaveBeenCalledWith(eventId);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      // Arrange
      const eventId = 'non-existent-id';
      mockEventRepository.delete.mockResolvedValue(false);

      // Act & Assert
      await expect(service.delete(eventId)).rejects.toThrow(NotFoundException);
      expect(mockEventRepository.delete).toHaveBeenCalledWith(eventId);
    });
  });

  describe('activateEvent', () => {
    it('should activate event and return updated event response', async () => {
      // Arrange
      const eventId = 'event-id';
      const existingEvent: Event = {
        id: eventId,
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: EventStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          name: 'Test Event',
          description: 'Test Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.INACTIVE,
          _id: eventId,
        }),
      };

      const activatedEvent: Event = {
        ...existingEvent,
        status: EventStatus.ACTIVE,
        updatedAt: new Date(),
        toSchema: () => ({
          name: 'Test Event',
          description: 'Test Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.ACTIVE,
          _id: eventId,
        }),
      };

      mockEventRepository.findById.mockResolvedValue(existingEvent);
      mockEventRepository.update.mockResolvedValue(activatedEvent);

      // Act
      const result = await service.activateEvent(eventId);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.update).toHaveBeenCalledWith(eventId, {
        status: EventStatus.ACTIVE,
      });
      expect(result).toBeInstanceOf(EventResponseDto);
      expect(result.id).toBe(activatedEvent.id);
      expect(result.status).toBe(EventStatus.ACTIVE);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      // Arrange
      const eventId = 'non-existent-id';
      mockEventRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.activateEvent(eventId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deactivateEvent', () => {
    it('should deactivate event and return updated event response', async () => {
      // Arrange
      const eventId = 'event-id';
      const existingEvent: Event = {
        id: eventId,
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: EventStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          name: 'Test Event',
          description: 'Test Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.ACTIVE,
          _id: eventId,
        }),
      };

      const deactivatedEvent: Event = {
        ...existingEvent,
        status: EventStatus.INACTIVE,
        updatedAt: new Date(),
        toSchema: () => ({
          name: 'Test Event',
          description: 'Test Description',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: EventStatus.INACTIVE,
          _id: eventId,
        }),
      };

      mockEventRepository.findById.mockResolvedValue(existingEvent);
      mockEventRepository.update.mockResolvedValue(deactivatedEvent);

      // Act
      const result = await service.deactivateEvent(eventId);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.update).toHaveBeenCalledWith(eventId, {
        status: EventStatus.INACTIVE,
      });
      expect(result).toBeInstanceOf(EventResponseDto);
      expect(result.id).toBe(deactivatedEvent.id);
      expect(result.status).toBe(EventStatus.INACTIVE);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      // Arrange
      const eventId = 'non-existent-id';
      mockEventRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deactivateEvent(eventId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEventRepository.findById).toHaveBeenCalledWith(eventId);
      expect(mockEventRepository.update).not.toHaveBeenCalled();
    });
  });
});
