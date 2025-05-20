import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RewardRepository } from '../repository/reward.repository';
import { Reward } from '../domain/reward';
import { CreateRewardRequestDto } from '../dto/request/create-reward.request.dto';
import { UpdateRewardRequestDto } from '../dto/request/update-reward.request.dto';
import { RewardResponseDto } from '../dto/response/reward.response.dto';

@Injectable()
export class RewardsService {
  constructor(private readonly rewardRepository: RewardRepository) {}

  async create(
    createRewardDto: CreateRewardRequestDto,
  ): Promise<RewardResponseDto> {
    const existingReward = await this.rewardRepository.findByEventIdAndType(
      createRewardDto.eventId,
      createRewardDto.type,
    );

    if (existingReward) {
      throw new ConflictException(
        `Reward with event ID ${createRewardDto.eventId} and type ${createRewardDto.type} already exists`,
      );
    }

    const reward = createRewardDto.toDomain();
    const createdReward = await this.rewardRepository.create(reward);
    return RewardResponseDto.fromDomain(createdReward);
  }

  async findAll(): Promise<RewardResponseDto[]> {
    const rewards = await this.rewardRepository.findAll();
    return rewards.map((reward) => RewardResponseDto.fromDomain(reward));
  }

  async findById(id: string): Promise<RewardResponseDto> {
    const reward = await this.rewardRepository.findById(id);
    if (!reward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }
    return RewardResponseDto.fromDomain(reward);
  }

  async findByEventId(eventId: string): Promise<RewardResponseDto[]> {
    const rewards = await this.rewardRepository.findByEventId(eventId);
    return rewards.map((reward) => RewardResponseDto.fromDomain(reward));
  }

  async update(
    id: string,
    updateRewardDto: UpdateRewardRequestDto,
  ): Promise<RewardResponseDto> {
    const existingReward = await this.rewardRepository.findById(id);
    if (!existingReward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }

    if (updateRewardDto.eventId && updateRewardDto.type) {
      const rewardWithSameEventIdAndType =
        await this.rewardRepository.findByEventIdAndType(
          updateRewardDto.eventId,
          updateRewardDto.type,
        );

      if (
        rewardWithSameEventIdAndType &&
        rewardWithSameEventIdAndType.id !== id
      ) {
        throw new ConflictException(
          `Reward with event ID ${updateRewardDto.eventId} and type ${updateRewardDto.type} already exists`,
        );
      }
    }

    const partialReward = updateRewardDto.toPartialDomain();
    const updatedReward = await this.rewardRepository.update(id, partialReward);
    if (!updatedReward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }
    return RewardResponseDto.fromDomain(updatedReward);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.rewardRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }
  }

  async deleteByEventId(eventId: string): Promise<number> {
    return this.rewardRepository.deleteByEventId(eventId);
  }
}
