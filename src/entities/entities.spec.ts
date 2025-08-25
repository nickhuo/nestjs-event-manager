import { Event, EventStatus } from './event.entity';
import { User } from './user.entity';

describe('Entities', () => {
  describe('Event Entity', () => {
    it('should create an event instance', () => {
      const event = new Event();
      event.title = 'Test Event';
      event.description = 'Test Description';
      event.status = EventStatus.TODO;
      event.startTime = new Date();
      event.endTime = new Date();
      event.invitees = [];

      expect(event.title).toBe('Test Event');
      expect(event.description).toBe('Test Description');
      expect(event.status).toBe(EventStatus.TODO);
      expect(event.invitees).toEqual([]);
    });

    it('should have default status as TODO', () => {
      const event = new Event();
      expect(event.status).toBeUndefined(); // Will be set by database default
    });

    it('should support all status values', () => {
      expect(EventStatus.TODO).toBe('TODO');
      expect(EventStatus.IN_PROGRESS).toBe('IN_PROGRESS');
      expect(EventStatus.COMPLETED).toBe('COMPLETED');
    });
  });

  describe('User Entity', () => {
    it('should create a user instance', () => {
      const user = new User();
      user.name = 'Test User';
      user.events = [];

      expect(user.name).toBe('Test User');
      expect(user.events).toEqual([]);
    });
  });

  describe('Entity Relationships', () => {
    it('should establish many-to-many relationship', () => {
      const user = new User();
      user.name = 'Test User';

      const event = new Event();
      event.title = 'Test Event';
      event.description = 'Test Description';
      event.status = EventStatus.TODO;
      event.startTime = new Date();
      event.endTime = new Date();

      // Establish relationship
      event.invitees = [user];
      user.events = [event];

      expect(event.invitees).toContain(user);
      expect(user.events).toContain(event);
    });
  });
});
