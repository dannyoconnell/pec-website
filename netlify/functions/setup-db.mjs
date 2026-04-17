import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Helper to clean connection string (taken from get-schedule.mjs)
let connString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "";
connString = connString.replace(/['"]/g, "").trim();
// Remove channel_binding if present (HTTP driver doesn't needed it/might choke) or keep it if standard?
// The existing function REMOVES it.
connString = connString.replace(/(&|\?)channel_binding=require/, "");
if (!connString.includes("sslmode=")) {
    connString += (connString.includes("?") ? "&" : "?") + "sslmode=require";
}

console.log("Using Connection String (masked):", connString.replace(/:[^:@]+@/, ':***@'));

const sql = neon(connString);

// Data Definitions
const teams = ['Baylor', 'Boise State', 'Kansas', 'Michigan State', 'Minnesota', 'Nebraska', 'Ohio State', 'Syracuse', 'Utah'];

const teamLogos = {
    'Baylor': 'https://a.espncdn.com/i/teamlogos/ncaa/500/239.png',
    'Boise State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/68.png',
    'Kansas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png',
    'Michigan State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/127.png',
    'Minnesota': 'https://a.espncdn.com/i/teamlogos/ncaa/500/135.png',
    'Nebraska': 'https://a.espncdn.com/i/teamlogos/ncaa/500/158.png',
    'Ohio State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png',
    'Syracuse': 'https://a.espncdn.com/i/teamlogos/ncaa/500/183.png',
    'Utah': 'https://a.espncdn.com/i/teamlogos/ncaa/500/254.png',
    'BYE': 'placeholder.png'
};

const teamColors = {
    'Baylor': '#154734',
    'Boise State': '#0033A0',
    'Kansas': '#0051BA',
    'Michigan State': '#18453B',
    'Minnesota': '#7A0019',
    'Nebraska': '#E41C38',
    'Ohio State': '#BB0000',
    'Syracuse': '#F76900',
    'Utah': '#CC0000',
    'BYE': '#334155'
};

const generateSeries = (teamA, teamB, timeBase) => {
    const formatTime = (base, offset = 0) => {
        if (!base || base === '-') return '-';
        let h = parseInt(base);
        if (isNaN(h)) return base;
        h += offset;
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h > 12 ? h - 12 : h;
        return `${displayH}:00 ${period} EST`;
    };

    let games = [
        { teamA, teamB, time: formatTime(timeBase, 0), game: 'Rocket League' },
        { teamA, teamB, time: formatTime(timeBase, 0), game: 'Overwatch 2' },
        { teamA, teamB, time: formatTime(timeBase, 0), game: 'Smash Bros' },
        { teamA, teamB, time: formatTime(timeBase, 0), game: 'Valorant' }
    ];

    if (teamA === 'Michigan State' || teamB === 'Michigan State') games = games.filter(g => g.game !== 'Overwatch 2');
    if (teamA === 'Utah' || teamB === 'Utah') games = games.filter(g => g.game !== 'Smash Bros');

    if (teamB === 'BYE') {
        const potentialGames = ['Rocket League', 'Overwatch 2', 'Smash Bros', 'Valorant'];
        return potentialGames
            .filter(g => {
                if ((teamA === 'Michigan State') && g === 'Overwatch 2') return false;
                if ((teamA === 'Utah') && g === 'Smash Bros') return false;
                return true;
            })
            .map(game => ({ teamA, teamB: 'BYE', time: '-', game, scoreA: null, scoreB: null, status: 'SCHEDULED' }));
    }
    return games;
};

const initialScheduleData = [
    { week: 1, date: 'Jan 19', matches: [...generateSeries('Michigan State', 'Syracuse', '20:00'), ...generateSeries('Ohio State', 'Minnesota', '20:00'), ...generateSeries('Baylor', 'Nebraska', '20:00'), ...generateSeries('Boise State', 'Utah', '20:00'), ...generateSeries('Kansas', 'BYE', '-')] },
    { week: 2, date: 'Jan 26', matches: [...generateSeries('Michigan State', 'Boise State', '20:00'), ...generateSeries('Ohio State', 'Syracuse', '20:00'), ...generateSeries('Kansas', 'Nebraska', '20:00'), ...generateSeries('Baylor', 'Utah', '20:00'), ...generateSeries('Minnesota', 'BYE', '-')] },
    { week: 3, date: 'Feb 2', matches: [...generateSeries('Michigan State', 'Ohio State', '20:00'), ...generateSeries('Kansas', 'Utah', '20:00'), ...generateSeries('Baylor', 'Boise State', '20:00'), ...generateSeries('Nebraska', 'Minnesota', '20:00'), ...generateSeries('Syracuse', 'BYE', '-')] },
    { week: 4, date: 'Feb 9', matches: [...generateSeries('Syracuse', 'Kansas', '20:00'), ...generateSeries('Utah', 'Ohio State', '20:00'), ...generateSeries('Minnesota', 'Baylor', '20:00'), ...generateSeries('Boise State', 'Nebraska', '20:00'), ...generateSeries('Michigan State', 'BYE', '-')] },
    { week: 5, date: 'Feb 16', matches: [...generateSeries('Kansas', 'Michigan State', '20:00'), ...generateSeries('Nebraska', 'Syracuse', '20:00'), ...generateSeries('Ohio State', 'Boise State', '20:00'), ...generateSeries('Utah', 'Minnesota', '20:00'), ...generateSeries('Baylor', 'BYE', '-')] },
    { week: 6, date: 'Feb 23', matches: [...generateSeries('Michigan State', 'Minnesota', '20:00'), ...generateSeries('Baylor', 'Ohio State', '20:00'), ...generateSeries('Boise State', 'Kansas', '20:00'), ...generateSeries('Syracuse', 'Utah', '20:00'), ...generateSeries('Nebraska', 'BYE', '-')] },
    { week: 7, date: 'Mar 2', matches: [...generateSeries('Utah', 'Michigan State', '20:00'), ...generateSeries('Minnesota', 'Boise State', '20:00'), ...generateSeries('Nebraska', 'Ohio State', '20:00'), ...generateSeries('Kansas', 'Baylor', '20:00'), ...generateSeries('Syracuse', 'BYE', '-')] },
    { week: 8, date: 'Mar 9', matches: [...generateSeries('Michigan State', 'Nebraska', '20:00'), ...generateSeries('Syracuse', 'Minnesota', '20:00'), ...generateSeries('Utah', 'Boise State', '20:00'), ...generateSeries('Ohio State', 'Kansas', '20:00'), ...generateSeries('Baylor', 'BYE', '-')] },
    { week: 9, date: 'Mar 16', matches: [...generateSeries('Boise State', 'Michigan State', '20:00'), ...generateSeries('Minnesota', 'Kansas', '20:00'), ...generateSeries('Nebraska', 'Utah', '20:00'), ...generateSeries('Syracuse', 'Baylor', '20:00'), ...generateSeries('Ohio State', 'BYE', '-')] }
];

const initialScoresData = [
    { teamA: 'Syracuse', scoreA: 1, teamB: 'Kansas', scoreB: 2, status: 'FINAL', game: 'Rocket League' },
    { teamA: 'Baylor', scoreA: 3, teamB: 'Utah', scoreB: 0, status: 'FINAL', game: 'Valorant' },
    { teamA: 'Michigan State', scoreA: 1, teamB: 'Ohio State', scoreB: 1, status: 'LIVE', game: 'Overwatch 2' }
];

const generateRoster = (teamName) => {
    const roles = {
        'Rocket League': ['Captain', 'Starter', 'Starter'],
        'Overwatch 2': ['Tank', 'DPS', 'DPS', 'Support', 'Support'],
        'Smash Bros': ['Player', 'Player', 'Player', 'Player'],
        'Valorant': ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex']
    };

    const roster = [];
    const adjs = ['Swift', 'Bold', 'Crimson', 'Azure', 'Shadow', 'Light', 'Dark', 'Hyper', 'Pro', 'Elite', 'Iron', 'Neon', 'Cyber', 'Viper', 'Ghost'];
    const nouns = ['Striker', 'Wing', 'Blade', 'Falcon', 'Wolf', 'Tiger', 'Ninja', 'Knight', 'Wizard', 'Shot', 'Aim', 'Dash', 'Spark', 'Flow', 'Mind'];

    Object.keys(roles).forEach(game => {
        if (teamName === 'Michigan State' && game === 'Overwatch 2') return;
        if (teamName === 'Utah' && game === 'Smash Bros') return;

        roles[game].forEach((role, i) => {
            const name = adjs[Math.floor(Math.random() * adjs.length)] + nouns[Math.floor(Math.random() * nouns.length)] + (Math.floor(Math.random() * 99));
            roster.push({
                name: name,
                game: game,
                role: role
            });
        });
    });
    return roster;
};

const runSetup = async () => {
    try {
        const response = await setup();
        const text = await response.text();
        console.log(text);
    } catch (e) {
        console.error("Setup failed:", e);
    }
};

const setup = async () => {
    try {
        console.log("Creating Teams Table...");
        await sql`DROP TABLE IF EXISTS rosters CASCADE`;
        await sql`DROP TABLE IF EXISTS matches CASCADE`;
        await sql`DROP TABLE IF EXISTS teams CASCADE`;

        await sql`
            CREATE TABLE teams (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                logo_url TEXT,
                primary_color TEXT,
                campus_image TEXT,
                games JSONB DEFAULT '["Rocket League", "Overwatch 2", "Smash Bros", "Valorant"]'
            )
        `;

        console.log("Creating Matches Table...");
        await sql`
            CREATE TABLE matches (
                id SERIAL PRIMARY KEY,
                week INTEGER NOT NULL,
                date TEXT,
                game TEXT,
                team_a TEXT REFERENCES teams(name),
                team_b TEXT, 
                score_a INTEGER,
                score_b INTEGER,
                status TEXT,
                time TEXT
            )
        `;

        console.log("Creating Rosters Table...");
        await sql`
            CREATE TABLE rosters (
                id SERIAL PRIMARY KEY,
                team TEXT REFERENCES teams(name),
                name TEXT,
                game TEXT,
                role TEXT
            )
        `;

        console.log("Seeding Teams...");
        for (const name of teams) {
            if (name === 'BYE') continue;
            const games = [
                'Rocket League',
                'Overwatch 2',
                'Smash Bros',
                'Valorant'
            ];
            // Apply specific defaults if needed (e.g. Michigan State no OW2, Utah no Smash)
            if (name === 'Michigan State') {
                const idx = games.indexOf('Overwatch 2');
                if (idx > -1) games.splice(idx, 1);
            }
            if (name === 'Utah') {
                const idx = games.indexOf('Smash Bros');
                if (idx > -1) games.splice(idx, 1);
            }

            await sql`INSERT INTO teams (name, logo_url, primary_color, games) VALUES (${name}, ${teamLogos[name]}, ${teamColors[name]}, ${JSON.stringify(games)})`;
        }

        console.log("Seeding Matches...");
        let flattenedMatches = [];
        initialScheduleData.forEach(w => {
            w.matches.forEach(m => {
                const override = initialScoresData.find(s =>
                    s.game === m.game &&
                    ((s.teamA === m.teamA && s.teamB === m.teamB) || (s.teamA === m.teamB && s.teamB === m.teamA))
                );

                let scoreA = m.scoreA;
                let scoreB = m.scoreB;
                let status = m.status || 'SCHEDULED';

                if (override) {
                    if (override.teamA === m.teamA) {
                        scoreA = override.scoreA;
                        scoreB = override.scoreB;
                    } else {
                        scoreA = override.scoreB;
                        scoreB = override.scoreA;
                    }
                    status = override.status;
                }

                const finalSA = (scoreA === '-' || scoreA === null || scoreA === undefined) ? null : parseInt(scoreA);
                const finalSB = (scoreB === '-' || scoreB === null || scoreB === undefined) ? null : parseInt(scoreB);

                if (finalSA !== null && status === 'SCHEDULED') status = 'FINAL';

                flattenedMatches.push({
                    week: w.week,
                    date: w.date,
                    game: m.game,
                    team_a: m.teamA,
                    team_b: m.teamB,
                    score_a: finalSA,
                    score_b: finalSB,
                    status: status,
                    time: m.time
                });
            });
        });

        for (const m of flattenedMatches) {
            await sql`
                INSERT INTO matches (week, date, game, team_a, team_b, score_a, score_b, status, time) 
                VALUES (${m.week}, ${m.date}, ${m.game}, ${m.team_a}, ${m.team_b}, ${m.score_a}, ${m.score_b}, ${m.status}, ${m.time})
             `;
        }

        console.log("Seeding Rosters...");
        for (const team of teams) {
            if (team === 'BYE') continue;
            const roster = generateRoster(team);
            for (const p of roster) {
                await sql`INSERT INTO rosters (team, name, game, role) VALUES (${team}, ${p.name}, ${p.game}, ${p.role})`;
            }
        }

        return new Response("Migration Complete!", { status: 200 });

    } catch (e) {
        console.error("Migration Failed", e);
        return new Response(`Migration Failed: ${e.message}`, { status: 500 });
    }
};

export default setup;

// Run if script is the main module
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    runSetup();
} else if (process.argv[1].endsWith('setup-db.mjs')) {
    // Fallback for some node versions/environments
    runSetup();
}
