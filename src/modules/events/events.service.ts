import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event, EventStatus } from '../../entities/event.entity';
import { User } from '../../entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Validate date range
    const startTime = new Date(createEventDto.startTime);
    const endTime = new Date(createEventDto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Validate invitees exist if provided
    let invitees: User[] = [];
    if (createEventDto.inviteeIds && createEventDto.inviteeIds.length > 0) {
      invitees = await this.userRepository.findBy({
        id: In(createEventDto.inviteeIds),
      });

      if (invitees.length !== createEventDto.inviteeIds.length) {
        const foundIds = invitees.map((user) => user.id);
        const missingIds = createEventDto.inviteeIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new BadRequestException(
          `Users not found: ${missingIds.join(', ')}`,
        );
      }
    }

    // Create event
    const event = this.eventRepository.create({
      title: createEventDto.title,
      description: createEventDto.description,
      status: createEventDto.status || EventStatus.TODO,
      startTime,
      endTime,
      invitees,
    });

    return await this.eventRepository.save(event);
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['invitees'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async delete(id: string): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    await this.eventRepository.remove(event);
  }
}
