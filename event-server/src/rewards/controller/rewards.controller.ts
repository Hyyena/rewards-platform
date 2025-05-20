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
import { RewardsService } from '../service/rewards.service';
import { CreateRewardRequestDto } from '../dto/request/create-reward.request.dto';
import { UpdateRewardRequestDto } from '../dto/request/update-reward.request.dto';
import { RewardResponseDto } from '../dto/response/reward.response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/schemas/user.schema';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  async create(
    @Body() createRewardDto: CreateRewardRequestDto,
  ): Promise<RewardResponseDto> {
    return this.rewardsService.create(createRewardDto);
  }

  @Get()
  async findAll(
    @Query('eventId') eventId?: string,
  ): Promise<RewardResponseDto[]> {
    if (eventId) {
      return this.rewardsService.findByEventId(eventId);
    }
    return this.rewardsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RewardResponseDto> {
    return this.rewardsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateRewardDto: UpdateRewardRequestDto,
  ): Promise<RewardResponseDto> {
    return this.rewardsService.update(id, updateRewardDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.rewardsService.delete(id);
  }
}
