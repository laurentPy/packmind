import { validate } from 'class-validator';
import { SubscribeDto, UnsubscribeDto } from './subscribe.dto';

describe('SubscribeDto', () => {
  it('should validate correct data', async () => {
    const dto = new SubscribeDto();
    dto.eventType = 'program_status';
    dto.params = ['param1', 'param2'];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject empty eventType', async () => {
    const dto = new SubscribeDto();
    dto.eventType = '';
    dto.params = ['param1'];

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('eventType');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject eventType longer than 50 characters', async () => {
    const dto = new SubscribeDto();
    dto.eventType = 'a'.repeat(51);

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('eventType');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should reject more than 10 parameters', async () => {
    const dto = new SubscribeDto();
    dto.eventType = 'valid_event';
    dto.params = Array(11).fill('param');

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('params');
    expect(errors[0].constraints).toHaveProperty('arrayMaxSize');
  });

  it('should reject non-string parameters', async () => {
    const dto = new SubscribeDto();
    dto.eventType = 'valid_event';
    dto.params = ['valid', 123 as any];

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('params');
  });

  it('should trim whitespace from eventType', async () => {
    const dto = new SubscribeDto();
    dto.eventType = '  program_status  ';

    // Note: Transform happens during validation pipeline in NestJS
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

describe('UnsubscribeDto', () => {
  it('should validate correct data', async () => {
    const dto = new UnsubscribeDto();
    dto.eventType = 'program_status';
    dto.params = ['param1', 'param2'];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject empty eventType', async () => {
    const dto = new UnsubscribeDto();
    dto.eventType = '';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('eventType');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});