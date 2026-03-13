import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgres://root:rootpassword@localhost:5432/ticket_registrator";

async function resetAndRun() {
    const sql = postgres(connectionString, { max: 1 });
    try {
        console.log('--- TRUNCATING MIGRATION TABLE TO FORCE RE-RUN ---');
        await sql`TRUNCATE TABLE drizzle.__drizzle_migrations;`;
        console.log('Truncate successful.');
        
        // Also check public schema tables just to be 100% sure
        const publicTables = await sql`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public';
        `;
        console.log('Public tables:', publicTables.map(t => t.table_name));

    } catch (error) {
        console.error('Reset failed:', error);
    } finally {
        await sql.end();
    }
}

resetAndRun();
