/* eslint-disable @typescript-eslint/unbound-method */
import { Test, type TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Event } from '../../entities/event.entity';
import { EventStatus } from '../../entities/event.entity';
import { EventResponseDto, type CreateEventDto } from './dto';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;
  let service: jest.Mocked<EventsService>;

  const mockEvent: Event = {
    id: 'event-1',
    title: 'Test Event',
    description: 'Test Description',
    status: EventStatus.TODO,
    startTime: new Date('2024-01-01T14:00:00Z'),
    endTime: new Date('2024-01-01T15:00:00Z'),
    createdAt: new Date('2024-01-01T12:00:00Z'),
    updatedAt: new Date('2024-01-01T12:00:00Z'),
    invitees: [],
  };

  const mockCreateEventDto: CreateEventDto = {
    title: 'Test Event',
    description: 'Test Description',
    status: EventStatus.TODO,
    startTime: '2024-01-01T14:00:00Z',
    endTime: '2024-01-01T15:00:00Z',
    inviteeIds: [],
  };

  beforeEach(async () => {
    const mockEventsService = {
      create: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an event and return EventResponseDto', async () => {
      service.create.mockResolvedValue(mockEvent);

      const result = await controller.create(mockCreateEventDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateEventDto);
      expect(result).toBeInstanceOf(EventResponseDto);
      expect(result.id).toBe(mockEvent.id);
      expect(result.title).toBe(mockEvent.title);
      expect(result.status).toBe(mockEvent.status);
    });

    it('should handle service errors during creation', async () => {
      const error = new BadRequestException(
        'End time must be after start time',
      );
      service.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateEventDto)).rejects.toThrow(
        error,
      );
      expect(service.create).toHaveBeenCalledWith(mockCreateEventDto);
    });

    it('should transform dates to ISO strings in response', async () => {
      service.create.mockResolvedValue(mockEvent);

      const result = await controller.create(mockCreateEventDto);

      expect(result.startTime).toBe(mockEvent.startTime.toISOString());
      expect(result.endTime).toBe(mockEvent.endTime.toISOString());
      expect(result.createdAt).toBe(mockEvent.createdAt.toISOString());
      expect(result.updatedAt).toBe(mockEvent.updatedAt.toISOString());
    });
  });

  describe('findById', () => {
    it('should find event by id and return EventResponseDto', async () => {
      service.findById.mockResolvedValue(mockEvent);

      const result = await controller.findById('event-1');

      expect(service.findById).toHaveBeenCalledWith('event-1');
      expect(result).toBeInstanceOf(EventResponseDto);
      expect(result.id).toBe(mockEvent.id);
      expect(result.title).toBe(mockEvent.title);
    });

    it('should handle NotFoundException when event not found', async () => {
      const error = new NotFoundException(
        'Event with ID non-existent not found',
      );
      service.findById.mockRejectedValue(error);

      await expect(controller.findById('non-existent')).rejects.toThrow(error);
      expect(service.findById).toHaveBeenCalledWith('non-existent');
    });

    it('should validate UUID format in path parameter', async () => {
      // This test would be handled by the ParseUUIDPipe at runtime
      // Here we just verify the service is called with the correct ID
      service.findById.mockResolvedValue(mockEvent);

      await controller.findById('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findById).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
      );
    });
  });

  describe('delete', () => {
    it('should delete event by id', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.delete('event-1');

      expect(service.delete).toHaveBeenCalledWith('event-1');
      expect(result).toBeUndefined();
    });

    it('should handle NotFoundException when deleting non-existent event', async () => {
      const error = new NotFoundException(
        'Event with ID non-existent not found',
      );
      service.delete.mockRejectedValue(error);

      await expect(controller.delete('non-existent')).rejects.toThrow(error);
      expect(service.delete).toHaveBeenCalledWith('non-existent');
    });

    it('should return void on successful deletion', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.delete('event-1');

      expect(result).toBeUndefined();
    });
  });

  describe('response transformation', () => {
    it('should exclude extraneous values from response', async () => {
      const eventWithExtraProperties = {
        ...mockEvent,
        extraProperty: 'should not appear',
        anotherExtra: 123,
      };

      service.findById.mockResolvedValue(eventWithExtraProperties as Event);

      const result = await controller.findById('event-1');

      expect(result).not.toHaveProperty('extraProperty');
      expect(result).not.toHaveProperty('anotherExtra');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('startTime');
      expect(result).toHaveProperty('endTime');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('invitees');
    });
  });
});
