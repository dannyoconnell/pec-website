import { neon } from '@netlify/neon';

export default async (req, context) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const sql = neon(process.env.DATABASE_URL.trim());

    try {
        const { team, players } = await req.json();

        if (!team) {
            return new Response("Missing team name", { status: 400 });
        }

        // Transaction-like approach (manual since Neon HTTP is stateless per query usually, but batching works)
        // 1. Delete existing roster for this team
        await sql`DELETE FROM rosters WHERE team = ${team}`;

        // 2. Insert new players
        if (players && players.length > 0) {
            for (const p of players) {
                await sql`
                    INSERT INTO rosters (team, player_name, role, game)
                    VALUES (${team}, ${p.name}, ${p.role}, ${p.game})
                `;
            }
        }

        return new Response(JSON.stringify({ success: true }), {
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
