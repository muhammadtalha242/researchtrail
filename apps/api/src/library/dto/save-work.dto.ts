import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const READING_STATUSES = ['TO_READ', 'READING', 'COMPLETED'] as const;
export type ReadingStatusValue = (typeof READING_STATUSES)[number];

export class SaveWorkDto {
  @IsString()
  openAlexId: string;

  @IsOptional()
  @IsIn(READING_STATUSES)
  status?: ReadingStatusValue;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  note?: string;
}
