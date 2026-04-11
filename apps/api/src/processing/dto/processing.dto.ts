import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class StartProcessingDto {
  @IsString()
  projectId!: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}

export class ProcessingCallbackDto {
  @IsString()
  jobId!: string;

  @IsIn(['RUNNING', 'COMPLETED', 'FAILED'])
  status!: 'RUNNING' | 'COMPLETED' | 'FAILED';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsString()
  outputKey?: string;

  @IsOptional()
  @IsString()
  previewKey?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
