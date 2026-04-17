import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
    let connString = process.env.DATABASE_URL || "";
    connString = connString.replace(/['"]/g, "").trim();
    connString = connString.replace(/(&|\?)channel_binding=require/, "");
    if (!connString.includes("sslmode=")) {
        connString += (connString.includes("?") ? "&" : "?") + "sslmode=require";
    }

    const sql = neon(connString);

    try {
        const rows = await sql`SELECT * FROM teams ORDER BY name ASC`;
        
        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Fetch Teams error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
