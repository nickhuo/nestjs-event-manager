import { Expose, Transform, Type } from 'class-transformer';
import { EventStatus } from '../../../entities/event.entity';
import { UserSummaryDto } from './user-summary.dto';

export class EventResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  status: EventStatus;

  @Expose()
  @Transform(({ value }: { value: Date }) => value?.toISOString())
  startTime: Date;

  @Expose()
  @Transform(({ value }: { value: Date }) => value?.toISOString())
  endTime: Date;

  @Expose()
  @Transform(({ value }: { value: Date }) => value?.toISOString())
  createdAt: Date;

  @Expose()
  @Transform(({ value }: { value: Date }) => value?.toISOString())
  updatedAt: Date;

  @Expose()
  @Type(() => UserSummaryDto)
  invitees: UserSummaryDto[];
}
