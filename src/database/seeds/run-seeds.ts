import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { SeedService } from './seed.service';
import { SeedModule } from './seed.module';

async function bootstrap() {
  const logger = new Logger('SeedRunner');

  try {
    logger.log('Starting seed data service...');

    // Create application instance
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get seed service
    const seedService = app
      .select(SeedModule)
      .get(SeedService, { strict: true });

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'all';

    switch (command) {
      case 'all': {
        await seedService.seedAll();
        break;
      }
      case 'users': {
        const userCount = parseInt(args[1], 10) || 10;
        await seedService.seedUsersOnly(userCount);
        break;
      }
      case 'events': {
        const eventCount = parseInt(args[1], 10) || 5;
        await seedService.seedEventsOnly(eventCount);
        break;
      }
      case 'clear': {
        await seedService.clearDatabase();
        logger.log('Database cleared successfully');
        break;
      }
      case 'stats': {
        const stats = await seedService.getStats();
        logger.log(
          `Database statistics: Users: ${stats.users}, Events: ${stats.events}, Relationships: ${stats.relationships}`,
        );
        break;
      }
      default: {
        logger.error(`Unknown command: ${command}`);
        logger.log(
          'Available commands: all, users [count], events [count], clear, stats',
        );
        process.exit(1);
      }
    }

    await app.close();
    logger.log('Seed data service completed successfully');
  } catch (error) {
    logger.error('Seed data service failed', error);
    process.exit(1);
  }
}

void bootstrap();
