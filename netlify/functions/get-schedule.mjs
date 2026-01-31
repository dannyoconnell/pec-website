import { neon } from '@neondatabase/serverless';

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
    const weekParam = url.searchParams.get('week');

    try {
        let matches;
        if (weekParam) {
            matches = await sql`SELECT id, week, date, time, game, team_a, team_b, score_a, score_b, status, report_data FROM matches WHERE week = ${weekParam} ORDER BY date, time`;
        } else {
            matches = await sql`SELECT id, week, date, time, game, team_a, team_b, score_a, score_b, status, report_data FROM matches ORDER BY week, date, time`;
        }

        return new Response(JSON.stringify(matches), {
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
