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
  {
    title: 'Team Building Activity',
    description: 'Outdoor team building activities and lunch',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-26 09:30:00'), // Overlaps with Team Weekly Meeting
    endTime: new Date('2024-08-26 11:30:00'),
  },
  {
    title: 'Client Presentation Rehearsal',
    description: 'Practice run for the upcoming client presentation',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-27 14:30:00'), // Overlaps with Product Review Meeting
    endTime: new Date('2024-08-27 15:30:00'),
  },
  {
    title: 'Design Workshop',
    description: 'Creative workshop for new UI design concepts',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-28 15:00:00'), // Overlaps with Tech Sharing Session
    endTime: new Date('2024-08-28 16:30:00'),
  },
  {
    title: 'Engineering All Hands',
    description: 'Monthly engineering department all hands meeting',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-29 13:30:00'), // Overlaps with Client Requirements Discussion
    endTime: new Date('2024-08-29 14:30:00'),
  },
  {
    title: 'Training Session: Security Best Practices',
    description: 'Mandatory training on security best practices and protocols',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-26 16:30:00'), // Overlaps with Code Review Meeting
    endTime: new Date('2024-08-26 18:00:00'),
  },
  {
    title: 'Coffee Chat with New Hire',
    description: 'Welcome coffee chat with the new team member',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-27 15:00:00'),
    endTime: new Date('2024-08-27 15:30:00'),
  },
  {
    title: 'Lunch Meeting with HR',
    description: 'Lunch meeting to discuss career development plans',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-28 12:00:00'),
    endTime: new Date('2024-08-28 13:00:00'),
  },
  {
    title: 'Company Happy Hour',
    description: 'End of week happy hour at the rooftop bar',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-30 17:00:00'),
    endTime: new Date('2024-08-30 19:00:00'),
  },
  {
    title: 'React Advanced Workshop',
    description:
      'Advanced React patterns and performance optimization techniques',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-31 10:00:00'),
    endTime: new Date('2024-08-31 12:00:00'),
  },
  {
    title: 'Database Performance Tuning',
    description: 'Workshop on database optimization and performance tuning',
    status: EventStatus.TODO,
    startTime: new Date('2024-08-31 14:00:00'),
    endTime: new Date('2024-08-31 16:00:00'),
  },
  {
    title: 'API Design Best Practices',
    description: 'Learning session on REST API design and GraphQL fundamentals',
    status: EventStatus.TODO,
    startTime: new Date('2024-09-02 09:00:00'),
    endTime: new Date('2024-09-02 11:00:00'),
  },
  {
    title: 'Leadership Skills Development',
    description:
      'Workshop focused on developing leadership and management skills',
    status: EventStatus.TODO,
    startTime: new Date('2024-09-02 13:00:00'),
    endTime: new Date('2024-09-02 15:00:00'),
  },
  {
    title: 'Product Roadmap Planning',
    description:
      'Quarterly planning session for product roadmap and priorities',
    status: EventStatus.TODO,
    startTime: new Date('2024-09-03 10:00:00'),
    endTime: new Date('2024-09-03 12:00:00'),
  },
  {
    title: 'Customer Feedback Review',
    description:
      'Review and discussion of recent customer feedback and feature requests',
    status: EventStatus.TODO,
    startTime: new Date('2024-09-03 14:00:00'),
    endTime: new Date('2024-09-03 15:30:00'),
  },
];
