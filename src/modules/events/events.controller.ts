import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { EventsService } from './events.service';
import { CreateEventDto, EventResponseDto } from './dto';

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(
    @Body(ValidationPipe) createEventDto: CreateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.create(createEventDto);
    return plainToInstance(EventResponseDto, event, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.findById(id);
    return plainToInstance(EventResponseDto, event, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.eventsService.delete(id);
  }
}
