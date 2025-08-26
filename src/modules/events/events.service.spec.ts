/* eslint-disable @typescript-eslint/unbound-method */
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { In, type Repository } from 'typeorm';
import { Event, EventStatus } from '../../entities/event.entity';
import { User } from '../../entities/user.entity';
import type { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let eventRepository: jest.Mocked<Repository<Event>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser1: User = {
    id: 'user-1',
    name: 'Test User 1',
    events: [],
  };

  const mockUser2: User = {
    id: 'user-2',
    name: 'Test User 2',
    events: [],
  };

  const mockEvent: Event = {
    id: 'event-1',
    title: 'Test Event',
    description: 'Test Description',
    status: EventStatus.TODO,
    startTime: new Date('2024-01-01T14:00:00Z'),
    endTime: new Date('2024-01-01T15:00:00Z'),
    createdAt: new Date('2024-01-01T12:00:00Z'),
    updatedAt: new Date('2024-01-01T12:00:00Z'),
    invitees: [mockUser1, mockUser2],
  };

  const mockCreateEventDto: CreateEventDto = {
    title: 'Test Event',
    description: 'Test Description',
    status: EventStatus.TODO,
    startTime: '2024-01-01T14:00:00Z',
    endTime: '2024-01-01T15:00:00Z',
    inviteeIds: ['user-1', 'user-2'],
  };

  beforeEach(async () => {
    const mockEventRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const mockUserRepository = {
      findBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventRepository = module.get(getRepositoryToken(Event));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      eventRepository.create.mockReturnValue(mockEvent);
      eventRepository.save.mockResolvedValue(mockEvent);
      userRepository.findBy.mockResolvedValue([mockUser1, mockUser2]);
    });

    it('should create an event successfully', async () => {
      const result = await service.create(mockCreateEventDto);

      expect(userRepository.findBy).toHaveBeenCalledWith({
        id: In(['user-1', 'user-2']),
      });
      expect(eventRepository.create).toHaveBeenCalledWith({
        title: 'Test Event',
        description: 'Test Description',
        status: EventStatus.TODO,
        startTime: new Date('2024-01-01T14:00:00Z'),
        endTime: new Date('2024-01-01T15:00:00Z'),
        invitees: [mockUser1, mockUser2],
      });
      expect(eventRepository.save).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });

    it('should create event without invitees when none provided', async () => {
      const dtoWithoutInvitees = {
        ...mockCreateEventDto,
        inviteeIds: undefined,
      };

      await service.create(dtoWithoutInvitees);

      expect(userRepository.findBy).not.toHaveBeenCalled();
      expect(eventRepository.create).toHaveBeenCalledWith({
        title: 'Test Event',
        description: 'Test Description',
        status: EventStatus.TODO,
        startTime: new Date('2024-01-01T14:00:00Z'),
        endTime: new Date('2024-01-01T15:00:00Z'),
        invitees: [],
      });
    });

    it('should create event with empty invitees when empty array provided', async () => {
      const dtoWithEmptyInvitees = {
        ...mockCreateEventDto,
        inviteeIds: [],
      };

      await service.create(dtoWithEmptyInvitees);

      expect(userRepository.findBy).not.toHaveBeenCalled();
      expect(eventRepository.create).toHaveBeenCalledWith({
        title: 'Test Event',
        description: 'Test Description',
        status: EventStatus.TODO,
        startTime: new Date('2024-01-01T14:00:00Z'),
        endTime: new Date('2024-01-01T15:00:00Z'),
        invitees: [],
      });
    });

    it('should use default status TODO when not provided', async () => {
      const dtoWithoutStatus = {
        ...mockCreateEventDto,
        status: undefined,
      };

      await service.create(dtoWithoutStatus);

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: EventStatus.TODO,
        }),
      );
    });

    it('should throw BadRequestException when end time is before start time', async () => {
      const invalidDto = {
        ...mockCreateEventDto,
        startTime: '2024-01-01T15:00:00Z',
        endTime: '2024-01-01T14:00:00Z',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        new BadRequestException('End time must be after start time'),
      );
    });

    it('should throw BadRequestException when end time equals start time', async () => {
      const invalidDto = {
        ...mockCreateEventDto,
        startTime: '2024-01-01T14:00:00Z',
        endTime: '2024-01-01T14:00:00Z',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        new BadRequestException('End time must be after start time'),
      );
    });

    it('should throw BadRequestException when some invitees do not exist', async () => {
      userRepository.findBy.mockResolvedValue([mockUser1]); // Only one user found

      await expect(service.create(mockCreateEventDto)).rejects.toThrow(
        new BadRequestException('Users not found: user-2'),
      );
    });

    it('should throw BadRequestException when no invitees exist', async () => {
      userRepository.findBy.mockResolvedValue([]); // No users found

      await expect(service.create(mockCreateEventDto)).rejects.toThrow(
        new BadRequestException('Users not found: user-1, user-2'),
      );
    });

    it('should handle partial missing invitees with proper error message', async () => {
      const dtoWithThreeInvitees = {
        ...mockCreateEventDto,
        inviteeIds: ['user-1', 'user-2', 'user-3'],
      };
      userRepository.findBy.mockResolvedValue([mockUser1]); // Only first user found

      await expect(service.create(dtoWithThreeInvitees)).rejects.toThrow(
        new BadRequestException('Users not found: user-2, user-3'),
      );
    });
  });

  describe('findById', () => {
    it('should find and return event by id', async () => {
      eventRepository.findOne.mockResolvedValue(mockEvent);

      const result = await service.findById('event-1');

      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        relations: ['invitees'],
      });
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      eventRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        new NotFoundException('Event with ID non-existent not found'),
      );
    });

    it('should include invitees relation in query', async () => {
      eventRepository.findOne.mockResolvedValue(mockEvent);

      await service.findById('event-1');

      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        relations: ['invitees'],
      });
    });
  });

  describe('delete', () => {
    it('should delete event successfully', async () => {
      eventRepository.findOne.mockResolvedValue(mockEvent);
      eventRepository.remove.mockResolvedValue(mockEvent);

      await service.delete('event-1');

      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'event-1' },
      });
      expect(eventRepository.remove).toHaveBeenCalledWith(mockEvent);
    });

    it('should throw NotFoundException when trying to delete non-existent event', async () => {
      eventRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        new NotFoundException('Event with ID non-existent not found'),
      );
    });

    it('should not call remove when event does not exist', async () => {
      eventRepository.findOne.mockResolvedValue(null);

      try {
        await service.delete('non-existent');
      } catch {
        // Expected error
      }

      expect(eventRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('date validation', () => {
    it('should accept valid date strings', async () => {
      userRepository.findBy.mockResolvedValue([]);
      eventRepository.create.mockReturnValue(mockEvent);
      eventRepository.save.mockResolvedValue(mockEvent);

      const validDto = {
        ...mockCreateEventDto,
        startTime: '2024-12-25T10:30:00.000Z',
        endTime: '2024-12-25T11:30:00.000Z',
        inviteeIds: [],
      };

      await service.create(validDto);

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: new Date('2024-12-25T10:30:00.000Z'),
          endTime: new Date('2024-12-25T11:30:00.000Z'),
        }),
      );
    });

    it('should handle different date formats correctly', async () => {
      userRepository.findBy.mockResolvedValue([]);
      eventRepository.create.mockReturnValue(mockEvent);
      eventRepository.save.mockResolvedValue(mockEvent);

      const validDto = {
        ...mockCreateEventDto,
        startTime: '2024-06-15T14:00:00Z',
        endTime: '2024-06-15T16:00:00Z',
        inviteeIds: [],
      };

      await service.create(validDto);

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: new Date('2024-06-15T14:00:00Z'),
          endTime: new Date('2024-06-15T16:00:00Z'),
        }),
      );
    });
  });

  describe('status handling', () => {
    it('should accept all valid status values', async () => {
      userRepository.findBy.mockResolvedValue([]);
      eventRepository.create.mockReturnValue(mockEvent);
      eventRepository.save.mockResolvedValue(mockEvent);

      for (const status of Object.values(EventStatus)) {
        const dtoWithStatus = {
          ...mockCreateEventDto,
          status,
          inviteeIds: [],
        };

        await service.create(dtoWithStatus);

        expect(eventRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ status }),
        );
      }
    });
  });
});

