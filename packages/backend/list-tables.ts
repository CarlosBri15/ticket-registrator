import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgres://root:rootpassword@localhost:5432/ticket_registrator";

async function listTables() {
    const sql = postgres(connectionString, { max: 1 });
    try {
        const tables = await sql`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY table_schema, table_name;
        `;
        console.log('Tables in DB:');
        console.table(tables);
    } catch (error) {
        console.error('Failed to list tables:', error);
    } finally {
        await sql.end();
    }
}

listTables();
