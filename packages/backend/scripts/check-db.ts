import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined in .env');
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

async function check() {
  const tables = ['users', 'roles', 'permissions', 'companies'];
  for (const table of tables) {
    const result = await sql.unsafe(`SELECT COUNT(*) FROM "${table}"`);
    console.log(`${table} count: ${result[0].count}`);
  }
  await sql.end();
}

check();
