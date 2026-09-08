import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { READING_STATUSES, ReadingStatusValue } from './save-work.dto';

export class UpdateWorkDto {
  @IsOptional()
  @IsIn(READING_STATUSES)
  status?: ReadingStatusValue;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  note?: string;
}
