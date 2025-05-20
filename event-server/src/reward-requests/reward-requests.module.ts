import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RewardRequestDocument,
  RewardRequestSchema,
} from './schemas/reward-request.schema';
import { RewardRequestsController } from './controller/reward-requests.controller';
import { RewardRequestsService } from './service/reward-requests.service';
import { RewardRequestRepository } from './repository/reward-request.repository';
import { EventsModule } from '../events/events.module';
import { RewardsModule } from '../rewards/rewards.module';
import { EventConditionsModule } from '../event-conditions/event-conditions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RewardRequestDocument.name, schema: RewardRequestSchema },
    ]),
    EventsModule,
    RewardsModule,
    EventConditionsModule,
  ],
  controllers: [RewardRequestsController],
  providers: [RewardRequestsService, RewardRequestRepository],
  exports: [RewardRequestsService],
})
export class RewardRequestsModule {}
