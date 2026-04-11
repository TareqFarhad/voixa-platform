import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  songTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  genre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  style?: string;

  @IsOptional()
  @IsString()
  lyrics?: string;
}
