import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

async function wipe() {
    console.log('--- WIPING DATABASE ---');
    try {
        // Drop all tables in the public schema
        await sql.unsafe(`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
          -- Also drop the drizzle schema to clear migration history
          DROP SCHEMA IF EXISTS drizzle CASCADE;
      END $$;
    `);
        console.log('--- DATABASE WIPED SUCCESSFULLY ---');
    } catch (error) {
        console.error('--- DATABASE WIPE FAILED ---');
        console.error(error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

void wipe();
