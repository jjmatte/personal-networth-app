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
  kind: z.enum(['equity', 'crypto']).default('equity'),
  categoryId: z.coerce.number().int().nullable(),
  currentValue: positive.default(0)
});
export const lotSchema = z.object({
  holdingId: z.coerce.number().int(),
  tradeDate: z.coerce.date(),
  shares: z.coerce.number().finite().positive(),
  pricePerShare: positive,
  fee: positive.optional(),
  note: z.string().optional()
});

export const netWorthItemSchema = z.object({
  side: z.enum(['asset', 'liability']),
  category: z.string().min(1),
  label: z.string().min(1),
  amount: z.coerce.number().finite().nonnegative(),
  sortOrder: z.coerce.number().int().min(0).default(0)
});
export const netWorthSnapshotSchema = z.object({
  takenAt: z.coerce.date(),
  note: z.string().optional(),
  items: z.array(netWorthItemSchema).min(1)
});
