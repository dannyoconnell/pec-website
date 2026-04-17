import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response("Method Not Allowed", { status: 405 });
    }

    let connString = process.env.DATABASE_URL || "";
    connString = connString.replace(/['"]/g, "").trim();
    connString = connString.replace(/(&|\?)channel_binding=require/, "");
    if (!connString.includes("sslmode=")) {
        connString += (connString.includes("?") ? "&" : "?") + "sslmode=require";
    }

    const sql = neon(connString);

    try {
        const body = await req.json();
        const { name, logo_url, primary_color, campus_image, games } = body;

        if (!name) {
            return new Response("Team name is required", { status: 400 });
        }

        // Upsert team data
        const result = await sql`
            INSERT INTO teams (name, logo_url, primary_color, campus_image, games)
            VALUES (${name}, ${logo_url}, ${primary_color}, ${campus_image}, ${JSON.stringify(games)})
            ON CONFLICT (name) 
            DO UPDATE SET 
                logo_url = EXCLUDED.logo_url,
                primary_color = EXCLUDED.primary_color,
                campus_image = EXCLUDED.campus_image,
                games = EXCLUDED.games
            RETURNING *
        `;

        return new Response(JSON.stringify({ success: true, team: result[0] }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Save Team error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
