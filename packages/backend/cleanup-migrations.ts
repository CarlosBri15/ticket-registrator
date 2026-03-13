import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgres://root:rootpassword@localhost:5432/ticket_registrator";

async function cleanup() {
    const sql = postgres(connectionString, { max: 1 });
    
    try {
        console.log('--- ALL MIGRATION RECORDS ---');
        const rows = await sql`SELECT * FROM drizzle.__drizzle_migrations ORDER BY id ASC;`;
        console.log(JSON.stringify(rows, null, 2));

        // Looking for records after 0005...
        const idsToDelete = rows.filter(r => r.id > 5).map(r => r.id);
        
        if (idsToDelete.length > 0) {
            console.log(`Deleting migration IDs: ${idsToDelete.join(', ')}`);
            await sql`
                DELETE FROM drizzle.__drizzle_migrations 
                WHERE id IN (${idsToDelete});
            `;
            console.log('Cleanup successful.');
        } else {
            console.log('No extra migrations found.');
        }
    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await sql.end();
    }
}

cleanup();
