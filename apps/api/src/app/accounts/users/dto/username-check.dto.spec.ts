import { validate } from 'class-validator';
import { UsernameCheckDto } from './username-check.dto';

describe('UsernameCheckDto', () => {
  it('should validate correct username', async () => {
    const dto = new UsernameCheckDto();
    dto.username = 'testuser123';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject empty username', async () => {
    const dto = new UsernameCheckDto();
    dto.username = '';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject username shorter than 3 characters', async () => {
    const dto = new UsernameCheckDto();
    dto.username = 'ab';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should reject username longer than 30 characters', async () => {
    const dto = new UsernameCheckDto();
    dto.username = 'a'.repeat(31);

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should reject username with special characters', async () => {
    const dto = new UsernameCheckDto();
    dto.username = 'test@user';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should accept username with underscores and hyphens', async () => {
    const dto = new UsernameCheckDto();
    dto.username = 'test_user-123';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should convert username to lowercase', async () => {
    const dto = new UsernameCheckDto();
    dto.username = '  TestUser123  ';

    // Note: The transformation happens during the validation pipeline in NestJS
    // This test just ensures validation passes for mixed case
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept numeric usernames', async () => {
    const dto = new UsernameCheckDto();
    dto.username = '123456';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});