import { neon } from '@netlify/neon';

export default async (req, context) => {
    // Aggressive cleanup
    let connString = process.env.DATABASE_URL || "";
    connString = connString.replace(/['"]/g, "").trim();
    connString = connString.replace(/(&|\?)channel_binding=require/, "");
    if (!connString.includes("sslmode=")) {
        connString += (connString.includes("?") ? "&" : "?") + "sslmode=require";
    }

    const sql = neon(connString);
    const url = new URL(req.url);
    const teamParam = url.searchParams.get('team');

    try {
        let rows;
        if (teamParam) {
            rows = await sql`SELECT * FROM rosters WHERE team = ${teamParam}`;
        } else {
            rows = await sql`SELECT * FROM rosters`;
        }

        // Group by Team if fetching all
        // Or return flat list? The frontend expects a dictionary { "TeamName": [players] }

        const rosterData = {};
        for (const row of rows) {
            if (!rosterData[row.team]) rosterData[row.team] = [];
            rosterData[row.team].push({
                id: row.id,
                name: row.player_name,
                role: row.role,
                game: row.game
            });
        }

        return new Response(JSON.stringify(rosterData), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
