import { validate } from 'class-validator';
import { GenerateApiKeyDto } from './generate-api-key.dto';

describe('GenerateApiKeyDto', () => {
  it('should validate when host is not provided', async () => {
    const dto = new GenerateApiKeyDto();

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate correct host URL', async () => {
    const dto = new GenerateApiKeyDto();
    dto.host = 'https://api.example.com';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid URL format', async () => {
    const dto = new GenerateApiKeyDto();
    dto.host = 'not-a-valid-url';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('host');
    expect(errors[0].constraints).toHaveProperty('isUrl');
  });

  it('should reject host URL longer than 255 characters', async () => {
    const dto = new GenerateApiKeyDto();
    dto.host = 'https://' + 'a'.repeat(250) + '.com';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('host');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should trim whitespace from host', async () => {
    const dto = new GenerateApiKeyDto();
    dto.host = '  https://api.example.com  ';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept localhost URLs', async () => {
    const dto = new GenerateApiKeyDto();
    dto.host = 'http://localhost:3000';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});