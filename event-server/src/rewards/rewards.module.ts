import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardDocument, RewardSchema } from './schemas/reward.schema';
import { RewardsController } from './controller/rewards.controller';
import { RewardsService } from './service/rewards.service';
import { RewardRepository } from './repository/reward.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RewardDocument.name, schema: RewardSchema },
    ]),
  ],
  controllers: [RewardsController],
  providers: [RewardsService, RewardRepository],
  exports: [RewardsService],
})
export class RewardsModule {}
