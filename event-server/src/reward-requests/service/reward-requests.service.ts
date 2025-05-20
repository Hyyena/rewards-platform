import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RewardRequestRepository } from '../repository/reward-request.repository';
import { RewardRequestStatus } from '../domain/reward-request';
import { CreateRewardRequestDto } from '../dto/request/create-reward-request.request.dto';
import { UpdateRewardRequestDto } from '../dto/request/update-reward-request.request.dto';
import { RewardRequestResponseDto } from '../dto/response/reward-request.response.dto';
import { EventsService } from '../../events/service/events.service';
import { RewardsService } from '../../rewards/service/rewards.service';
import { EventConditionsService } from '../../event-conditions/service/event-conditions.service';

@Injectable()
export class RewardRequestsService {
  constructor(
    private readonly rewardRequestRepository: RewardRequestRepository,
    private readonly eventsService: EventsService,
    private readonly rewardsService: RewardsService,
    private readonly eventConditionsService: EventConditionsService,
  ) {}

  async create(
    createRequestDto: CreateRewardRequestDto,
  ): Promise<RewardRequestResponseDto> {
    const existingRequest =
      await this.rewardRequestRepository.findByIdempotencyKey(
        createRequestDto.requestIdempotencyKey,
      );

    if (existingRequest) {
      return RewardRequestResponseDto.fromDomain(existingRequest);
    }

    const hasExistingRequest =
      await this.rewardRequestRepository.existsByUserIdAndEventIdAndRewardId(
        createRequestDto.userId,
        createRequestDto.eventId,
        createRequestDto.rewardId,
      );

    if (hasExistingRequest) {
      throw new ConflictException(
        'User already has a reward request for this event and reward',
      );
    }

    const event = await this.eventsService.findById(createRequestDto.eventId);
    if (event.status !== 'ACTIVE') {
      throw new BadRequestException('Event is not active');
    }

    const reward = await this.rewardsService.findById(
      createRequestDto.rewardId,
    );
    if (reward.eventId !== createRequestDto.eventId) {
      throw new BadRequestException(
        'Reward does not belong to the specified event',
      );
    }

    const conditions = await this.eventConditionsService.findByEventId(
      createRequestDto.eventId,
    );
    if (conditions.length === 0) {
      throw new BadRequestException('Event has no conditions defined');
    }

    const rewardRequest = createRequestDto.toDomain();
    rewardRequest.status = RewardRequestStatus.APPROVED;
    rewardRequest.processedAt = new Date();

    const createdRequest =
      await this.rewardRequestRepository.create(rewardRequest);
    return RewardRequestResponseDto.fromDomain(createdRequest);
  }

  async findAll(): Promise<RewardRequestResponseDto[]> {
    const requests = await this.rewardRequestRepository.findAll();
    return requests.map((request) =>
      RewardRequestResponseDto.fromDomain(request),
    );
  }

  async findById(id: string): Promise<RewardRequestResponseDto> {
    const request = await this.rewardRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundException(`Reward request with ID ${id} not found`);
    }
    return RewardRequestResponseDto.fromDomain(request);
  }

  async findByUserId(userId: string): Promise<RewardRequestResponseDto[]> {
    const requests = await this.rewardRequestRepository.findByUserId(userId);
    return requests.map((request) =>
      RewardRequestResponseDto.fromDomain(request),
    );
  }

  async findByEventId(eventId: string): Promise<RewardRequestResponseDto[]> {
    const requests = await this.rewardRequestRepository.findByEventId(eventId);
    return requests.map((request) =>
      RewardRequestResponseDto.fromDomain(request),
    );
  }

  async findByStatus(
    status: RewardRequestStatus,
  ): Promise<RewardRequestResponseDto[]> {
    const requests = await this.rewardRequestRepository.findByStatus(status);
    return requests.map((request) =>
      RewardRequestResponseDto.fromDomain(request),
    );
  }

  async update(
    id: string,
    updateRequestDto: UpdateRewardRequestDto,
  ): Promise<RewardRequestResponseDto> {
    const existingRequest = await this.rewardRequestRepository.findById(id);
    if (!existingRequest) {
      throw new NotFoundException(`Reward request with ID ${id} not found`);
    }

    if (updateRequestDto.status) {
      this.validateStatusTransition(
        existingRequest.status,
        updateRequestDto.status,
      );
    }

    if (
      updateRequestDto.status === RewardRequestStatus.APPROVED &&
      !updateRequestDto.processedAt
    ) {
      updateRequestDto.processedAt = new Date().toISOString();
    } else if (
      updateRequestDto.status === RewardRequestStatus.COMPLETED &&
      !updateRequestDto.completedAt
    ) {
      updateRequestDto.completedAt = new Date().toISOString();
    }

    const partialRequest = updateRequestDto.toPartialDomain();
    const updatedRequest = await this.rewardRequestRepository.update(
      id,
      partialRequest,
    );
    if (!updatedRequest) {
      throw new NotFoundException(`Reward request with ID ${id} not found`);
    }
    return RewardRequestResponseDto.fromDomain(updatedRequest);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.rewardRequestRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Reward request with ID ${id} not found`);
    }
  }

  private validateStatusTransition(
    currentStatus: RewardRequestStatus,
    newStatus: RewardRequestStatus,
  ): void {
    const validTransitions: Record<RewardRequestStatus, RewardRequestStatus[]> =
      {
        [RewardRequestStatus.REQUESTED]: [
          RewardRequestStatus.APPROVED,
          RewardRequestStatus.REJECTED,
        ],
        [RewardRequestStatus.APPROVED]: [RewardRequestStatus.COMPLETED],
        [RewardRequestStatus.REJECTED]: [],
        [RewardRequestStatus.COMPLETED]: [],
      };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
