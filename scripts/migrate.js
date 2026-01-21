const fs = require('fs');
const path = require('path');
const { neon } = require('@netlify/neon');
require('dotenv').config();

const runMigration = async () => {
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing in .env");
        process.exit(1);
    }

    console.log("Connecting to Database...");
    const sql = neon(process.env.DATABASE_URL);

    try {
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log("Running Schema...");
        // Split by semicolon to run statements individually if needed, 
        // but neon usually handles the block. Let's try block first.
        const statements = schema.split(';').filter(s => s.trim().length > 0);

        for (const statement of statements) {
            await sql(statement);
        }

        console.log("✅ Migration Complete!");
    } catch (e) {
        console.error("❌ Migration Failed:", e);
    }
};

runMigration();
