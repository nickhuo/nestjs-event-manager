import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  MaxLength,
  IsArray,
  ArrayUnique,
} from 'class-validator';
import { EventStatus } from '../../../entities/event.entity';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsArray()
  @IsUUID(4, { each: true })
  @ArrayUnique()
  @IsOptional()
  inviteeIds?: string[];
}
