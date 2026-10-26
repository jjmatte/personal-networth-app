import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const category = sqliteTable('category', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  targetWeight: real('target_weight').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const account = sqliteTable('account', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  accessible: integer('accessible', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const holding = sqliteTable('holding', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  kind: text('kind').notNull().default('equity'),
  categoryId: integer('category_id').references(() => category.id, { onDelete: 'set null' }),
  accountId: integer('account_id').references(() => account.id, { onDelete: 'set null' }),
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

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  monthlySpend: real('monthly_spend').notNull().default(0)
});

export const yearlyNetWorth = sqliteTable('yearly_net_worth', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull().unique(),
  netWorth: real('net_worth').notNull().default(0)
});

export const incomeYear = sqliteTable('income_year', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull().unique(),
  estimatedIncome: real('estimated_income').notNull().default(0),
  investmentIncome: real('investment_income').notNull().default(0),
  netMonthlyMargin: real('net_monthly_margin').notNull().default(0)
});

export const incomePersonYear = sqliteTable('income_person_year', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull(),
  name: text('name').notNull(),
  amount: real('amount').notNull().default(0)
});

export const fireMilestone =sqliteTable('fire_milestone', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull(),
  kind: text('kind').notNull(),
  value: real('value').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
});
