import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventDocument, EventSchema } from './schemas/event.schema';
import { EventsController } from './controller/events.controller';
import { EventsService } from './service/events.service';
import { EventRepository } from './repository/event.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventDocument.name, schema: EventSchema },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventRepository],
  exports: [EventsService],
})
export class EventsModule {}
