import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RewardRequestDocument,
  RewardRequestEntity,
} from '../schemas/reward-request.schema';
import { RewardRequest, RewardRequestStatus } from '../domain/reward-request';

@Injectable()
export class RewardRequestRepository {
  constructor(
    @InjectModel(RewardRequestEntity.name)
    private readonly rewardRequestModel: Model<RewardRequestDocument>,
  ) {}

  async create(rewardRequest: RewardRequest): Promise<RewardRequest> {
    const createdRequest = await this.rewardRequestModel.create(
      rewardRequest.toSchema(),
    );
    return createdRequest.toRewardRequest();
  }

  async findAll(): Promise<RewardRequest[]> {
    const requests = await this.rewardRequestModel.find().exec();
    return requests.map((request) => request.toRewardRequest());
  }

  async findById(id: string): Promise<RewardRequest | null> {
    const request = await this.rewardRequestModel.findById(id).exec();
    return request ? request.toRewardRequest() : null;
  }

  async findByUserId(userId: string): Promise<RewardRequest[]> {
    const requests = await this.rewardRequestModel.find({ userId }).exec();
    return requests.map((request) => request.toRewardRequest());
  }

  async findByEventId(eventId: string): Promise<RewardRequest[]> {
    const requests = await this.rewardRequestModel.find({ eventId }).exec();
    return requests.map((request) => request.toRewardRequest());
  }

  async findByUserIdAndEventId(
    userId: string,
    eventId: string,
  ): Promise<RewardRequest[]> {
    const requests = await this.rewardRequestModel
      .find({ userId, eventId })
      .exec();
    return requests.map((request) => request.toRewardRequest());
  }

  async findByUserIdAndRewardId(
    userId: string,
    rewardId: string,
  ): Promise<RewardRequest[]> {
    const requests = await this.rewardRequestModel
      .find({ userId, rewardId })
      .exec();
    return requests.map((request) => request.toRewardRequest());
  }

  async findByIdempotencyKey(
    requestIdempotencyKey: string,
  ): Promise<RewardRequest | null> {
    const request = await this.rewardRequestModel
      .findOne({ requestIdempotencyKey })
      .exec();
    return request ? request.toRewardRequest() : null;
  }

  async findByStatus(status: RewardRequestStatus): Promise<RewardRequest[]> {
    const requests = await this.rewardRequestModel.find({ status }).exec();
    return requests.map((request) => request.toRewardRequest());
  }

  async update(
    id: string,
    rewardRequest: Partial<RewardRequest>,
  ): Promise<RewardRequest | null> {
    const updatedRequest = await this.rewardRequestModel
      .findByIdAndUpdate(id, rewardRequest, { new: true })
      .exec();
    return updatedRequest ? updatedRequest.toRewardRequest() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.rewardRequestModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async existsByUserIdAndEventIdAndRewardId(
    userId: string,
    eventId: string,
    rewardId: string,
  ): Promise<boolean> {
    const count = await this.rewardRequestModel.countDocuments({
      userId,
      eventId,
      rewardId,
      status: {
        $in: [
          RewardRequestStatus.REQUESTED,
          RewardRequestStatus.APPROVED,
          RewardRequestStatus.COMPLETED,
        ],
      },
    });
    return count > 0;
  }
}
