import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Event, EventStatus } from '../../entities/event.entity';
import { User } from '../../entities/user.entity';
import {
  MergeEventsResponseDto,
  MergedEventSummaryDto,
  MergeOperationSummaryDto,
} from './dto';

interface OverlapGroup {
  events: Event[];
  mergedEvent: Partial<Event>;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async mergeAllEvents(userId: string): Promise<MergeEventsResponseDto> {
    // Find user and validate existence
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['events', 'events.invitees'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const originalEvents = user.events || [];
    const originalEventCount = originalEvents.length;

    // If user has no events or only one event, no merging needed
    if (originalEventCount <= 1) {
      return {
        userId,
        operation: 'merge_completed',
        summary: {
          originalEventCount,
          overlappingEventCount: 0,
          overlappingGroups: 0,
          mergedEventCount: 0,
          remainingEventCount: originalEventCount,
        },
        mergedEvents: [],
      };
    }

    // Find overlapping event groups
    const overlapGroups = this.findOverlappingGroups(originalEvents);
    const overlappingGroups = overlapGroups.length;

    // If no overlapping groups found
    if (overlappingGroups === 0) {
      return {
        userId,
        operation: 'merge_completed',
        summary: {
          originalEventCount,
          overlappingEventCount: 0,
          overlappingGroups: 0,
          mergedEventCount: 0,
          remainingEventCount: originalEventCount,
        },
        mergedEvents: [],
      };
    }

    // Calculate overlapping event count
    const overlappingEventCount = overlapGroups.reduce(
      (count, group) => count + group.events.length,
      0,
    );

    // Execute merge operation in transaction
    const mergedEvents = await this.dataSource.transaction(async (manager) => {
      const newMergedEvents: Event[] = [];

      for (const group of overlapGroups) {
        // Delete original overlapping events
        await manager.remove(Event, group.events);

        // Create merged event
        const mergedEvent = manager.create(Event, group.mergedEvent);
        const savedMergedEvent = await manager.save(Event, mergedEvent);
        newMergedEvents.push(savedMergedEvent);
      }

      return newMergedEvents;
    });

    const mergedEventCount = mergedEvents.length;
    const remainingEventCount =
      originalEventCount - overlappingEventCount + mergedEventCount;

    // Prepare response
    const mergedEventSummaries: MergedEventSummaryDto[] = mergedEvents.map(
      (event, index) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        status: event.status,
        startTime: event.startTime,
        endTime: event.endTime,
        inviteeCount: event.invitees?.length || 0,
        originalEventIds: overlapGroups[index].events.map((e) => e.id),
      }),
    );

    const summary: MergeOperationSummaryDto = {
      originalEventCount,
      overlappingEventCount,
      overlappingGroups,
      mergedEventCount,
      remainingEventCount,
    };

    return {
      userId,
      operation: 'merge_completed',
      summary,
      mergedEvents: mergedEventSummaries,
    };
  }

  private findOverlappingGroups(events: Event[]): OverlapGroup[] {
    if (events.length <= 1) return [];

    // Sort events by start time
    const sortedEvents = [...events].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    const groups: OverlapGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < sortedEvents.length; i++) {
      if (processed.has(sortedEvents[i].id)) continue;

      const currentGroup = [sortedEvents[i]];
      processed.add(sortedEvents[i].id);

      // Find all events that overlap with current group
      let foundOverlap = true;
      while (foundOverlap) {
        foundOverlap = false;
        for (let j = 0; j < sortedEvents.length; j++) {
          if (processed.has(sortedEvents[j].id)) continue;

          // Check if this event overlaps with any event in current group
          const overlapsWithGroup = currentGroup.some((groupEvent) =>
            this.eventsOverlap(groupEvent, sortedEvents[j]),
          );

          if (overlapsWithGroup) {
            currentGroup.push(sortedEvents[j]);
            processed.add(sortedEvents[j].id);
            foundOverlap = true;
          }
        }
      }

      // Only create group if there are multiple events (overlapping)
      if (currentGroup.length > 1) {
        const mergedEvent = this.createMergedEvent(currentGroup);
        groups.push({
          events: currentGroup,
          mergedEvent,
        });
      }
    }

    return groups;
  }

  private eventsOverlap(event1: Event, event2: Event): boolean {
    return (
      event1.startTime < event2.endTime && event2.startTime < event1.endTime
    );
  }

  private createMergedEvent(events: Event[]): Partial<Event> {
    // Find time range
    const startTime = new Date(
      Math.min(...events.map((e) => e.startTime.getTime())),
    );
    const endTime = new Date(
      Math.max(...events.map((e) => e.endTime.getTime())),
    );

    // Combine titles
    const title = events.map((e) => e.title).join(' + ');

    // Combine descriptions
    const description = events
      .map(
        (e, index) =>
          `Event ${index + 1}: ${e.description || 'No description'}`,
      )
      .join('\n---\n');

    // Determine status priority: IN_PROGRESS > TODO > COMPLETED
    const statusPriority = {
      [EventStatus.IN_PROGRESS]: 3,
      [EventStatus.TODO]: 2,
      [EventStatus.COMPLETED]: 1,
    };

    const status = events.reduce((highestStatus, event) => {
      return statusPriority[event.status] > statusPriority[highestStatus]
        ? event.status
        : highestStatus;
    }, EventStatus.COMPLETED);

    // Combine and deduplicate invitees
    const allInvitees = events.flatMap((e) => e.invitees || []);
    const uniqueInvitees = allInvitees.filter(
      (invitee, index, arr) =>
        arr.findIndex((i) => i.id === invitee.id) === index,
    );

    return {
      title,
      description,
      status,
      startTime,
      endTime,
      invitees: uniqueInvitees,
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['events'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['events'],
    });
  }
}
