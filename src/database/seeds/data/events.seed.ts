import { EventStatus } from '../../../entities/event.entity';

export const seedEvents = [
  {
    title: 'Team Weekly Meeting',
    description:
      'Regular weekly team sync meeting to discuss project progress and plans',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-26 10:00:00'),
    endTime: new Date('2024-08-26 11:00:00'),
  },
  {
    title: 'Product Review Meeting',
    description:
      'Q1 new feature product review meeting with product, design, and development teams',
    status: EventStatus.IN_PROGRESS,
    startTime: new Date('2024-08-27 14:00:00'),
    endTime: new Date('2024-08-27 16:00:00'),
  },
  {
    title: 'Tech Sharing Session',
    description:
      'Frontend new tech stack sharing, introduction to React 18 new features',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-28 15:30:00'),
    endTime: new Date('2024-08-28 17:00:00'),
  },
  {
    title: 'Sprint Retrospective Meeting',
    description:
      'Sprint 2 retrospective meeting, summarizing experiences and improvement plans',
    status: EventStatus.COMPLETED,
    startTime: new Date('2024-08-23 09:00:00'),
    endTime: new Date('2024-08-23 10:00:00'),
  },
  {
    title: 'Client Requirements Discussion',
    description:
      'Discussing new feature requirements and implementation plans with the client',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-29 13:00:00'),
    endTime: new Date('2024-08-29 15:00:00'),
  },
  {
    title: 'Code Review Meeting',
    description: 'Important feature code review meeting to ensure code quality',
    status: EventStatus.IN_PROGRESS,
    startTime: new Date('2024-08-26 16:00:00'),
    endTime: new Date('2024-08-26 17:00:00'),
  },
  {
    title: 'Project Kickoff Meeting',
    description:
      'Kickoff meeting for the new project to clarify goals and assignments',
    status: EventStatus.COMPLETED,
    startTime: new Date('2024-08-20 09:00:00'),
    endTime: new Date('2024-08-20 12:00:00'),
  },
  {
    title: 'Architecture Design Discussion',
    description:
      'System architecture design discussion, technology selection and solution determination',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-30 10:00:00'),
    endTime: new Date('2024-08-30 12:30:00'),
  },
];
