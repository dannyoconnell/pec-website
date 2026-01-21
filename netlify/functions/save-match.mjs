import { neon } from '@netlify/neon';

export default async (req, context) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const sql = neon(process.env.DATABASE_URL.trim());

    try {
        const data = await req.json(); // Expects array or single object
        const items = Array.isArray(data) ? data : [data];

        for (const m of items) {
            // Basic Validation
            if (!m.week || !m.game || !m.teamA || !m.teamB) {
                console.warn("Skipping invalid match data", m);
                continue;
            }

            // We need a unique constraint to UPSERT. 
            // The schema has 'id' SERIAL PRIMARY KEY.
            // If the frontend sends an ID, we update. If not, we insert.
            // BUT, initially, we might simply clear and re-insert for schedule saving, 
            // OR we use a composite key concept (week-game-teamA-teamB).
            // Let's assume for now the frontend manages IDs or we default to finding by natural key.
            // Actually, simplest migration: The user edits schedule by "Saving Schedule" which dumps the whole week.
            // But 'save-match' usually implies saving ONE match result.

            if (m.id) {
                // Update specific match (Score reporting)
                await sql`
                    UPDATE matches 
                    SET score_a = ${m.scoreA}, 
                        score_b = ${m.scoreB}, 
                        status = ${m.status}, 
                        report_data = ${m.reportData}
                    WHERE id = ${m.id}
                `;
            } else {
                // Insert New Match (Schedule Building) or Update by Natural Key
                // Let's try to find by natural key first to avoid duplicates if ID is missing
                const existing = await sql`SELECT id FROM matches WHERE week = ${m.week} AND game = ${m.game} AND team_a = ${m.teamA} AND team_b = ${m.teamB}`;

                if (existing.length > 0) {
                    await sql`
                        UPDATE matches 
                        SET date = ${m.date}, time = ${m.time}, score_a = ${m.scoreA}, score_b = ${m.scoreB}, status = ${m.status}
                        WHERE id = ${existing[0].id}
                     `;
                } else {
                    await sql`
                        INSERT INTO matches (week, game, team_a, team_b, score_a, score_b, status, date, time, report_data)
                        VALUES (${m.week}, ${m.game}, ${m.teamA}, ${m.teamB}, ${m.scoreA || 0}, ${m.scoreB || 0}, ${m.status || 'SCHEDULED'}, ${m.date}, ${m.time}, ${m.reportData || null})
                     `;
                }
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
