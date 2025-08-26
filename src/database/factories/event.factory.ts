import type { Event } from '../../entities/event.entity';
import { EventStatus } from '../../entities/event.entity';
import type { User } from '../../entities/user.entity';

export interface EventFactoryOptions {
  title?: string;
  description?: string;
  status?: EventStatus;
  startTime?: Date;
  endTime?: Date;
  durationHours?: number;
}

export function createEvent(options: EventFactoryOptions = {}): Partial<Event> {
  // Default to future date within next 30 days
  const defaultStartTime = new Date();
  defaultStartTime.setDate(
    defaultStartTime.getDate() + Math.floor(Math.random() * 30) + 1,
  );
  defaultStartTime.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9-16:00

  const startTime = options.startTime || defaultStartTime;
  const durationHours =
    options.durationHours || Math.floor(Math.random() * 4) + 1; // 1-4 hours
  const endTime =
    options.endTime ||
    new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

  // Default event titles
  const defaultTitles = [
    'Project Meeting',
    'Team Sync',
    'Planning Session',
    'Review Meeting',
    'Discussion',
  ];

  // Default descriptions
  const defaultDescriptions = [
    'Project discussion and planning session.',
    'Team synchronization meeting to align on objectives.',
    'Review meeting to discuss progress and next steps.',
    'Planning session for upcoming deliverables.',
    'Discussion meeting to resolve issues and make decisions.',
  ];

  // Random status selection
  const statuses = [
    EventStatus.TODO,
    EventStatus.IN_PROGRESS,
    EventStatus.COMPLETED,
  ];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    title:
      options.title ||
      defaultTitles[Math.floor(Math.random() * defaultTitles.length)],
    description:
      options.description ||
      defaultDescriptions[
        Math.floor(Math.random() * defaultDescriptions.length)
      ],
    status: options.status || randomStatus,
    startTime,
    endTime,
  };
}

export function createManyEvents(
  count: number,
  options: EventFactoryOptions = {},
): Partial<Event>[] {
  const results: Partial<Event>[] = [];
  for (let i = 0; i < count; i++) {
    results.push(createEvent(options));
  }
  return results;
}

export function createRealisticEvents(): Partial<Event>[] {
  const eventTemplates = [
    {
      title: 'Team Weekly Meeting',
      description:
        'Weekly team sync meeting to discuss project progress and plans',
      status: EventStatus.TODO,
      durationHours: 1,
    },
    {
      title: 'Product Review Meeting',
      description:
        'Q1 new feature product review meeting with product, design and development teams',
      status: EventStatus.IN_PROGRESS,
      durationHours: 2,
    },
    {
      title: 'Tech Sharing Session',
      description:
        'Frontend new technology stack sharing, React 18 new features introduction',
      status: EventStatus.TODO,
      durationHours: 1.5,
    },
    {
      title: 'Sprint Retrospective Meeting',
      description:
        'Sprint 2 retrospective meeting to summarize experiences and improvement plans',
      status: EventStatus.COMPLETED,
      durationHours: 1,
    },
    {
      title: 'Client Requirements Discussion',
      description:
        'Discuss new feature requirements and implementation solutions with clients',
      status: EventStatus.TODO,
      durationHours: 2,
    },
    {
      title: 'Code Review Meeting',
      description:
        'Critical feature code review meeting to ensure code quality',
      status: EventStatus.IN_PROGRESS,
      durationHours: 1,
    },
    {
      title: 'Project Kickoff Meeting',
      description:
        'New project kickoff meeting to clarify goals and responsibilities',
      status: EventStatus.COMPLETED,
      durationHours: 3,
    },
    {
      title: 'Architecture Design Discussion',
      description:
        'System architecture design discussion, technology selection and solution confirmation',
      status: EventStatus.TODO,
      durationHours: 2.5,
    },
  ];

  const now = new Date();

  return eventTemplates.map((template) => {
    // Create reasonable time scheduling: weekdays, within working hours
    const daysOffset = Math.floor(Math.random() * 22) - 7; // -7 to 14 days
    const startTime = new Date(now);
    startTime.setDate(now.getDate() + daysOffset);

    // Set to working hours (9:00-18:00)
    const workHour = Math.floor(Math.random() * 9) + 9; // 9-17
    startTime.setHours(workHour, 0, 0, 0);

    // Ensure it's a weekday
    const dayOfWeek = startTime.getDay();
    if (dayOfWeek === 0) {
      // Sunday
      startTime.setDate(startTime.getDate() + 1);
    } else if (dayOfWeek === 6) {
      // Saturday
      startTime.setDate(startTime.getDate() + 2);
    }

    const endTime = new Date(
      startTime.getTime() + template.durationHours * 60 * 60 * 1000,
    );

    return {
      title: template.title,
      description: template.description,
      status: template.status,
      startTime,
      endTime,
    };
  });
}

export function createEventWithInvitees(
  eventData: Partial<Event>,
  invitees: User[],
): Partial<Event> {
  return {
    ...eventData,
    invitees,
  };
}
