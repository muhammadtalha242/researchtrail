import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class SearchWorksDto {
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  q: string;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  fromYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  toYear?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  openAccess?: boolean;

  @IsOptional()
  @IsIn(['relevance', 'newest', 'cited'])
  sort?: 'relevance' | 'newest' | 'cited';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  page?: number;
}
