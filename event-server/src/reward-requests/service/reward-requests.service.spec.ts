import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RewardRequestsService } from './reward-requests.service';
import { RewardRequestRepository } from '../repository/reward-request.repository';
import { EventsService } from '../../events/service/events.service';
import { RewardsService } from '../../rewards/service/rewards.service';
import { EventConditionsService } from '../../event-conditions/service/event-conditions.service';
import { RewardRequest, RewardRequestStatus } from '../domain/reward-request';
import { CreateRewardRequestDto } from '../dto/request/create-reward-request.request.dto';
import { UpdateRewardRequestDto } from '../dto/request/update-reward-request.request.dto';
import { RewardRequestResponseDto } from '../dto/response/reward-request.response.dto';
import { EventStatus } from '../../events/domain/event';

describe('RewardRequestsService', () => {
  let service: RewardRequestsService;
  let repository: RewardRequestRepository;
  let eventsService: EventsService;
  let rewardsService: RewardsService;
  let eventConditionsService: EventConditionsService;

  const mockRewardRequestRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByEventId: jest.fn(),
    findByStatus: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    existsByUserIdAndEventIdAndRewardId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockEventsService = {
    findById: jest.fn(),
  };

  const mockRewardsService = {
    findById: jest.fn(),
  };

  const mockEventConditionsService = {
    findByEventId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardRequestsService,
        {
          provide: RewardRequestRepository,
          useValue: mockRewardRequestRepository,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: RewardsService,
          useValue: mockRewardsService,
        },
        {
          provide: EventConditionsService,
          useValue: mockEventConditionsService,
        },
      ],
    }).compile();

    service = module.get<RewardRequestsService>(RewardRequestsService);
    repository = module.get<RewardRequestRepository>(RewardRequestRepository);
    eventsService = module.get<EventsService>(EventsService);
    rewardsService = module.get<RewardsService>(RewardsService);
    eventConditionsService = module.get<EventConditionsService>(
      EventConditionsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return existing request if idempotency key exists', async () => {
      // Arrange
      const createRequestDto: CreateRewardRequestDto = {
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        requestIdempotencyKey: 'existing-key',
        toDomain: jest.fn(),
      };

      const existingRequest: RewardRequest = {
        id: 'request-id',
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        status: RewardRequestStatus.APPROVED,
        requestedAt: new Date(),
        processedAt: new Date(),
        requestIdempotencyKey: 'existing-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          userId: 'user-id',
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.APPROVED,
          requestedAt: new Date(),
          processedAt: new Date(),
          requestIdempotencyKey: 'existing-key',
          _id: 'request-id',
        }),
      };

      mockRewardRequestRepository.findByIdempotencyKey.mockResolvedValue(
        existingRequest,
      );

      // Act
      const result = await service.create(createRequestDto);

      // Assert
      expect(
        mockRewardRequestRepository.findByIdempotencyKey,
      ).toHaveBeenCalledWith(createRequestDto.requestIdempotencyKey);
      expect(createRequestDto.toDomain).not.toHaveBeenCalled();
      expect(mockRewardRequestRepository.create).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(RewardRequestResponseDto);
      expect(result.id).toBe(existingRequest.id);
    });

    it('should throw ConflictException if user already has a reward request for the event and reward', async () => {
      // Arrange
      const createRequestDto: CreateRewardRequestDto = {
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        requestIdempotencyKey: 'new-key',
        toDomain: jest.fn(),
      };

      mockRewardRequestRepository.findByIdempotencyKey.mockResolvedValue(null);
      mockRewardRequestRepository.existsByUserIdAndEventIdAndRewardId.mockResolvedValue(
        true,
      );

      // Act & Assert
      await expect(service.create(createRequestDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockRewardRequestRepository.findByIdempotencyKey,
      ).toHaveBeenCalledWith(createRequestDto.requestIdempotencyKey);
      expect(
        mockRewardRequestRepository.existsByUserIdAndEventIdAndRewardId,
      ).toHaveBeenCalledWith(
        createRequestDto.userId,
        createRequestDto.eventId,
        createRequestDto.rewardId,
      );
      expect(createRequestDto.toDomain).not.toHaveBeenCalled();
      expect(mockRewardRequestRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if event is not active', async () => {
      // Arrange
      const createRequestDto: CreateRewardRequestDto = {
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        requestIdempotencyKey: 'new-key',
        toDomain: jest.fn(),
      };

      const event = {
        id: 'event-id',
        status: EventStatus.INACTIVE,
      };

      mockRewardRequestRepository.findByIdempotencyKey.mockResolvedValue(null);
      mockRewardRequestRepository.existsByUserIdAndEventIdAndRewardId.mockResolvedValue(
        false,
      );
      mockEventsService.findById.mockResolvedValue(event);

      // Act & Assert
      await expect(service.create(createRequestDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(
        mockRewardRequestRepository.findByIdempotencyKey,
      ).toHaveBeenCalledWith(createRequestDto.requestIdempotencyKey);
      expect(
        mockRewardRequestRepository.existsByUserIdAndEventIdAndRewardId,
      ).toHaveBeenCalledWith(
        createRequestDto.userId,
        createRequestDto.eventId,
        createRequestDto.rewardId,
      );
      expect(mockEventsService.findById).toHaveBeenCalledWith(
        createRequestDto.eventId,
      );
      expect(createRequestDto.toDomain).not.toHaveBeenCalled();
      expect(mockRewardRequestRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if reward does not belong to the event', async () => {
      // Arrange
      const createRequestDto: CreateRewardRequestDto = {
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        requestIdempotencyKey: 'new-key',
        toDomain: jest.fn(),
      };

      const event = {
        id: 'event-id',
        status: EventStatus.ACTIVE,
      };

      const reward = {
        id: 'reward-id',
        eventId: 'other-event-id',
      };

      mockRewardRequestRepository.findByIdempotencyKey.mockResolvedValue(null);
      mockRewardRequestRepository.existsByUserIdAndEventIdAndRewardId.mockResolvedValue(
        false,
      );
      mockEventsService.findById.mockResolvedValue(event);
      mockRewardsService.findById.mockResolvedValue(reward);

      // Act & Assert
      await expect(service.create(createRequestDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(
        mockRewardRequestRepository.findByIdempotencyKey,
      ).toHaveBeenCalledWith(createRequestDto.requestIdempotencyKey);
      expect(
        mockRewardRequestRepository.existsByUserIdAndEventIdAndRewardId,
      ).toHaveBeenCalledWith(
        createRequestDto.userId,
        createRequestDto.eventId,
        createRequestDto.rewardId,
      );
      expect(mockEventsService.findById).toHaveBeenCalledWith(
        createRequestDto.eventId,
      );
      expect(mockRewardsService.findById).toHaveBeenCalledWith(
        createRequestDto.rewardId,
      );
      expect(createRequestDto.toDomain).not.toHaveBeenCalled();
      expect(mockRewardRequestRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if event has no conditions', async () => {
      // Arrange
      const createRequestDto: CreateRewardRequestDto = {
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        requestIdempotencyKey: 'new-key',
        toDomain: jest.fn(),
      };

      const event = {
        id: 'event-id',
        status: EventStatus.ACTIVE,
      };

      const reward = {
        id: 'reward-id',
        eventId: 'event-id',
      };

      mockRewardRequestRepository.findByIdempotencyKey.mockResolvedValue(null);
      mockRewardRequestRepository.existsByUserIdAndEventIdAndRewardId.mockResolvedValue(
        false,
      );
      mockEventsService.findById.mockResolvedValue(event);
      mockRewardsService.findById.mockResolvedValue(reward);
      mockEventConditionsService.findByEventId.mockResolvedValue([]);

      // Act & Assert
      await expect(service.create(createRequestDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(
        mockRewardRequestRepository.findByIdempotencyKey,
      ).toHaveBeenCalledWith(createRequestDto.requestIdempotencyKey);
      expect(
        mockRewardRequestRepository.existsByUserIdAndEventIdAndRewardId,
      ).toHaveBeenCalledWith(
        createRequestDto.userId,
        createRequestDto.eventId,
        createRequestDto.rewardId,
      );
      expect(mockEventsService.findById).toHaveBeenCalledWith(
        createRequestDto.eventId,
      );
      expect(mockRewardsService.findById).toHaveBeenCalledWith(
        createRequestDto.rewardId,
      );
      expect(mockEventConditionsService.findByEventId).toHaveBeenCalledWith(
        createRequestDto.eventId,
      );
      expect(createRequestDto.toDomain).not.toHaveBeenCalled();
      expect(mockRewardRequestRepository.create).not.toHaveBeenCalled();
    });

    it('should create a new reward request and return reward request response', async () => {
      // Arrange
      const createRequestDto: CreateRewardRequestDto = {
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        requestIdempotencyKey: 'new-key',
        toDomain: jest.fn().mockReturnValue({
          userId: 'user-id',
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.REQUESTED,
          requestedAt: new Date(),
          requestIdempotencyKey: 'new-key',
        }),
      };

      const event = {
        id: 'event-id',
        status: EventStatus.ACTIVE,
      };

      const reward = {
        id: 'reward-id',
        eventId: 'event-id',
      };

      const conditions = [{ id: 'condition-id' }];

      const createdRequest: RewardRequest = {
        id: 'request-id',
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        status: RewardRequestStatus.APPROVED,
        requestedAt: new Date(),
        processedAt: new Date(),
        requestIdempotencyKey: 'new-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          userId: 'user-id',
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.APPROVED,
          requestedAt: new Date(),
          processedAt: new Date(),
          requestIdempotencyKey: 'new-key',
          _id: 'request-id',
        }),
      };

      mockRewardRequestRepository.findByIdempotencyKey.mockResolvedValue(null);
      mockRewardRequestRepository.existsByUserIdAndEventIdAndRewardId.mockResolvedValue(
        false,
      );
      mockEventsService.findById.mockResolvedValue(event);
      mockRewardsService.findById.mockResolvedValue(reward);
      mockEventConditionsService.findByEventId.mockResolvedValue(conditions);
      mockRewardRequestRepository.create.mockResolvedValue(createdRequest);

      // Act
      const result = await service.create(createRequestDto);

      // Assert
      expect(
        mockRewardRequestRepository.findByIdempotencyKey,
      ).toHaveBeenCalledWith(createRequestDto.requestIdempotencyKey);
      expect(
        mockRewardRequestRepository.existsByUserIdAndEventIdAndRewardId,
      ).toHaveBeenCalledWith(
        createRequestDto.userId,
        createRequestDto.eventId,
        createRequestDto.rewardId,
      );
      expect(mockEventsService.findById).toHaveBeenCalledWith(
        createRequestDto.eventId,
      );
      expect(mockRewardsService.findById).toHaveBeenCalledWith(
        createRequestDto.rewardId,
      );
      expect(mockEventConditionsService.findByEventId).toHaveBeenCalledWith(
        createRequestDto.eventId,
      );
      expect(createRequestDto.toDomain).toHaveBeenCalled();
      expect(mockRewardRequestRepository.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(RewardRequestResponseDto);
      expect(result.id).toBe(createdRequest.id);
      expect(result.status).toBe(RewardRequestStatus.APPROVED);
    });
  });

  describe('findAll', () => {
    it('should return array of reward request responses', async () => {
      // Arrange
      const requests: RewardRequest[] = [
        {
          id: 'request-1',
          userId: 'user-id',
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.APPROVED,
          requestedAt: new Date(),
          processedAt: new Date(),
          requestIdempotencyKey: 'key-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          toSchema: () => ({
            userId: 'user-id',
            eventId: 'event-id',
            rewardId: 'reward-id',
            status: RewardRequestStatus.APPROVED,
            requestedAt: new Date(),
            processedAt: new Date(),
            requestIdempotencyKey: 'key-1',
            _id: 'request-1',
          }),
        },
        {
          id: 'request-2',
          userId: 'user-id',
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.COMPLETED,
          requestedAt: new Date(),
          processedAt: new Date(),
          completedAt: new Date(),
          requestIdempotencyKey: 'key-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          toSchema: () => ({
            userId: 'user-id',
            eventId: 'event-id',
            rewardId: 'reward-id',
            status: RewardRequestStatus.COMPLETED,
            requestedAt: new Date(),
            processedAt: new Date(),
            completedAt: new Date(),
            requestIdempotencyKey: 'key-2',
            _id: 'request-2',
          }),
        },
      ];

      mockRewardRequestRepository.findAll.mockResolvedValue(requests);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockRewardRequestRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(RewardRequestResponseDto);
      expect(result[0].id).toBe(requests[0].id);
      expect(result[1]).toBeInstanceOf(RewardRequestResponseDto);
      expect(result[1].id).toBe(requests[1].id);
    });
  });

  describe('findById', () => {
    it('should return reward request response if request exists', async () => {
      // Arrange
      const requestId = 'request-id';
      const request: RewardRequest = {
        id: requestId,
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        status: RewardRequestStatus.APPROVED,
        requestedAt: new Date(),
        processedAt: new Date(),
        requestIdempotencyKey: 'key',
        createdAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          userId: 'user-id',
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.APPROVED,
          requestedAt: new Date(),
          processedAt: new Date(),
          requestIdempotencyKey: 'key',
          _id: requestId,
        }),
      };

      mockRewardRequestRepository.findById.mockResolvedValue(request);

      // Act
      const result = await service.findById(requestId);

      // Assert
      expect(mockRewardRequestRepository.findById).toHaveBeenCalledWith(
        requestId,
      );
      expect(result).toBeInstanceOf(RewardRequestResponseDto);
      expect(result.id).toBe(request.id);
      expect(result.userId).toBe(request.userId);
      expect(result.eventId).toBe(request.eventId);
      expect(result.rewardId).toBe(request.rewardId);
      expect(result.status).toBe(request.status);
    });

    it('should throw NotFoundException if request does not exist', async () => {
      // Arrange
      const requestId = 'non-existent-id';
      mockRewardRequestRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(requestId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRewardRequestRepository.findById).toHaveBeenCalledWith(
        requestId,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return array of reward request responses for user', async () => {
      // Arrange
      const userId = 'user-id';
      const requests: RewardRequest[] = [
        {
          id: 'request-1',
          userId,
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.APPROVED,
          requestedAt: new Date(),
          processedAt: new Date(),
          requestIdempotencyKey: 'key-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          toSchema: () => ({
            userId,
            eventId: 'event-id',
            rewardId: 'reward-id',
            status: RewardRequestStatus.APPROVED,
            requestedAt: new Date(),
            processedAt: new Date(),
            requestIdempotencyKey: 'key-1',
            _id: 'request-1',
          }),
        },
        {
          id: 'request-2',
          userId,
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.COMPLETED,
          requestedAt: new Date(),
          processedAt: new Date(),
          completedAt: new Date(),
          requestIdempotencyKey: 'key-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          toSchema: () => ({
            userId,
            eventId: 'event-id',
            rewardId: 'reward-id',
            status: RewardRequestStatus.COMPLETED,
            requestedAt: new Date(),
            processedAt: new Date(),
            completedAt: new Date(),
            requestIdempotencyKey: 'key-2',
            _id: 'request-2',
          }),
        },
      ];

      mockRewardRequestRepository.findByUserId.mockResolvedValue(requests);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(mockRewardRequestRepository.findByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(RewardRequestResponseDto);
      expect(result[0].id).toBe(requests[0].id);
      expect(result[0].userId).toBe(userId);
      expect(result[1]).toBeInstanceOf(RewardRequestResponseDto);
      expect(result[1].id).toBe(requests[1].id);
      expect(result[1].userId).toBe(userId);
    });
  });

  describe('findByEventId', () => {
    it('should return array of reward request responses for event', async () => {
      // Arrange
      const eventId = 'event-id';
      const requests: RewardRequest[] = [
        new RewardRequest({
          id: 'request-1',
          userId: 'user-1',
          eventId,
          rewardId: 'reward-id',
          status: RewardRequestStatus.APPROVED,
          requestedAt: new Date(),
          processedAt: new Date(),
          requestIdempotencyKey: 'key-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new RewardRequest({
          id: 'request-2',
          userId: 'user-2',
          eventId,
          rewardId: 'reward-id',
          status: RewardRequestStatus.COMPLETED,
          requestedAt: new Date(),
          processedAt: new Date(),
          completedAt: new Date(),
          requestIdempotencyKey: 'key-2',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      mockRewardRequestRepository.findByEventId.mockResolvedValue(requests);

      // Act
      const result = await service.findByEventId(eventId);

      // Assert
      expect(mockRewardRequestRepository.findByEventId).toHaveBeenCalledWith(
        eventId,
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(RewardRequestResponseDto);
      expect(result[0].id).toBe(requests[0].id);
      expect(result[0].eventId).toBe(eventId);
      expect(result[1]).toBeInstanceOf(RewardRequestResponseDto);
      expect(result[1].id).toBe(requests[1].id);
      expect(result[1].eventId).toBe(eventId);
    });
  });

  describe('findByStatus', () => {
    it('should return array of reward request responses with specified status', async () => {
      // Arrange
      const status = RewardRequestStatus.APPROVED;
      const requests: RewardRequest[] = [
        new RewardRequest({
          id: 'request-1',
          userId: 'user-1',
          eventId: 'event-1',
          rewardId: 'reward-id',
          status,
          requestedAt: new Date(),
          processedAt: new Date(),
          requestIdempotencyKey: 'key-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new RewardRequest({
          id: 'request-2',
          userId: 'user-2',
          eventId: 'event-2',
          rewardId: 'reward-id',
          status,
          requestedAt: new Date(),
          processedAt: new Date(),
          requestIdempotencyKey: 'key-2',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      mockRewardRequestRepository.findByStatus.mockResolvedValue(requests);

      // Act
      const result = await service.findByStatus(status);

      // Assert
      expect(mockRewardRequestRepository.findByStatus).toHaveBeenCalledWith(
        status,
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(RewardRequestResponseDto);
      expect(result[0].id).toBe(requests[0].id);
      expect(result[0].status).toBe(status);
      expect(result[1]).toBeInstanceOf(RewardRequestResponseDto);
      expect(result[1].id).toBe(requests[1].id);
      expect(result[1].status).toBe(status);
    });
  });

  describe('update', () => {
    it('should update reward request and return updated reward request response', async () => {
      // Arrange
      const requestId = 'request-id';
      const updateRequestDto: UpdateRewardRequestDto = {
        status: RewardRequestStatus.COMPLETED,
        toPartialDomain: jest.fn().mockReturnValue({
          status: RewardRequestStatus.COMPLETED,
          completedAt: expect.any(Date),
        }),
        toDomain: jest
          .fn()
          .mockImplementation((id: string, existingRequest?: RewardRequest) => {
            return new RewardRequest({
              id,
              userId: existingRequest?.userId ?? '',
              eventId: existingRequest?.eventId ?? '',
              rewardId: existingRequest?.rewardId ?? '',
              status: RewardRequestStatus.COMPLETED,
              requestedAt: existingRequest?.requestedAt ?? new Date(),
              processedAt: existingRequest?.processedAt,
              completedAt: new Date(),
              rejectionReason: existingRequest?.rejectionReason,
              requestIdempotencyKey:
                existingRequest?.requestIdempotencyKey ?? '',
            });
          }),
      };

      const existingRequest: RewardRequest = {
        id: requestId,
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        status: RewardRequestStatus.APPROVED,
        requestedAt: new Date(),
        processedAt: new Date(),
        requestIdempotencyKey: 'key',
        createdAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          userId: 'user-id',
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.APPROVED,
          requestedAt: new Date(),
          processedAt: new Date(),
          requestIdempotencyKey: 'key',
          _id: requestId,
        }),
      };

      const updatedRequest: RewardRequest = {
        ...existingRequest,
        status: RewardRequestStatus.COMPLETED,
        completedAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          userId: 'user-id',
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.COMPLETED,
          requestedAt: new Date(),
          processedAt: new Date(),
          completedAt: new Date(),
          requestIdempotencyKey: 'key',
          _id: requestId,
        }),
      };

      mockRewardRequestRepository.findById.mockResolvedValue(existingRequest);
      mockRewardRequestRepository.update.mockResolvedValue(updatedRequest);

      // Act
      const result = await service.update(requestId, updateRequestDto);

      // Assert
      expect(mockRewardRequestRepository.findById).toHaveBeenCalledWith(
        requestId,
      );
      expect(updateRequestDto.toPartialDomain).toHaveBeenCalled();
      expect(mockRewardRequestRepository.update).toHaveBeenCalledWith(
        requestId,
        {
          status: RewardRequestStatus.COMPLETED,
          completedAt: expect.any(Date),
        },
      );
      expect(result).toBeInstanceOf(RewardRequestResponseDto);
      expect(result.id).toBe(updatedRequest.id);
      expect(result.status).toBe(RewardRequestStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
    });

    it('should throw NotFoundException if reward request does not exist', async () => {
      // Arrange
      const requestId = 'non-existent-id';
      const updateRequestDto: UpdateRewardRequestDto = {
        status: RewardRequestStatus.COMPLETED,
        toPartialDomain: jest.fn(),
        toDomain: jest
          .fn()
          .mockImplementation((id: string, existingRequest?: RewardRequest) => {
            return new RewardRequest({
              id,
              userId: existingRequest?.userId ?? '',
              eventId: existingRequest?.eventId ?? '',
              rewardId: existingRequest?.rewardId ?? '',
              status: RewardRequestStatus.COMPLETED,
              requestedAt: existingRequest?.requestedAt ?? new Date(),
              processedAt: existingRequest?.processedAt,
              completedAt: new Date(),
              rejectionReason: existingRequest?.rejectionReason,
              requestIdempotencyKey:
                existingRequest?.requestIdempotencyKey ?? '',
            });
          }),
      };

      mockRewardRequestRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(requestId, updateRequestDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRewardRequestRepository.findById).toHaveBeenCalledWith(
        requestId,
      );
      expect(updateRequestDto.toPartialDomain).not.toHaveBeenCalled();
      expect(mockRewardRequestRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if status transition is invalid', async () => {
      // Arrange
      const requestId = 'request-id';
      const updateRequestDto: UpdateRewardRequestDto = {
        status: RewardRequestStatus.REQUESTED,
        toPartialDomain: jest.fn(),
        toDomain: jest
          .fn()
          .mockImplementation((id: string, existingRequest?: RewardRequest) => {
            return new RewardRequest({
              id,
              userId: existingRequest?.userId ?? '',
              eventId: existingRequest?.eventId ?? '',
              rewardId: existingRequest?.rewardId ?? '',
              status: RewardRequestStatus.REQUESTED,
              requestedAt: existingRequest?.requestedAt ?? new Date(),
              processedAt: existingRequest?.processedAt,
              completedAt: existingRequest?.completedAt,
              rejectionReason: existingRequest?.rejectionReason,
              requestIdempotencyKey:
                existingRequest?.requestIdempotencyKey ?? '',
            });
          }),
      };

      const existingRequest: RewardRequest = {
        id: requestId,
        userId: 'user-id',
        eventId: 'event-id',
        rewardId: 'reward-id',
        status: RewardRequestStatus.COMPLETED,
        requestedAt: new Date(),
        processedAt: new Date(),
        completedAt: new Date(),
        requestIdempotencyKey: 'key',
        createdAt: new Date(),
        updatedAt: new Date(),
        toSchema: () => ({
          userId: 'user-id',
          eventId: 'event-id',
          rewardId: 'reward-id',
          status: RewardRequestStatus.COMPLETED,
          requestedAt: new Date(),
          processedAt: new Date(),
          completedAt: new Date(),
          requestIdempotencyKey: 'key',
          _id: requestId,
        }),
      };

      mockRewardRequestRepository.findById.mockResolvedValue(existingRequest);

      // Act & Assert
      await expect(service.update(requestId, updateRequestDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRewardRequestRepository.findById).toHaveBeenCalledWith(
        requestId,
      );
      expect(updateRequestDto.toPartialDomain).not.toHaveBeenCalled();
      expect(mockRewardRequestRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete reward request if it exists', async () => {
      // Arrange
      const requestId = 'request-id';
      mockRewardRequestRepository.delete.mockResolvedValue(true);

      // Act
      await service.delete(requestId);

      // Assert
      expect(mockRewardRequestRepository.delete).toHaveBeenCalledWith(
        requestId,
      );
    });

    it('should throw NotFoundException if reward request does not exist', async () => {
      // Arrange
      const requestId = 'non-existent-id';
      mockRewardRequestRepository.delete.mockResolvedValue(false);

      // Act & Assert
      await expect(service.delete(requestId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRewardRequestRepository.delete).toHaveBeenCalledWith(
        requestId,
      );
    });
  });
});
