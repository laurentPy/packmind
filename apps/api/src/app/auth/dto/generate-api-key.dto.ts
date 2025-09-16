import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class GenerateApiKeyDto {
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Host must be a valid URL' })
  @MaxLength(255, { message: 'Host URL must be less than 255 characters' })
  @Transform(({ value }) => value?.trim())
  host?: string;
}