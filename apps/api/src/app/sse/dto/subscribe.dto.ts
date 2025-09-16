import { IsString, IsArray, IsOptional, IsNotEmpty, ArrayMaxSize, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubscribeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Event type must be less than 50 characters' })
  @Transform(({ value }) => value?.trim())
  eventType: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10, { message: 'Maximum 10 parameters allowed' })
  @MaxLength(100, { each: true, message: 'Each parameter must be less than 100 characters' })
  params?: string[];
}

export class UnsubscribeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Event type must be less than 50 characters' })
  @Transform(({ value }) => value?.trim())
  eventType: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10, { message: 'Maximum 10 parameters allowed' })
  @MaxLength(100, { each: true, message: 'Each parameter must be less than 100 characters' })
  params?: string[];
}
