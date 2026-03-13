import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgres://root:rootpassword@localhost:5432/ticket_registrator";

async function deepCleanup() {
    const sql = postgres(connectionString, { max: 1 });
    try {
        console.log('--- DROPPING DRIZZLE SCHEMA AND PUBLIC TABLES ---');
        // Drop all tables in public schema
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `;
        
        for (const { table_name } of tables) {
            console.log(`Dropping table public.${table_name}`);
            await sql.unsafe(`DROP TABLE public."${table_name}" CASCADE`);
        }

        // Drop drizzle schema (where migration tracking lives)
        await sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`;
        
        console.log('Deep cleanup successful.');
    } catch (error) {
        console.error('Deep cleanup failed:', error);
    } finally {
        await sql.end();
    }
}

deepCleanup();
