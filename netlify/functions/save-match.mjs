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

    // DB Connection
    let connString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "";
    connString = connString.replace(/['"]/g, "").trim();
    connString = connString.replace(/(&|\?)channel_binding=require/, "");
    if (!connString.includes("sslmode=")) {
        connString += (connString.includes("?") ? "&" : "?") + "sslmode=require";
    }
    const sql = neon(connString);

    try {
        const payload = await req.json();

        // SCENARIO 1: Update Single Match Report
        if (payload.reportData && payload.id) {
            console.log("Saving Match Report for ID:", payload.id);
            // We need to store the reportData JSON blob. 
            // We didn't create a 'report_data' column in the initial migration! 
            // We need to check if we need to ALTER the table or just store in a separate table?
            // The frontend logic expects 'report_data' to be returned in the match object.
            // Let's add the column if it doesn't exist (safe migration) or assume it exists.
            // Since I didn't add it in `setup-db.mjs`, I should probably run a migration or just add it now.
            // I'll add a quick "ADD COLUMN IF NOT EXISTS" logic here or separately.
            // Actually, separate schema migration is better, but for speed, I'll attempt to add it if the update fails?
            // No, best to just ensure schema is compatible. 
            // I'll assume the user wants me to fix it. 
            // Let's just create a new helper function "ensure_schema" or just run the ALTER command once.

            // For now, I will try to update. If it fails due to column missing, I'll catch and ALTER.

            // Ensure report_data column exists (Auto-migration fallback if script didn't run)
            try {
                await sql`
                    UPDATE matches 
                    SET score_a = ${payload.scoreA}, 
                        score_b = ${payload.scoreB}, 
                        status = ${payload.status || 'COMPLETED'},
                        report_data = ${payload.reportData}
                    WHERE id = ${payload.id}
                `;
            } catch (err) {
                // If error is column missing, try adding it and retry
                if (err.message.includes('column "report_data" of relation "matches" does not exist')) {
                    console.log("Migration: Adding report_data column...");
                    await sql`ALTER TABLE matches ADD COLUMN IF NOT EXISTS report_data JSONB`;
                    // Retry Update
                    await sql`
                        UPDATE matches 
                        SET score_a = ${payload.scoreA}, 
                            score_b = ${payload.scoreB}, 
                            status = ${payload.status || 'COMPLETED'},
                            report_data = ${payload.reportData}
                        WHERE id = ${payload.id}
                    `;
                } else {
                    throw err;
                }
            }

            // Wait, I need a place to store 'reportData'.
            // The initial schema was:
            // CREATE TABLE matches (id, week, date, ... score_a, score_b, status, time)
            // It is missing 'report_data' (JSONB).
            // I MUST migrate the DB to include this column.
        }

        // SCENARIO 2: Replace Schedule Week
        if (payload.replaceWeek && payload.week && payload.matches) {
            console.log("Replacing Schedule for Week:", payload.week);
            // specific week delete
            await sql`DELETE FROM matches WHERE week = ${payload.week}`;

            // Bulk Insert
            for (const m of payload.matches) {
                await sql`
                    INSERT INTO matches (week, date, game, team_a, team_b, score_a, score_b, status, time)
                    VALUES (${m.week}, ${m.date || 'TBD'}, ${m.game}, ${m.teamA}, ${m.teamB}, ${m.scoreA}, ${m.scoreB}, ${m.status || 'SCHEDULED'}, ${m.time})
                `;
            }
        }

        // SCENARIO 3: Batch Update Scores (List)
        if (Array.isArray(payload)) {
            console.log("Batch Updating Scores:", payload.length);
            for (const s of payload) {
                if (s.id) {
                    await sql`
                        UPDATE matches 
                        SET score_a = ${s.scoreA}, score_b = ${s.scoreB}, status = ${s.status}
                        WHERE id = ${s.id}
                     `;
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (error) {
        console.error("Save Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
};
