import { Controller, Post, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { MergeEventsResponseDto } from './dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(':id/merge-events')
  async mergeEvents(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MergeEventsResponseDto> {
    const result = await this.usersService.mergeAllEvents(id);
    return plainToInstance(MergeEventsResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}
