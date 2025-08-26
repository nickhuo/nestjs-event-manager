import { Expose, Type } from 'class-transformer';

export class MergedEventSummaryDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  inviteeCount: number;

  @Expose()
  originalEventIds: string[];
}

export class MergeOperationSummaryDto {
  @Expose()
  originalEventCount: number;

  @Expose()
  overlappingEventCount: number;

  @Expose()
  overlappingGroups: number;

  @Expose()
  mergedEventCount: number;

  @Expose()
  remainingEventCount: number;
}

export class MergeEventsResponseDto {
  @Expose()
  userId: string;

  @Expose()
  operation: string;

  @Expose()
  @Type(() => MergeOperationSummaryDto)
  summary: MergeOperationSummaryDto;

  @Expose()
  @Type(() => MergedEventSummaryDto)
  mergedEvents: MergedEventSummaryDto[];
}
