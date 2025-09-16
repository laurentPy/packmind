import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required' })
  @MinLength(2, { message: 'Organization name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Organization name must be less than 50 characters' })
  @Matches(/^[a-zA-Z0-9\s_-]+$/, {
    message: 'Organization name can only contain letters, numbers, spaces, underscores, and hyphens'
  })
  @Transform(({ value }) => value?.trim())
  name: string;
}