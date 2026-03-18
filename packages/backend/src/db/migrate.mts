import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required for migrations');
}

console.log('--- MIGRATIONS START ---');

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

try {
  await migrate(db, {
    migrationsFolder: join(dirname(fileURLToPath(import.meta.url)), '../../drizzle'),
  });
  console.log('--- MIGRATIONS FINISHED ---');
} catch (error) {
  console.error('--- MIGRATIONS FAILED ---');
  console.error(error);
  process.exit(1);
} finally {
  await sql.end();
  process.exit(0);
}
