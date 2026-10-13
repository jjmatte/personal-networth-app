import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const category = sqliteTable('category', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  targetWeight: real('target_weight').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const holding = sqliteTable('holding', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  kind: text('kind').notNull().default('equity'),
  categoryId: integer('category_id').references(() => category.id, { onDelete: 'set null' }),
  currentValue: real('current_value').notNull().default(0),
  lastPrice: real('last_price'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const lot = sqliteTable('lot', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  holdingId: integer('holding_id').notNull().references(() => holding.id, { onDelete: 'cascade' }),
  tradeDate: integer('trade_date', { mode: 'timestamp' }).notNull(),
  shares: real('shares').notNull(),
  pricePerShare: real('price_per_share').notNull(),
  fee: real('fee'),
  note: text('note')
});

export const valueHistory = sqliteTable('value_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  holdingId: integer('holding_id').notNull().references(() => holding.id, { onDelete: 'cascade' }),
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  value: real('value').notNull()
});

export const netWorthSnapshot = sqliteTable('net_worth_snapshot', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  takenAt: integer('taken_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  note: text('note'),
  total: real('total').notNull().default(0)
});

export const netWorthItem = sqliteTable('net_worth_item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  snapshotId: integer('snapshot_id')
    .notNull()
    .references(() => netWorthSnapshot.id, { onDelete: 'cascade' }),
  side: text('side').notNull(),
  category: text('category').notNull(),
  label: text('label').notNull(),
  amount: real('amount').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
});
