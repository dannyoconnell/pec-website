import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
    let connString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "";
    connString = connString.replace(/['"]/g, "").trim();
    connString = connString.replace(/(&|\?)channel_binding=require/, "");
    if (!connString.includes("sslmode=")) {
        connString += (connString.includes("?") ? "&" : "?") + "sslmode=require";
    }
    const sql = neon(connString);

    try {
        console.log("Adding report_data column...");
        await sql`ALTER TABLE matches ADD COLUMN IF NOT EXISTS report_data JSONB`;
        return new Response("Column Added", { status: 200 });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
};
