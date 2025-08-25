import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../../entities/event.entity';
import { User } from '../../entities/user.entity';
import { getDatabaseConfig } from '../../config/database.config';
import { SeedService } from './seed.service';
import type { Repository } from 'typeorm';

describe('SeedService', () => {
  let service: SeedService;
  let userRepository: Repository<User>;
  let eventRepository: Repository<Event>;
  let module: TestingModule;

  beforeAll(async () => {
    // Set up test environment
    process.env.NODE_ENV = 'test';

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getDatabaseConfig()),
        TypeOrmModule.forFeature([User, Event]),
      ],
      providers: [SeedService],
    }).compile();

    service = module.get<SeedService>(SeedService);
    userRepository = module.get('UserRepository');
    eventRepository = module.get('EventRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await service.clearDatabase();
  });

  describe('clearDatabase', () => {
    it('should clear all data', async () => {
      // Add some test data first
      const user = userRepository.create({ name: 'Test User' });
      await userRepository.save(user);

      const event = eventRepository.create({
        title: 'Test Event',
        description: 'Test Description',
        startTime: new Date(),
        endTime: new Date(),
      });
      await eventRepository.save(event);

      // Verify data exists
      expect(await userRepository.count()).toBeGreaterThan(0);
      expect(await eventRepository.count()).toBeGreaterThan(0);

      // Clear database
      await service.clearDatabase();

      // Verify data is cleared
      expect(await userRepository.count()).toBe(0);
      expect(await eventRepository.count()).toBe(0);
    });
  });

  describe('seedUsersOnly', () => {
    it('should create specified number of users', async () => {
      const count = 5;
      await service.seedUsersOnly(count);

      const userCount = await userRepository.count();
      expect(userCount).toBe(count);

      // Verify users have names
      const users = await userRepository.find();
      users.forEach((user) => {
        expect(user.name).toBeDefined();
        expect(typeof user.name).toBe('string');
        expect(user.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('seedEventsOnly', () => {
    it('should create specified number of events', async () => {
      const count = 3;
      await service.seedEventsOnly(count);

      const eventCount = await eventRepository.count();
      expect(eventCount).toBe(count);

      // Verify events have required fields
      const events = await eventRepository.find();
      events.forEach((event) => {
        expect(event.title).toBeDefined();
        expect(event.startTime).toBeDefined();
        expect(event.endTime).toBeDefined();
        expect(event.startTime).toBeInstanceOf(Date);
        expect(event.endTime).toBeInstanceOf(Date);
        expect(event.endTime.getTime()).toBeGreaterThan(
          event.startTime.getTime(),
        );
      });
    });
  });

  describe('seedAll', () => {
    it('should create users, events and relationships', async () => {
      await service.seedAll();

      const stats = await service.getStats();

      // Verify data has been created
      expect(stats.users).toBeGreaterThan(0);
      expect(stats.events).toBeGreaterThan(0);
      expect(stats.relationships).toBeGreaterThan(0);

      // Verify relationships exist
      const events = await eventRepository.find({ relations: ['invitees'] });
      const eventsWithInvitees = events.filter(
        (event) => event.invitees.length > 0,
      );
      expect(eventsWithInvitees.length).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      // Create test data
      const user1 = userRepository.create({ name: 'User 1' });
      const user2 = userRepository.create({ name: 'User 2' });
      await userRepository.save([user1, user2]);

      const event = eventRepository.create({
        title: 'Test Event',
        description: 'Test Description',
        startTime: new Date(),
        endTime: new Date(),
        invitees: [user1, user2],
      });
      await eventRepository.save(event);

      const stats = await service.getStats();

      expect(stats.users).toBe(2);
      expect(stats.events).toBe(1);
      expect(stats.relationships).toBe(2);
    });
  });
});
