import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsBoolean()
  consentVoiceProcessing?: boolean;

  @IsOptional()
  @IsBoolean()
  consentMarketing?: boolean;
}
