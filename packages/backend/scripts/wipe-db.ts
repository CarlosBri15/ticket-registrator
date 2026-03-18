import { drizzle } from 'drizzle-orm/postgres-js';
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
const db = drizzle(sql);

async function wipe() {
  console.log('--- RESETTING DATABASE (NUCLEAR) ---');
  try {
    console.log('Dropping schema public...');
    await sql.unsafe('DROP SCHEMA IF EXISTS public CASCADE;');
    console.log('Recreating schema public...');
    await sql.unsafe('CREATE SCHEMA public;');
    await sql.unsafe('GRANT ALL ON SCHEMA public TO public;');
    
    console.log('Dropping schema drizzle...');
    await sql.unsafe('DROP SCHEMA IF EXISTS drizzle CASCADE;');
    
    console.log('--- DATABASE RESET SUCCESSFULLY ---');
  } catch (error) {
    console.error('--- ERROR RESETTING DATABASE ---', error);
  } finally {
    await sql.end();
  }
}

wipe();
