import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { EventConditionsService } from '../service/event-conditions.service';
import { CreateEventConditionRequestDto } from '../dto/request/create-event-condition.request.dto';
import { UpdateEventConditionRequestDto } from '../dto/request/update-event-condition.request.dto';
import { EventConditionResponseDto } from '../dto/response/event-condition.response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/schemas/user.schema';

@Controller('event-conditions')
export class EventConditionsController {
  constructor(
    private readonly eventConditionsService: EventConditionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  async create(
    @Body() createConditionDto: CreateEventConditionRequestDto,
  ): Promise<EventConditionResponseDto> {
    return this.eventConditionsService.create(createConditionDto);
  }

  @Get()
  async findAll(
    @Query('eventId') eventId?: string,
  ): Promise<EventConditionResponseDto[]> {
    if (eventId) {
      return this.eventConditionsService.findByEventId(eventId);
    }
    return this.eventConditionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EventConditionResponseDto> {
    return this.eventConditionsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateConditionDto: UpdateEventConditionRequestDto,
  ): Promise<EventConditionResponseDto> {
    return this.eventConditionsService.update(id, updateConditionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.eventConditionsService.delete(id);
  }
}
