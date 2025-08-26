import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SeedModule } from './database/seeds/seed.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [DatabaseModule, SeedModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
