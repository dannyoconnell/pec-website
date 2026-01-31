import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Simple script to ensure the report_data column exists
(async () => {
    const connString = process.env.DATABASE_URL;
    if (!connString) {
        console.error("No DATABASE_URL");
        process.exit(1);
    }
    const sql = neon(connString);

    try {
        console.log("Adding report_data column to matches table...");
        await sql`
            ALTER TABLE matches 
            ADD COLUMN IF NOT EXISTS report_data JSONB;
        `;
        console.log("Success.");
    } catch (e) {
        console.error("Error:", e);
    }
})();
