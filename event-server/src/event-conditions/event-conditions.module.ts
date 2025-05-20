import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventConditionDocument,
  EventConditionSchema,
} from './schemas/event-condition.schema';
import { EventConditionsController } from './controller/event-conditions.controller';
import { EventConditionsService } from './service/event-conditions.service';
import { EventConditionRepository } from './repository/event-condition.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventConditionDocument.name, schema: EventConditionSchema },
    ]),
  ],
  controllers: [EventConditionsController],
  providers: [EventConditionsService, EventConditionRepository],
  exports: [EventConditionsService],
})
export class EventConditionsModule {}
