import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MergeEventsResponseDto } from './dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockMergeResponse: MergeEventsResponseDto = {
    userId: 'user-1',
    operation: 'merge_completed',
    summary: {
      originalEventCount: 2,
      overlappingEventCount: 2,
      overlappingGroups: 1,
      mergedEventCount: 1,
      remainingEventCount: 1,
    },
    mergedEvents: [
      {
        id: 'merged-event-1',
        title: 'Meeting A + Meeting B',
        description: 'Combined description',
        status: 'IN_PROGRESS',
        startTime: new Date('2024-01-01T14:00:00Z'),
        endTime: new Date('2024-01-01T16:00:00Z'),
        inviteeCount: 2,
        originalEventIds: ['event-1', 'event-2'],
      },
    ],
  };

  beforeEach(async () => {
    const mockUsersService = {
      mergeAllEvents: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('mergeEvents', () => {
    it('should call service.mergeAllEvents and return the result', async () => {
      service.mergeAllEvents.mockResolvedValue(mockMergeResponse);

      const result = await controller.mergeEvents('user-1');

      expect(service.mergeAllEvents).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockMergeResponse);
    });

    it('should handle service errors', async () => {
      const error = new Error('User not found');
      service.mergeAllEvents.mockRejectedValue(error);

      await expect(controller.mergeEvents('non-existent-user')).rejects.toThrow(
        error,
      );
    });
  });

  describe('findById', () => {
    it('should call service.findById', async () => {
      const mockUser = { id: 'user-1', name: 'Test User', events: [] };
      service.findById.mockResolvedValue(mockUser);

      const result = await controller.findById('user-1');

      expect(service.findById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const mockUsers = [{ id: 'user-1', name: 'Test User', events: [] }];
      service.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });
});
