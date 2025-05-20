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
  Request,
} from '@nestjs/common';
import { RewardRequestsService } from '../service/reward-requests.service';
import { CreateRewardRequestDto } from '../dto/request/create-reward-request.request.dto';
import { UpdateRewardRequestDto } from '../dto/request/update-reward-request.request.dto';
import { RewardRequestResponseDto } from '../dto/response/reward-request.response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/schemas/user.schema';
import { RewardRequestStatus } from '../domain/reward-request';

@Controller('reward-requests')
export class RewardRequestsController {
  constructor(private readonly rewardRequestsService: RewardRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: any,
    @Body() createRequestDto: CreateRewardRequestDto,
  ): Promise<RewardRequestResponseDto> {
    createRequestDto.userId = req.user.id;

    return this.rewardRequestsService.create(createRequestDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('eventId') eventId?: string,
    @Query('status') status?: RewardRequestStatus,
  ): Promise<RewardRequestResponseDto[]> {
    if (req.user.role === UserRole.USER) {
      return this.rewardRequestsService.findByUserId(req.user.id);
    }

    if (userId) {
      return this.rewardRequestsService.findByUserId(userId);
    }

    if (eventId) {
      return this.rewardRequestsService.findByEventId(eventId);
    }

    if (status) {
      return this.rewardRequestsService.findByStatus(status);
    }

    return this.rewardRequestsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<RewardRequestResponseDto> {
    const request = await this.rewardRequestsService.findById(id);

    if (req.user.role === UserRole.USER && request.userId !== req.user.id) {
      throw new Error('You are not authorized to view this reward request');
    }

    return request;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRewardRequestDto,
  ): Promise<RewardRequestResponseDto> {
    return this.rewardRequestsService.update(id, updateRequestDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.rewardRequestsService.delete(id);
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async findMyRequests(
    @Request() req: any,
  ): Promise<RewardRequestResponseDto[]> {
    return this.rewardRequestsService.findByUserId(req.user.id);
  }
}
