import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
    // CORS Preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });
    }

    if (req.method !== 'POST') {
        return new Response("Method Not Allowed", { status: 405 });
    }

    let connString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "";
    connString = connString.replace(/['"]/g, "").trim();
    connString = connString.replace(/(&|\?)channel_binding=require/, "");
    if (!connString.includes("sslmode=")) {
        connString += (connString.includes("?") ? "&" : "?") + "sslmode=require";
    }
    const sql = neon(connString);

    try {
        const { team, players } = await req.json();

        if (!team) {
            throw new Error("Missing 'team' in payload");
        }

        console.log(`Updating Roster for Team: ${team} (${players ? players.length : 0} players)`);

        // 1. Delete Only this Team's Roster
        await sql`DELETE FROM rosters WHERE team = ${team}`;

        // 2. Ensure Team Exists
        await sql`
            INSERT INTO teams (name) VALUES (${team}) 
            ON CONFLICT (name) DO NOTHING
        `;

        // 3. Insert New Players
        if (Array.isArray(players) && players.length > 0) {
            for (const p of players) {
                await sql`
                    INSERT INTO rosters (team, name, game, role, photo)
                    VALUES (${team}, ${p.name || ''}, ${p.game || ''}, ${p.role || ''}, ${p.photo || ''})
                `;
            }
        }

        return new Response(JSON.stringify({ success: true, team, count: players ? players.length : 0 }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (error) {
        console.error("Save Roster Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
};
