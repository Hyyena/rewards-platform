import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardEntity, RewardSchema } from './schemas/reward.schema';
import { RewardsController } from './controller/rewards.controller';
import { RewardsService } from './service/rewards.service';
import { RewardRepository } from './repository/reward.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RewardEntity.name, schema: RewardSchema },
    ]),
  ],
  controllers: [RewardsController],
  providers: [RewardsService, RewardRepository],
  exports: [RewardsService],
})
export class RewardsModule {}
