import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthProxyService } from './services/auth-proxy.service';
import { EventProxyService } from './services/event-proxy.service';
import { AuthProxyController } from './controllers/auth-proxy.controller';
import { EventProxyController } from './controllers/event-proxy.controller';

@Module({
  imports: [HttpModule],
  controllers: [AuthProxyController, EventProxyController],
  providers: [AuthProxyService, EventProxyService],
})
export class ProxyModule {}
