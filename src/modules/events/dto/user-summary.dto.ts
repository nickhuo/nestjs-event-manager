import { Expose } from 'class-transformer';

export class UserSummaryDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}
