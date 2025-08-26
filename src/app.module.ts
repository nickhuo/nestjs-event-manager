import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SeedModule } from './database/seeds/seed.module';
import { EventsModule } from './modules/events/events.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [DatabaseModule, SeedModule, EventsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
