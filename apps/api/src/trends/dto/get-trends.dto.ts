import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class GetTrendsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  topicId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  q?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  fromYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  toYear?: number;
}

export class SearchTopicsDto {
  @IsString()
  @MaxLength(300)
  q: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
