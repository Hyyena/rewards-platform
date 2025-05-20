import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RewardDocument } from '../schemas/reward.schema';
import { Reward } from '../domain/reward';

@Injectable()
export class RewardRepository {
  constructor(
    @InjectModel(RewardDocument.name)
    private readonly rewardModel: Model<RewardDocument>,
  ) {}

  async create(reward: Reward): Promise<Reward> {
    const createdReward = await this.rewardModel.create(reward.toSchema());
    return createdReward.toReward();
  }

  async findAll(): Promise<Reward[]> {
    const rewards = await this.rewardModel.find().exec();
    return rewards.map((reward) => reward.toReward());
  }

  async findById(id: string): Promise<Reward | null> {
    const reward = await this.rewardModel.findById(id).exec();
    return reward ? reward.toReward() : null;
  }

  async findByEventId(eventId: string): Promise<Reward[]> {
    const rewards = await this.rewardModel.find({ eventId }).exec();
    return rewards.map((reward) => reward.toReward());
  }

  async findByEventIdAndType(
    eventId: string,
    type: string,
  ): Promise<Reward | null> {
    const reward = await this.rewardModel.findOne({ eventId, type }).exec();
    return reward ? reward.toReward() : null;
  }

  async update(id: string, reward: Partial<Reward>): Promise<Reward | null> {
    const updatedReward = await this.rewardModel
      .findByIdAndUpdate(id, reward, { new: true })
      .exec();
    return updatedReward ? updatedReward.toReward() : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.rewardModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async deleteByEventId(eventId: string): Promise<number> {
    const result = await this.rewardModel.deleteMany({ eventId }).exec();
    return result.deletedCount || 0;
  }
}
