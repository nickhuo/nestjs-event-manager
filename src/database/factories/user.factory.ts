import type { User } from '../../entities/user.entity';

export interface UserFactoryOptions {
  name?: string;
}

export function createUser(options: UserFactoryOptions = {}): Partial<User> {
  if (options.name) {
    return { name: options.name };
  }

  // Fallback to simple names if faker is not available
  const defaultNames = [
    'John Doe',
    'Jane Smith',
    'Michael Johnson',
    'Emily Davis',
    'David Wilson',
  ];
  const randomName =
    defaultNames[Math.floor(Math.random() * defaultNames.length)];

  return {
    name: randomName,
  };
}

export function createManyUsers(
  count: number,
  options: UserFactoryOptions = {},
): Partial<User>[] {
  const results: Partial<User>[] = [];
  for (let i = 0; i < count; i++) {
    results.push(createUser(options));
  }
  return results;
}

export function createRealisticUsers(): Partial<User>[] {
  const names = [
    'John Smith',
    'Emily Johnson',
    'Michael Williams',
    'Jessica Brown',
    'David Jones',
    'Sarah Miller',
    'Daniel Davis',
    'Ashley Wilson',
    'Matthew Moore',
    'Amanda Taylor',
    'Christopher Anderson',
    'Jennifer Thomas',
    'Joshua Jackson',
    'Megan White',
    'Andrew Harris',
    'Lauren Martin',
    'James Thompson',
    'Olivia Garcia',
    'Ryan Martinez',
    'Sophia Robinson',
  ];

  return names.map((name) => ({
    name,
  }));
}
