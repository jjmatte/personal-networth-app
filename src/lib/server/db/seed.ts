import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { category, holding, lot, valueHistory } from './schema';

const sqlite = new Database(process.env.DATABASE_URL ?? 'data/app.db');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

const categories = db
  .insert(category)
  .values([
    { name: 'US Large Cap', targetWeight: 40, sortOrder: 0 },
    { name: 'Bonds', targetWeight: 30, sortOrder: 1 },
    { name: 'Bitcoin', targetWeight: 30, sortOrder: 2 }
  ])
  .returning()
  .all();

const [usLargeCap, , bitcoin] = categories;

const [exampleFund, exampleCrypto] = db
  .insert(holding)
  .values([
    { symbol: 'EXFND', name: 'Example Index Fund', categoryId: usLargeCap.id, currentValue: 12345.67 },
    { symbol: 'EXBTC', name: 'Example Bitcoin Position', categoryId: bitcoin.id, currentValue: 4321.0 }
  ])
  .returning()
  .all();

db.insert(lot)
  .values([
    {
      holdingId: exampleFund.id,
      tradeDate: new Date('2025-01-15'),
      shares: 100,
      pricePerShare: 110.5,
      fee: 1.5,
      note: 'Example fictional purchase'
    },
    {
      holdingId: exampleCrypto.id,
      tradeDate: new Date('2025-03-01'),
      shares: 0.1,
      pricePerShare: 43000,
      fee: 2.0,
      note: 'Example fictional purchase'
    }
  ])
  .run();

db.insert(valueHistory)
  .values([
    { holdingId: exampleFund.id, recordedAt: new Date('2025-09-01'), value: 12000.0 },
    { holdingId: exampleCrypto.id, recordedAt: new Date('2025-09-01'), value: 4200.0 }
  ])
  .run();

console.log('Seed complete.');
