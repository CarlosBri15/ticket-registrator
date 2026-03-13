import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgres://root:rootpassword@localhost:5432/ticket_registrator";

async function diagnostic() {
    const sql = postgres(connectionString, { max: 1 });
    try {
        const rows = await sql`SELECT * FROM drizzle.__drizzle_migrations ORDER BY id ASC;`;
        fs.writeFileSync('migration-diagnostic.json', JSON.stringify(rows, null, 2));
        console.log('Diagnostic written to migration-diagnostic.json');
    } catch (error) {
        console.error('Diagnostic failed:', error);
    } finally {
        await sql.end();
    }
}

diagnostic();
