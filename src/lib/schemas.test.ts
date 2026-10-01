import { describe, it, expect } from 'vitest';
import { holdingValueSchema } from './schemas';

describe('holdingValueSchema', () => {
  it('rejects a blank value', () => {
    expect(holdingValueSchema.safeParse({ value: '' }).success).toBe(false);
  });

  it('rejects a negative value', () => {
    expect(holdingValueSchema.safeParse({ value: '-10' }).success).toBe(false);
  });

  it('accepts a valid value', () => {
    const result = holdingValueSchema.safeParse({ value: '1500' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(1500);
    }
  });
});
