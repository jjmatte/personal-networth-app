import { z } from 'zod';

const positive = z.coerce.number().finite().nonnegative();

export const categorySchema = z.object({
  name: z.string().min(1),
  targetWeight: z.coerce.number().finite().min(0).max(100),
  sortOrder: z.coerce.number().int().min(0).default(0)
});
export const holdingSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.coerce.number().int().nullable(),
  currentValue: positive.default(0)
});
export const holdingValueSchema = z.object({
  value: z.string().trim().min(1).pipe(z.coerce.number().finite().nonnegative())
});
export const lotSchema = z.object({
  holdingId: z.coerce.number().int(),
  tradeDate: z.coerce.date(),
  shares: z.coerce.number().finite().positive(),
  pricePerShare: positive,
  fee: positive.optional(),
  note: z.string().optional()
});
