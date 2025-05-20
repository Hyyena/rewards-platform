import {
  All,
  Body,
  Controller,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { EventProxyService } from '../services/event-proxy.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/interfaces/user-role.enum';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Controller()
export class EventProxyController {
  constructor(private readonly eventProxyService: EventProxyService) {}

  @All('events')
  getAllEvents(@Req() req: Request): Observable<any> {
    return this.eventProxyService.request(
      req.method,
      req.url,
      req.body,
      req.headers,
    );
  }

  @All('events/active')
  getActiveEvents(@Req() req: Request): Observable<any> {
    return this.eventProxyService.request(
      req.method,
      req.url,
      req.body,
      req.headers,
    );
  }

  @All('events/:id')
  getEvent(@Param('id') id: string, @Req() req: Request): Observable<any> {
    return this.eventProxyService.request(
      req.method,
      req.url,
      req.body,
      req.headers,
    );
  }

  @All('events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  createEvent(@Body() body: any, @Req() req: RequestWithUser): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('events/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  updateEvent(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('events/:id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  activateEvent(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, req.body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('events/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  deactivateEvent(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, req.body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('event-conditions')
  getEventConditions(
    @Query('eventId') eventId: string,
    @Req() req: Request,
  ): Observable<any> {
    return this.eventProxyService.request(
      req.method,
      req.url,
      req.body,
      req.headers,
    );
  }

  @All('event-conditions/:id')
  getEventCondition(
    @Param('id') id: string,
    @Req() req: Request,
  ): Observable<any> {
    return this.eventProxyService.request(
      req.method,
      req.url,
      req.body,
      req.headers,
    );
  }

  @All('event-conditions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  createEventCondition(
    @Body() body: any,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('event-conditions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  updateEventCondition(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('rewards')
  getRewards(
    @Query('eventId') eventId: string,
    @Req() req: Request,
  ): Observable<any> {
    return this.eventProxyService.request(
      req.method,
      req.url,
      req.body,
      req.headers,
    );
  }

  @All('rewards/:id')
  getReward(@Param('id') id: string, @Req() req: Request): Observable<any> {
    return this.eventProxyService.request(
      req.method,
      req.url,
      req.body,
      req.headers,
    );
  }

  @All('rewards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  createReward(
    @Body() body: any,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('rewards/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  updateReward(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('reward-requests')
  @UseGuards(JwtAuthGuard)
  getRewardRequests(
    @Query('userId') userId: string,
    @Query('eventId') eventId: string,
    @Query('status') status: string,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, req.body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('reward-requests/:id')
  @UseGuards(JwtAuthGuard)
  getRewardRequest(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, req.body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('reward-requests')
  @UseGuards(JwtAuthGuard)
  createRewardRequest(
    @Body() body: any,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(
      req.method,
      req.url,
      {
        ...body,
        userId: req.user.id,
      },
      {
        ...req.headers,
        Authorization: req.headers.authorization,
      },
    );
  }

  @All('reward-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  updateRewardRequest(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: RequestWithUser,
  ): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }

  @All('reward-requests/user/me')
  @UseGuards(JwtAuthGuard)
  getMyRewardRequests(@Req() req: RequestWithUser): Observable<any> {
    return this.eventProxyService.request(req.method, req.url, req.body, {
      ...req.headers,
      Authorization: req.headers.authorization,
    });
  }
}
