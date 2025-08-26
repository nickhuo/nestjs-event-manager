import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from './users.service';
import { Event, EventStatus } from '../../entities/event.entity';
import { User } from '../../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let eventRepository: jest.Mocked<Repository<Event>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockUser: User = {
    id: 'user-1',
    name: 'Test User',
    events: [],
  };

  const mockEvent1: Event = {
    id: 'event-1',
    title: 'Meeting A',
    description: 'First meeting',
    status: EventStatus.TODO,
    startTime: new Date('2024-01-01T14:00:00Z'),
    endTime: new Date('2024-01-01T15:00:00Z'),
    invitees: [mockUser],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEvent2: Event = {
    id: 'event-2',
    title: 'Meeting B',
    description: 'Second meeting',
    status: EventStatus.IN_PROGRESS,
    startTime: new Date('2024-01-01T14:45:00Z'),
    endTime: new Date('2024-01-01T16:00:00Z'),
    invitees: [mockUser],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNonOverlappingEvent: Event = {
    id: 'event-3',
    title: 'Meeting C',
    description: 'Third meeting',
    status: EventStatus.COMPLETED,
    startTime: new Date('2024-01-01T17:00:00Z'),
    endTime: new Date('2024-01-01T18:00:00Z'),
    invitees: [mockUser],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockEventRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const mockDataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    eventRepository = module.get(getRepositoryToken(Event));
    userRepository = module.get(getRepositoryToken(User));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mergeAllEvents', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.mergeAllEvents('non-existent-user')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return no action needed when user has no events', async () => {
      const userWithNoEvents = { ...mockUser, events: [] };
      userRepository.findOne.mockResolvedValue(userWithNoEvents);

      const result = await service.mergeAllEvents('user-1');

      expect(result).toEqual({
        userId: 'user-1',
        operation: 'merge_completed',
        summary: {
          originalEventCount: 0,
          overlappingEventCount: 0,
          overlappingGroups: 0,
          mergedEventCount: 0,
          remainingEventCount: 0,
        },
        mergedEvents: [],
      });
    });

    it('should return no action needed when user has only one event', async () => {
      const userWithOneEvent = { ...mockUser, events: [mockEvent1] };
      userRepository.findOne.mockResolvedValue(userWithOneEvent);

      const result = await service.mergeAllEvents('user-1');

      expect(result).toEqual({
        userId: 'user-1',
        operation: 'merge_completed',
        summary: {
          originalEventCount: 1,
          overlappingEventCount: 0,
          overlappingGroups: 0,
          mergedEventCount: 0,
          remainingEventCount: 1,
        },
        mergedEvents: [],
      });
    });

    it('should return no action needed when events do not overlap', async () => {
      const userWithNonOverlappingEvents = {
        ...mockUser,
        events: [mockEvent1, mockNonOverlappingEvent],
      };
      userRepository.findOne.mockResolvedValue(userWithNonOverlappingEvents);

      const result = await service.mergeAllEvents('user-1');

      expect(result).toEqual({
        userId: 'user-1',
        operation: 'merge_completed',
        summary: {
          originalEventCount: 2,
          overlappingEventCount: 0,
          overlappingGroups: 0,
          mergedEventCount: 0,
          remainingEventCount: 2,
        },
        mergedEvents: [],
      });
    });

    it('should merge overlapping events successfully', async () => {
      const userWithOverlappingEvents = {
        ...mockUser,
        events: [mockEvent1, mockEvent2],
      };
      userRepository.findOne.mockResolvedValue(userWithOverlappingEvents);

      const mergedEvent = {
        id: 'merged-event-1',
        title: 'Meeting A + Meeting B',
        description: 'Event 1: First meeting\n---\nEvent 2: Second meeting',
        status: EventStatus.IN_PROGRESS,
        startTime: new Date('2024-01-01T14:00:00Z'),
        endTime: new Date('2024-01-01T16:00:00Z'),
        invitees: [mockUser],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dataSource.transaction.mockImplementation(async (callback: any) => {
        const mockManager = {
          remove: jest.fn(),
          create: jest.fn().mockReturnValue(mergedEvent),
          save: jest.fn().mockResolvedValue(mergedEvent),
        };
        return await callback(mockManager);
      });

      const result = await service.mergeAllEvents('user-1');

      expect(result.summary).toEqual({
        originalEventCount: 2,
        overlappingEventCount: 2,
        overlappingGroups: 1,
        mergedEventCount: 1,
        remainingEventCount: 1,
      });

      expect(result.mergedEvents).toHaveLength(1);
      expect(result.mergedEvents[0].title).toBe('Meeting A + Meeting B');
      expect(result.mergedEvents[0].originalEventIds).toEqual([
        'event-1',
        'event-2',
      ]);
    });
  });

  describe('overlap detection algorithm', () => {
    it('should detect overlapping events correctly', () => {
      const overlaps = (service as any).eventsOverlap(mockEvent1, mockEvent2);
      expect(overlaps).toBe(true);
    });

    it('should detect non-overlapping events correctly', () => {
      const overlaps = (service as any).eventsOverlap(
        mockEvent1,
        mockNonOverlappingEvent,
      );
      expect(overlaps).toBe(false);
    });
  });

  describe('attribute merging', () => {
    it('should merge event attributes correctly', () => {
      const mergedEvent = (service as any).createMergedEvent([
        mockEvent1,
        mockEvent2,
      ]);

      expect(mergedEvent.title).toBe('Meeting A + Meeting B');
      expect(mergedEvent.description).toBe(
        'Event 1: First meeting\n---\nEvent 2: Second meeting',
      );
      expect(mergedEvent.status).toBe(EventStatus.IN_PROGRESS); // Higher priority
      expect(mergedEvent.startTime).toEqual(new Date('2024-01-01T14:00:00Z')); // Earlier start
      expect(mergedEvent.endTime).toEqual(new Date('2024-01-01T16:00:00Z')); // Later end
    });
  });
});
