import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isTest = process.env.NODE_ENV === 'test';
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isTest || isDevelopment) {
    return {
      type: 'sqlite',
      database: isTest ? ':memory:' : 'event_manager.db',
      entities: [Event, User],
      synchronize: true,
      dropSchema: isTest, // Only drop schema in test mode
      logging: isDevelopment,
    };
  }

  // MySQL for production
  return {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'event_manager',
    entities: [Event, User],
    synchronize: false,
    logging: false,
    timezone: '+00:00',
    charset: 'utf8mb4',
    extra: {
      connectionLimit: 10,
    },
  };
};
