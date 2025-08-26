import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Event } from '../../entities/event.entity';
import { createManyUsers } from '../factories/user.factory';
import { createManyEvents } from '../factories/event.factory';
import { seedUsers } from './data/users.seed';
import { seedEvents } from './data/events.seed';

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

    const users = this.userRepository.create(seedUsers);
    await this.userRepository.save(users);

    this.logger.log(`Created ${users.length} users`);
  }

  private async seedEvents(): Promise<void> {
    this.logger.log('Creating event data...');

    const events = this.eventRepository.create(seedEvents);
    await this.eventRepository.save(events);

    this.logger.log(`Created ${events.length} events`);
  }

  private async seedEventInvitees(): Promise<void> {
    this.logger.log('Creating event invitation relationships...');

    const users = await this.userRepository.find();
    const events = await this.eventRepository.find();

    for (const event of events) {
      let selectedInvitees: User[] = [];

      // Assign invitees based on event type
      if (event.title.includes('Team') || event.title.includes('Sprint') || 
          event.title.includes('Code Review') || event.title.includes('Architecture') ||
          event.title.includes('Tech Sharing') || event.title.includes('Engineering')) {
        // Tech/Engineering events: 3-6 people
        const inviteeCount = Math.floor(Math.random() * 4) + 3; // 3-6
        selectedInvitees = this.getRandomUsers(users, inviteeCount);
      } else if (event.title.includes('Product') || event.title.includes('Client') || 
                 event.title.includes('Customer') || event.title.includes('Roadmap')) {
        // Product/Client events: 4-7 people
        const inviteeCount = Math.floor(Math.random() * 4) + 4; // 4-7
        selectedInvitees = this.getRandomUsers(users, inviteeCount);
      } else if (event.title.includes('Kickoff') || event.title.includes('All Hands')) {
        // Large meetings: 8-12 people
        const inviteeCount = Math.floor(Math.random() * 5) + 8; // 8-12
        selectedInvitees = this.getRandomUsers(users, inviteeCount);
      } else if (event.title.includes('Workshop') || event.title.includes('Training') || 
                 event.title.includes('Learning') || event.title.includes('Development')) {
        // Training events: 5-8 people
        const inviteeCount = Math.floor(Math.random() * 4) + 5; // 5-8
        selectedInvitees = this.getRandomUsers(users, inviteeCount);
      } else if (event.title.includes('Coffee') || event.title.includes('Lunch') || 
                 event.title.includes('Happy Hour') || event.title.includes('Chat')) {
        // Social events: 2-4 people
        const inviteeCount = Math.floor(Math.random() * 3) + 2; // 2-4
        selectedInvitees = this.getRandomUsers(users, inviteeCount);
      } else if (event.title.includes('Design') || event.title.includes('Creative')) {
        // Design events: 3-5 people
        const inviteeCount = Math.floor(Math.random() * 3) + 3; // 3-5
        selectedInvitees = this.getRandomUsers(users, inviteeCount);
      } else {
        // Default: random 3-6 people
        const inviteeCount = Math.floor(Math.random() * 4) + 3; // 3-6
        selectedInvitees = this.getRandomUsers(users, inviteeCount);
      }

      event.invitees = selectedInvitees;
      await this.eventRepository.save(event);

      this.logger.log(`Event "${event.title}" assigned ${selectedInvitees.length} invitees`);
    }

    this.logger.log('Event invitation relationships created');
  }

  private getRandomUsers(users: User[], count: number): User[] {
    const shuffled = [...users].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, users.length));
  }

  async seedUsersOnly(count: number = 10): Promise<void> {
    this.logger.log(`Creating ${count} random users...`);

    const userData = createManyUsers(count);
    const users = this.userRepository.create(userData);
    await this.userRepository.save(users);

    this.logger.log(`Created ${users.length} users`);
  }

  async seedEventsOnly(count: number = 5): Promise<void> {
    this.logger.log(`Creating ${count} random events...`);

    const eventData = createManyEvents(count);
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
