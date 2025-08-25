import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Event } from '../../entities/event.entity';
import {
  createRealisticUsers,
  createManyUsers,
} from '../factories/user.factory';
import {
  createRealisticEvents,
  createManyEvents,
} from '../factories/event.factory';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async seedAll(): Promise<void> {
    this.logger.log('Starting database seeding...');

    try {
      await this.clearDatabase();
      await this.seedUsers();
      await this.seedEvents();
      await this.seedEventInvitees();

      this.logger.log('Database seeding completed!');
    } catch (error) {
      this.logger.error('Database seeding failed', error);
      throw error;
    }
  }

  async clearDatabase(): Promise<void> {
    this.logger.log('Clearing existing data...');

    try {
      // Delete in order due to foreign key constraints
      await this.eventRepository.query('DELETE FROM event_invitees');

      // Check if data exists before deletion
      const eventCount = await this.eventRepository.count();
      if (eventCount > 0) {
        await this.eventRepository.clear();
      }

      const userCount = await this.userRepository.count();
      if (userCount > 0) {
        await this.userRepository.clear();
      }
    } catch (error) {
      // Ignore errors if tables don't exist
      this.logger.warn(
        'Warning occurred while clearing data, table may not exist:',
        (error as Error).message,
      );
    }

    this.logger.log('Data clearing completed');
  }

  private async seedUsers(): Promise<void> {
    this.logger.log('Creating user data...');

    const userData = createRealisticUsers();
    const users = this.userRepository.create(userData);
    await this.userRepository.save(users);

    this.logger.log(`Created ${users.length} users`);
  }

  private async seedEvents(): Promise<void> {
    this.logger.log('Creating event data...');

    const eventData = createRealisticEvents();
    const events = this.eventRepository.create(eventData);
    await this.eventRepository.save(events);

    this.logger.log(`Created ${events.length} events`);
  }

  private async seedEventInvitees(): Promise<void> {
    this.logger.log('Creating event invitation relationships...');

    const users = await this.userRepository.find();
    const events = await this.eventRepository.find();

    for (const event of events) {
      // Randomly assign 2-5 invitees to each event
      const inviteeCount = Math.floor(Math.random() * 4) + 2; // 2-5
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      const selectedInvitees = shuffledUsers.slice(0, inviteeCount);

      event.invitees = selectedInvitees;
      await this.eventRepository.save(event);
    }

    this.logger.log('Event invitation relationships created');
  }

  async seedUsersOnly(count: number = 10): Promise<void> {
    this.logger.log(`Creating ${count} random users...`);

    const userData = await createManyUsers(count);
    const users = this.userRepository.create(userData);
    await this.userRepository.save(users);

    this.logger.log(`Created ${users.length} users`);
  }

  async seedEventsOnly(count: number = 5): Promise<void> {
    this.logger.log(`Creating ${count} random events...`);

    const eventData = await createManyEvents(count);
    const events = this.eventRepository.create(eventData);
    await this.eventRepository.save(events);

    this.logger.log(`Created ${events.length} events`);
  }

  async getStats(): Promise<{
    users: number;
    events: number;
    relationships: number;
  }> {
    const userCount = await this.userRepository.count();
    const eventCount = await this.eventRepository.count();

    // Count relationships - using simpler query approach
    const events = await this.eventRepository.find({ relations: ['invitees'] });
    const relationshipCount = events.reduce(
      (sum, event) => sum + event.invitees.length,
      0,
    );

    return {
      users: userCount,
      events: eventCount,
      relationships: relationshipCount,
    };
  }
}
