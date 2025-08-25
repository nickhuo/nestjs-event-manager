import type { User } from '../../entities/user.entity';

export interface UserFactoryOptions {
  name?: string;
}

export async function createUser(
  options: UserFactoryOptions = {},
): Promise<Partial<User>> {
  if (options.name) {
    return { name: options.name };
  }

  const { faker } = await import('@faker-js/faker');
  return {
    name: faker.person.fullName(),
  };
}

export async function createManyUsers(
  count: number,
  options: UserFactoryOptions = {},
): Promise<Partial<User>[]> {
  const results: Partial<User>[] = [];
  for (let i = 0; i < count; i++) {
    results.push(await createUser(options));
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
