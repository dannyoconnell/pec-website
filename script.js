// --- Global State & Persistence ---

// --- Logo Data (Global) ---
const teamLogos = {
    'Baylor': 'https://a.espncdn.com/i/teamlogos/ncaa/500/239.png',
    'Boise State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/68.png',
    'Kansas': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png', // Using 2305 (standard) or 126. 2305 is safe.
    'Michigan State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/127.png',
    'Mich State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/127.png',
    'Minnesota': 'https://a.espncdn.com/i/teamlogos/ncaa/500/135.png',
    'Nebraska': 'https://a.espncdn.com/i/teamlogos/ncaa/500/158.png',
    'Ohio State': 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png',
    'Syracuse': 'https://a.espncdn.com/i/teamlogos/ncaa/500/183.png',
    'Utah': 'https://a.espncdn.com/i/teamlogos/ncaa/500/254.png',
    'BYE': 'placeholder.png'
};

const teamColors = {
    'Baylor': '#154734', // Green
    'Boise State': '#0033A0', // Blue (secondary #D64309 orange)
    'Kansas': '#0051BA', // Blue (secondary #E8000D red)
    'Michigan State': '#18453B', // Green
    'Mich State': '#18453B',
    'Minnesota': '#7A0019', // Maroon
    'Nebraska': '#E41C38', // Scarlet
    'Ohio State': '#BB0000', // Scarlet
    'Syracuse': '#F76900', // Orange
    'Utah': '#CC0000', // Red
    'BYE': '#334155'
};
window.teamColors = teamColors;

window.teamLogos = teamLogos; // Ensure explicitly on window for admin.html

const teams = ['Baylor', 'Boise State', 'Kansas', 'Michigan State', 'Minnesota', 'Nebraska', 'Ohio State', 'Syracuse', 'Utah'];

const getLogoImg = (name, size = '70%') => {
    if (name === 'BYE') return '-';
    // Handle potential missing logos gracefully
    const file = teamLogos[name] || 'placeholder.png';
    return `<img src="${file}" alt="${name}" style="width:${size}; height:${size}; object-fit:contain;">`;
};
window.getLogoImg = getLogoImg;

// --- Helper for generating 4-game series (Global) ---
const generateSeries = (teamA, teamB, timeBase) => {
    // Format Time Helper (24h -> 12h)
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

    // Apply Exclusions
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
            .map(game => ({ teamA, teamB: 'BYE', time: '-', game, scoreA: '-', scoreB: '-' }));
    }
    return games;
};
window.generateSeries = generateSeries; // Ensure global access for Admin

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
    { teamA: 'Kansas', scoreA: 2, teamB: 'Syracuse', scoreB: 1, status: 'FINAL', game: 'Rocket League' },
    { teamA: 'Utah', scoreA: 0, teamB: 'Baylor', scoreB: 3, status: 'FINAL', game: 'Valorant' },
    { teamA: 'Mich State', scoreA: 1, teamB: 'Ohio State', scoreB: 1, status: 'LIVE', game: 'Overwatch 2' }
];

// --- Roster Generation Logic ---
const generateRoster = (teamName) => {
    const roles = {
        'Rocket League': ['Captain', 'Starter', 'Starter'],
        'Overwatch 2': ['Tank', 'DPS', 'DPS', 'Support', 'Support'],
        'Smash Bros': ['Player', 'Player', 'Player', 'Player'],
        'Valorant': ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex']
    };

    const roster = [];

    // Funny/Random Names parts
    const adjs = ['Swift', 'Bold', 'Crimson', 'Azure', 'Shadow', 'Light', 'Dark', 'Hyper', 'Pro', 'Elite', 'Iron', 'Neon', 'Cyber', 'Viper', 'Ghost'];
    const nouns = ['Striker', 'Wing', 'Blade', 'Falcon', 'Wolf', 'Tiger', 'Ninja', 'Knight', 'Wizard', 'Shot', 'Aim', 'Dash', 'Spark', 'Flow', 'Mind'];

    Object.keys(roles).forEach(game => {
        // Exclude Michigan State from OW2 and Utah from Smash per rules
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

const initialRosterData = {};
teams.forEach(t => {
    if (t !== 'BYE') {
        initialRosterData[t] = generateRoster(t);
    }
});

async function loadAppData() {
    try {
        let matches = [];
        let rosters = {};
        let usingFallback = false;

        try {
            console.log("Fetching Data from API...");
            const [scheduleRes, rosterRes] = await Promise.all([
                fetch('/.netlify/functions/get-schedule'),
                fetch('/.netlify/functions/get-roster')
            ]);

            if (!scheduleRes.ok || !rosterRes.ok) throw new Error("API Network Error");

            matches = await scheduleRes.json();
            rosters = await rosterRes.json();
        } catch (apiErr) {
            console.warn("API unavailable (using local fallback).", apiErr);
            usingFallback = true;

            // 1. Try Local Storage
            const localMatches = localStorage.getItem('pec_matches');
            const localRosters = localStorage.getItem('pec_rosters');

            if (localMatches) {
                matches = JSON.parse(localMatches);
            } else {
                // 2. Fallback to Initial Data (Flattened)
                // Convert camelCase initialScheduleData to snake_case matches for consistency
                let idCounter = 1;
                initialScheduleData.forEach(w => {
                    w.matches.forEach(m => {
                        matches.push({
                            id: idCounter++,
                            week: w.week,
                            date: w.date, // Note: DB might store date efficiently, here we propagate
                            team_a: m.teamA,
                            team_b: m.teamB,
                            score_a: m.scoreA === '-' ? null : m.scoreA,
                            score_b: m.scoreB === '-' ? null : m.scoreB,
                            status: (m.scoreA !== '-' && m.scoreA !== undefined) ? 'FINAL' : 'SCHEDULED', // Simple inference
                            game: m.game,
                            time: m.time
                        });
                    });
                });

                // Add initial scores overrides if any
                initialScoresData.forEach(s => {
                    // Find match and update
                    const match = matches.find(m => m.team_a === s.teamA && m.team_b === s.teamB && m.game === s.game);
                    if (match) {
                        match.score_a = s.scoreA;
                        match.score_b = s.scoreB;
                        match.status = s.status;
                    }
                });
            }

            if (localRosters) {
                rosters = JSON.parse(localRosters);
            } else {
                rosters = initialRosterData;
            }
        }

        // Load Persistent Match Reports (from Admin)
        let savedReports = {};
        try {
            const localReports = localStorage.getItem('pec_match_reports');
            if (localReports) {
                savedReports = JSON.parse(localReports);
            }
        } catch (e) {
            console.error("Error loading match reports:", e);
        }

        // 1. Process Roster
        rosterData = rosters || {};
        window.rosterData = rosterData;

        // 2. Process Matches into ScheduleData (Weeks), Scores, and Reports
        const weeks = {};
        scores = []; // Reset global scores
        matchReports = {}; // Reset global reports

        matches.forEach(m => {
            // Populate Scores List (for Ticker)
            // Map DB columns to frontend expected keys
            scores.push({
                id: m.id,
                teamA: m.team_a,
                teamB: m.team_b,
                scoreA: m.score_a,
                scoreB: m.score_b,
                status: m.status,
                game: m.game,
                week: m.week
            });

            // Populate Match Reports
            const reportId = `${m.week}-${m.game}-${m.team_a}-${m.team_b}`.replace(/\s+/g, '');
            // Merge: Saved Report (highest priority) -> m.report_data -> Empty
            matchReports[reportId] = { ...(m.report_data || {}), ...(savedReports[reportId] || {}) };

            // If saved report has scores, likely use them. Otherwise fallback to top-level match scores (if consistent)
            // But usually, saved report IS the source of truth for "Details", so we trust it.
            // Ensure base score is reflected if missing in report but present in match
            if (matchReports[reportId].scoreA === undefined) matchReports[reportId].scoreA = m.score_a;
            if (matchReports[reportId].scoreB === undefined) matchReports[reportId].scoreB = m.score_b;

            // Group for Schedule
            if (!weeks[m.week]) {
                weeks[m.week] = { week: m.week, date: m.date || 'TBD', matches: [] };
            }

            weeks[m.week].matches.push({
                id: m.id,
                teamA: m.team_a,
                teamB: m.team_b,
                time: m.time,
                game: m.game,
                scoreA: m.score_a,
                scoreB: m.score_b,
                status: m.status,
                week: m.week
            });
        });

        // Convert Weeks map to sorted array
        scheduleData = Object.values(weeks).sort((a, b) => a.week - b.week);

        if (usingFallback && matches.length === 0) {
            console.log("No data found.");
        }

    } catch (e) {
        console.error("Critical Error loading data", e);
    }
}

function saveAppData() {
    console.warn("saveAppData is deprecated. Use API directly.");
}
window.saveAppData = saveAppData;
window.resetAppData = async () => {
    // This previously cleared localStorage. Now it should maybe call a reset endpoint?
    if (confirm("Reset Database? This is for DEV purposes.")) {
        // Implement reset endpoint call if exists, else just reload
        window.location.reload();
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Load Data First
    await loadAppData();

    // --- Global Settings ---
    let currentWeek = 1;
    try {
        const settings = JSON.parse(localStorage.getItem('pec_settings') || '{}');
        currentWeek = parseInt(settings.currentWeek || 1);
    } catch (e) {
        console.warn("Could not load settings", e);
    }

    // --- Components ---

    // Ticker Generator
    const renderTicker = (filterGame = 'all') => {
        const tickerContainer = document.getElementById('score-ticker');
        if (!tickerContainer) return;

        let displayScores = scores;

        // Filter by Current Week (and Status if needed, but Ticker usually shows recent/live)
        // For this specific request: "only show ticker scores from the week it is set to"
        displayScores = displayScores.filter(s => s.week === currentWeek);

        if (filterGame !== 'all') {
            displayScores = displayScores.filter(s => s.game === filterGame);
        }

        // If no scores for this week, show message
        if (displayScores.length === 0) {
            tickerContainer.innerHTML = `<div class="ticker-item" style="padding-left:1rem">No matches found for Week ${currentWeek}</div>`;
            return;
        }

        // Duplicate for scrolling effect (if enough items)
        const allScores = [...displayScores, ...displayScores, ...displayScores];

        const createTickerItem = (match) => {
            const isLive = match.status === 'LIVE';
            const sA = (match.scoreA === null || match.scoreA === undefined || match.scoreA === '') ? 0 : match.scoreA;
            const sB = (match.scoreB === null || match.scoreB === undefined || match.scoreB === '') ? 0 : match.scoreB;
            return `
                <div class="ticker-item">
                    ${isLive ? '<span class="live-badge">● LIVE</span>' : ''}
                    <span class="ticker-teams">${match.teamA} vs ${match.teamB}</span>
                    <span class="ticker-score">${sA} - ${sB}</span>
                    <span style="opacity: 0.5; font-size: 0.8em; margin-left:5px">(${match.game})</span>
                </div>
                <div style="opacity: 0.2">|</div>
            `;
        };

        tickerContainer.innerHTML = allScores.map(createTickerItem).join('');
    };

    // Schedule Card Generator
    // Schedule Card Generator
    const createMatchCard = (match, dateLabel) => {
        const isBye = match.teamB === 'BYE';
        // Encode params for details page
        const detailsUrl = `match-details.html?teamA=${encodeURIComponent(match.teamA)}&teamB=${encodeURIComponent(match.teamB)}&game=${encodeURIComponent(match.game)}&week=${match.week || 1}`;

        // Check for Report/Score
        let scoreDisplay = isBye ? 'OFF' : 'VS';
        const reportId = `${match.week || 1}-${match.game}-${match.teamA}-${match.teamB}`.replace(/\s+/g, '');
        const report = matchReports[reportId];

        if (report && (report.status === 'FINAL' || (report.scoreA !== undefined && report.scoreA !== null && report.scoreA !== ''))) {
            // Determine winner style
            const scoreA = parseInt(report.scoreA || 0);
            const scoreB = parseInt(report.scoreB || 0);

            // Just show score usually, 3-0 etc.
            // Maybe colorize?
            // Let's just show standard "3 - 0"
            scoreDisplay = `
                <div style="font-size: 1.5rem; font-weight: 700; letter-spacing: 2px;">
                    <span style="color: ${scoreA > scoreB ? 'var(--accent-green)' : (scoreA < scoreB ? 'var(--text-muted)' : 'inherit')}">${scoreA}</span>
                    <span style="color:var(--text-muted); font-size:1rem; margin:0 0.2rem;">-</span>
                    <span style="color: ${scoreB > scoreA ? 'var(--accent-green)' : (scoreB < scoreA ? 'var(--text-muted)' : 'inherit')}">${scoreB}</span>
                </div>
            `;
        } else if (match.status === 'LIVE' || (report && report.status === 'LIVE')) {
            scoreDisplay = `<span class="live-badge">● LIVE</span>`;
        }

        return `
            <div class="match-card">
                <div class="match-header">
                    <span>${dateLabel}</span>
                    <span>${match.game}</span>
                </div>
                <div class="match-teams">
                    <div class="team">
                        <div class="team-logo">${getLogoImg(match.teamA)}</div>
                        <div class="team-name">${match.teamA}</div>
                    </div>
                    <div class="vs" style="display:flex; align-items:center; justify-content:center;">${scoreDisplay}</div>
                    <div class="team">
                        <div class="team-logo">${getLogoImg(match.teamB)}</div>
                        <div class="team-name">${match.teamB}</div>
                    </div>
                </div>
                <div class="match-footer" style="padding-top:0.5rem; text-align:center; font-size:0.8rem; opacity:0.7">
                    ${match.time}
                </div>
                ${!isBye ? `<div style="margin-top: 1rem; text-align: center;">
                    <a href="${detailsUrl}" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; text-decoration:none;">Details</a>
                </div>` : ''}
            </div>
        `;
    };

    // ... (Existing code) ...

    // --- Match Details Page Logic ---
    const matchDetailsPage = document.querySelector('.match-details-page');
    if (matchDetailsPage) {
        const params = new URLSearchParams(window.location.search);
        const teamA = params.get('teamA');
        const teamB = params.get('teamB');
        const game = params.get('game');
        // ... (existing logic might be missing in view, assuming standard setup)

        if (teamA && teamB) {
            document.getElementById('detail-teamA-name').textContent = teamA;
            document.getElementById('detail-teamB-name').textContent = teamB;
            document.getElementById('detail-teamA-logo').innerHTML = getLogoImg(teamA, '100%');
            document.getElementById('detail-teamB-logo').innerHTML = getLogoImg(teamB, '100%');

            if (game) document.getElementById('match-game-type').textContent = game;

            // BG Gradient
            const scoreSection = document.querySelector('.match-scoreboard-section');
            if (scoreSection) {
                const colorA = teamColors[teamA] || '#1e293b';
                const colorB = teamColors[teamB] || '#0f172a';
                scoreSection.style.background = `linear-gradient(90deg, ${colorA} 0%, #0f172a 35%, #0f172a 65%, ${colorB} 100%)`;
                scoreSection.style.borderBottom = 'none';
            }

            // --- Fetch and Render Stats ---
            // 1. Find Match ID / Report Key
            // We need the week to confirm exact match, defaulting to URL param or scanning
            const weekParam = params.get('week');

            // --- Fetch and Render Stats ---
            // 1. Find Match ID / Report Key
            // const weekParam = params.get('week'); // Already declared above

            // Construct Report ID: week-game-teamA-teamB
            if (weekParam) {
                const reportId = `${weekParam}-${game}-${teamA}-${teamB}`.replace(/\s+/g, '');
                const report = matchReports[reportId];

                if (report) {
                    const statsTable = document.getElementById('player-stats-table');

                    // -- GAME SELECTOR LOGIC --
                    const filterContainer = document.getElementById('stats-filter-container');

                    const renderTable = (mode) => {
                        let displayStats = {};

                        // CASE 1: Series Total (Aggregate)
                        if (mode === 'series') {
                            const totals = report.stats || {};
                            // Display totals as stored
                            Object.keys(totals).forEach(pName => {
                                const t = totals[pName];
                                displayStats[pName.toLowerCase()] = {
                                    k: t.k, d: t.d, a: t.a, s: t.s, sh: t.sh
                                };
                            });
                        }
                        // CASE 2: Single Game Logic
                        else if (report.matchHistory && report.matchHistory[mode]) {
                            // Extract stats from specific replay
                            const replay = report.matchHistory[mode];

                            // Helper to extract into map
                            // Helper to extract into map
                            const extract = (teamObj) => {
                                if (teamObj.players) {
                                    teamObj.players.forEach(p => {
                                        // Check for Valorant specific stats
                                        const val = p.valorant || (p.stats && p.stats.valorant);
                                        if (val) {
                                            displayStats[p.name.toLowerCase()] = {
                                                k: val.k, d: val.d, a: val.a,
                                                acs: val.acs, econ: val.econ,
                                                fb: val.fb, pl: val.pl, df: val.df,
                                                agent: val.agent,
                                                s: val.acs
                                            };
                                        } else {
                                            // Fallback to Standard/Rocket League (Core)
                                            const core = p.stats ? p.stats.core : (p.core || {});
                                            displayStats[p.name.toLowerCase()] = {
                                                k: core.goals || 0,
                                                d: core.saves || 0,
                                                a: core.assists || 0,
                                                s: core.score || 0,
                                                sh: core.shots || 0
                                            };
                                        }
                                    });
                                }
                            };
                            extract(replay.blue);
                            extract(replay.orange);
                        }

                        // Update Headers
                        if (game === 'Rocket League') {
                            const thead = statsTable.querySelector('thead tr');
                            thead.innerHTML = `
                                 <th>Player</th>
                                 <th class="hide-mobile">Score</th>
                                 <th>Goals</th>
                                 <th>Assists</th>
                                 <th>Saves</th>
                                 <th class="hide-mobile">Shots</th>
                             `;
                        } else if (game === 'Valorant') {
                            const thead = statsTable.querySelector('thead tr');
                            thead.innerHTML = `
                                 <th>Agent</th>
                                 <th>Player</th>
                                 <th title="Combat Score">ACS</th>
                                 <th title="Kills">K</th>
                                 <th title="Deaths">D</th>
                                 <th title="Assists">A</th>
                                 <th title="Econ Rating" class="hide-mobile">Econ</th>
                                 <th title="First Bloods" class="hide-mobile">FB</th>
                                 <th title="Plants" class="hide-mobile">Pl</th>
                                 <th class="hide-mobile" title="Defuses">Def</th>
                             `;
                        }

                        // Render Rows
                        const tbody = statsTable.querySelector('tbody');
                        tbody.innerHTML = '';

                        const playersA = (rosterData[teamA] || []).filter(p => p.game === game);
                        const playersB = (rosterData[teamB] || []).filter(p => p.game === game);
                        const allPlayers = [...playersA, ...playersB];

                        // Sort by Score (S / ACS) descending
                        allPlayers.sort((a, b) => {
                            const sA = displayStats[a.name.toLowerCase()] || (displayStats[a.name] || {});
                            const sB = displayStats[b.name.toLowerCase()] || (displayStats[b.name] || {});
                            // Use 'acs' or 's'
                            const valA = parseFloat(sA.acs || sA.s || 0);
                            const valB = parseFloat(sB.acs || sB.s || 0);
                            if (valB !== valA) return valB - valA;
                            return parseFloat(sB.k || 0) - parseFloat(sA.k || 0);
                        });

                        // Valorant Agent Map
                        const VAL_UUIDS = {
                            "Jett": "add6443a-41bd-29cd-6f63-e8a697a9a429",
                            "Reyna": "a3bf32c8-47c3-38f3-42e8-c5b98bcefa48",
                            "Raze": "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
                            "Yoru": "7f94d92c-4234-0a36-9e67-0c9f139c2742",
                            "Neon": "bb2a4828-46eb-8cd1-e765-15848195d751",
                            "Iso": "0e38b510-41a8-57c3-f61b-158e7b96920b",
                            "Sova": "ded3520f-4264-bfed-162d-b080e2af2c94",
                            "Fade": "ade915bb-463f-2773-8678-f2b3e37536b6",
                            "Breach": "5f8d3a7f-467b-97f3-062c-13acf203c006",
                            "Omen": "8e253930-4c05-31dd-1b6c-968525494517",
                            "Brimstone": "9f0d8ba9-4140-b941-57d3-a98b48e9cc22",
                            "Phoenix": "e61e6871-464a-2936-7c64-42b322a49d79",
                            "Sage": "569fdd95-4d10-43ab-ca70-79becc718b46",
                            "Viper": "707eab51-4836-f488-046a-cda6bf494859",
                            "KAY/O": "601dbbe7-43ce-be57-2a40-4abd24953621",
                            "Killjoy": "1e58de9c-4950-5125-93e9-a0aee9f98746",
                            "Cypher": "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
                            "Astra": "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
                            "Chamber": "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
                            "Skye": "6f2a04ca-43e0-be17-7f36-a9841709db79",
                            "Gekko": "e370fa57-4757-3604-3648-499e1f642d3f",
                            "Harbor": "95c78238-448d-219d-716a-86dfc799dc3c",
                            "Deadlock": "cc8b64c8-4b25-4ff9-6e7f-37b4da43d234",
                            "Clove": "709e99eb-43e8-54f3-c5eb-l817b8f64e2e",
                            "Vyse": "" // TODO
                        };

                        const createRow = (p, teamName) => {
                            // Try lowercase lookup first, fall back to exact
                            const s = displayStats[p.name.toLowerCase()] || (displayStats[p.name] || {});

                            if (game === 'Valorant') {
                                const agentName = s.agent || '';
                                const uuid = VAL_UUIDS[agentName] || '';
                                const iconUrl = uuid ? `https://media.valorant-api.com/agents/${uuid}/displayicon.png` : '';
                                const acs = s.acs || s.s || 0; // fallback to S if ACS missing

                                return `
                                    <tr>
                                        <td>
                                            ${iconUrl ? `<img src="${iconUrl}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; background:#333;" title="${agentName}">` : '<div style="width:32px; height:32px; background:#333; border-radius:50%;"></div>'}
                                        </td>
                                        <td>
                                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                                <div style="width:3px; height:20px; background:${teamColors[teamName]}"></div>
                                                <div style="display:flex; flex-direction:column;">
                                                    <span style="font-weight:bold;">${p.name}</span>
                                                    <span style="font-size:0.7em; opacity:0.5;">${teamName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style="font-weight:bold; color:var(--accent-red)">${acs}</td>
                                        <td>${s.k || 0}</td>
                                        <td>${s.d || 0}</td>
                                        <td>${s.a || 0}</td>
                                        <td class="hide-mobile">${s.econ || 0}</td>
                                        <td class="hide-mobile">${s.fb || 0}</td>
                                        <td class="hide-mobile">${s.pl || 0}</td>
                                        <td class="hide-mobile">${s.df || 0}</td>
                                    </tr>
                                 `;
                            }

                            // Default Row (RL/OW2)
                            const sVal = s.s || 0;

                            return `
                                 <tr>
                                     <td>
                                         <div style="display:flex; align-items:center; gap:0.5rem;">
                                             <div style="width:3px; height:20px; background:${teamColors[teamName]}"></div>
                                             <span>${p.name}</span>
                                             <span style="font-size:0.7em; opacity:0.5; margin-left:auto">${teamName}</span>
                                         </div>
                                     </td>
                                     <td class="hide-mobile" style="font-weight:bold">${sVal}</td>
                                     <td>${s.k || 0}</td>
                                     <td>${s.a || 0}</td>
                                     <td>${s.d || 0}</td>
                                     <td class="hide-mobile">${s.sh || 0}</td>
                                 </tr>
                              `;
                        };

                        const rows = allPlayers.map(p => {
                            const team = playersA.includes(p) ? teamA : teamB;
                            return createRow(p, team);
                        }).join('');

                        tbody.innerHTML = rows;
                    };


                    // Init Filters
                    if (report.matchHistory && report.matchHistory.length > 0) {
                        filterContainer.innerHTML = ''; // Clear

                        // Series Button
                        const btnSeries = document.createElement('button');
                        btnSeries.className = 'btn btn-sm btn-primary';
                        btnSeries.textContent = 'Series Total';
                        btnSeries.onclick = () => { renderTable('series'); updateActive(btnSeries); };
                        filterContainer.appendChild(btnSeries);

                        // Game Buttons
                        report.matchHistory.forEach((_, idx) => {
                            const btn = document.createElement('button');
                            btn.className = 'btn btn-sm btn-outline';
                            btn.textContent = `Game ${idx + 1}`;
                            btn.onclick = () => { renderTable(idx); updateActive(btn); };
                            filterContainer.appendChild(btn);
                        });

                        const updateActive = (target) => {
                            Array.from(filterContainer.children).forEach(c => {
                                c.classList.remove('btn-primary');
                                c.classList.add('btn-outline');
                            });
                            target.classList.remove('btn-outline');
                            target.classList.add('btn-primary');
                        };

                        // Default
                        renderTable('series');
                    } else {
                        // Fallback (Manual or No History)
                        filterContainer.style.display = 'none';
                        renderTable('series');
                    }

                    // Also update Main Score if valid in report
                    if (report.scoreA !== undefined && report.scoreA !== '') {
                        document.getElementById('score-A').textContent = report.scoreA;
                        document.getElementById('score-B').textContent = report.scoreB;
                    }

                } else {
                    // No Report Found check
                    const tbody = document.getElementById('player-stats-table').querySelector('tbody');
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted)">No detailed statistics available for this match yet.</td></tr>`;
                }
            }
        }
    }

    // Series Card Generator
    const createSeriesCard = (teamA, teamB, week, dateLabel) => {
        const isBye = teamB === 'BYE';
        // Link to matchup.html for the full series overview
        const detailsUrl = `matchup.html?teamA=${encodeURIComponent(teamA)}&teamB=${encodeURIComponent(teamB)}&week=${week}`;

        return `
            <div class="match-card">
                <div class="match-header">
                    <span>${dateLabel}</span>
                    <span>Series Matchup</span>
                </div>
                <div class="match-teams">
                    <div class="team">
                        <div class="team-logo">${getLogoImg(teamA)}</div>
                        <div class="team-name">${teamA}</div>
                    </div>
                    <div class="vs">${isBye ? 'OFF' : 'VS'}</div>
                    <div class="team">
                        <div class="team-logo">${getLogoImg(teamB)}</div>
                        <div class="team-name">${teamB}</div>
                    </div>
                </div>
                ${!isBye ? `<div style="margin-top: 1rem; text-align: center;">
                    <a href="${detailsUrl}" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; text-decoration:none;">View Series</a>
                </div>` : ''}
            </div>
        `;
    };


    // --- State & Logic ---
    let activeGameFilter = 'all';

    const renderHomeSchedule = () => {
        const homeScheduleGrid = document.getElementById('schedule-grid');
        if (!homeScheduleGrid) return;

        // Update Week Selector Visuals on Landing Page
        const weekSelectorDiv = document.querySelector('.week-selector');
        if (weekSelectorDiv) {
            // This selector is visual-only in the HTML, but we should probably update it to reflect current week
            // Or better, replace it with just a display of the current week since Admin controls it now?
            // User requirement: "Option to select which week it is. This will ensure the correct week... is displayed"
            // So the 'Week Selector' on the landing page might actually be redundant or should just show the active week.

            // Let's update the text locally to match our currentWeek state
            weekSelectorDiv.innerHTML = `<span class="active">Week ${currentWeek}</span>`;
        }

        // Find this week's matches
        const activeWeekData = scheduleData.find(w => w.week === currentWeek);

        if (!activeWeekData) {
            homeScheduleGrid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted)">Schedule pending for Week ${currentWeek}.</p>`;
            return;
        }

        let matches = activeWeekData.matches;

        if (activeGameFilter === 'all') {
            // Group by Opponents for "Series" view
            const uniquePairings = matches.filter(m => m.game === 'Rocket League'); // Proxy for unique series pairing
            // Fallback if no RL games? Use first unique pairing
            if (uniquePairings.length === 0 && matches.length > 0) {
                // naive unique logic
                const seen = new Set();
                const series = [];
                matches.forEach(m => {
                    const key = m.teamA + m.teamB;
                    if (!seen.has(key)) { seen.add(key); series.push(m); }
                });
                homeScheduleGrid.innerHTML = series.map(m => createSeriesCard(m.teamA, m.teamB, currentWeek, `Week ${currentWeek} • ${activeWeekData.date}`)).join('');
            } else {
                homeScheduleGrid.innerHTML = uniquePairings.map(m => createSeriesCard(m.teamA, m.teamB, currentWeek, `Week ${currentWeek} • ${activeWeekData.date}`)).join('');
            }

        } else {
            // Filter by specific game
            matches = matches.filter(m => m.game === activeGameFilter);

            if (matches.length === 0) {
                homeScheduleGrid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted)">No ${activeGameFilter} matches scheduled for Week ${currentWeek}.</p>`;
            } else {
                homeScheduleGrid.innerHTML = matches.map(m => createMatchCard(m, `Week ${currentWeek} • ${activeWeekData.date}`)).join('');
            }
        }
    };

    // Event Listeners for Game Filter
    const gameFilters = document.querySelectorAll('.game-filter');
    gameFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Update
            gameFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Logic Update
            activeGameFilter = btn.dataset.game;

            // Re-render components
            renderTicker(activeGameFilter);
            renderHomeSchedule();

            // Standings Page Specific - check if we need to update table
            // Note: The table update logic is best handled by a specific listener on the standings page
            // to avoid scope issues, but we can trigger a custom event or check global scope.
            // For simplicity in this script, let's rely on the fact that if we are on the standings page,
            // the separate listener below (which we will add) will handle it, or we move the function up.

            // To fix the scope issue previously introduced:
            // We will NOT call renderStandingsTable here because it is block-scoped below.
            // Instead, we will add a dedicated listener loop inside the standings block.
        });
    });


    // --- Init ---
    renderTicker();
    renderHomeSchedule();


    // --- Matchup Page Logic ---
    const seriesGrid = document.getElementById('series-grid');
    if (seriesGrid) {
        // Parse Query Params
        const params = new URLSearchParams(window.location.search);
        const teamA = params.get('teamA');
        const teamB = params.get('teamB');
        const week = parseInt(params.get('week'));

        if (teamA && teamB && week) {
            // Populate Header
            const linkStyle = 'text-decoration:none; color:inherit; cursor:pointer;';

            document.getElementById('teamA-name').innerHTML = `<a href="team.html?id=${encodeURIComponent(teamA)}" style="${linkStyle}">${teamA}</a>`;
            document.getElementById('teamB-name').innerHTML = `<a href="team.html?id=${encodeURIComponent(teamB)}" style="${linkStyle}">${teamB}</a>`;

            // Also make logos clickable for better UX
            document.getElementById('teamA-logo').innerHTML = `<a href="team.html?id=${encodeURIComponent(teamA)}" style="${linkStyle}">${getLogoImg(teamA)}</a>`;
            document.getElementById('teamB-logo').innerHTML = `<a href="team.html?id=${encodeURIComponent(teamB)}" style="${linkStyle}">${getLogoImg(teamB)}</a>`;

            const weekInfo = scheduleData.find(w => w.week === week);
            document.getElementById('matchup-meta').textContent = weekInfo ? `Week ${week} • ${weekInfo.date}` : `Week ${week}`;

            // Apply Team Colors Gradient
            const banner = document.querySelector('.matchup-banner');
            if (banner) {
                const colorA = teamColors[teamA] || '#1e293b';
                const colorB = teamColors[teamB] || '#0f172a';
                // Gradient from Left (Team A) to Right (Team B)
                // Softer middle: Push colors to edges (0-35%) and (65-100%), keeping center dark (#0f172a is --bg-dark)
                banner.style.background = `linear-gradient(90deg, ${colorA} 0%, #0f172a 35%, #0f172a 65%, ${colorB} 100%)`;
            }

            // Find all 4 games for this pairing
            if (weekInfo) {
                const seriesMatches = weekInfo.matches.filter(m =>
                    (m.teamA === teamA && m.teamB === teamB)
                );
                seriesGrid.innerHTML = seriesMatches.map(m => createMatchCard(m, m.time)).join('');
            }
        } else {
            seriesGrid.innerHTML = '<p>Invalid Matchup Parameters</p>';
        }
    }


    // --- Full Schedule Page Logic (Separated for clarity) ---
    const fullScheduleGrid = document.getElementById('full-schedule-grid');
    if (fullScheduleGrid) {
        const weekFilter = document.getElementById('week-filter');
        const teamFilter = document.getElementById('team-filter');

        const renderFullSchedule = () => {
            const selectedWeek = parseInt(weekFilter.value);
            const selectedTeam = teamFilter.value;

            const weekData = scheduleData.find(w => w.week === selectedWeek);

            if (!weekData) {
                fullScheduleGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">Schedule data coming soon.</p>';
                return;
            }

            let filteredMatches = weekData.matches;

            // Filter by Team
            // Filter by Team
            if (selectedTeam !== 'all') {
                filteredMatches = filteredMatches.filter(m =>
                    m.teamA === selectedTeam || m.teamB === selectedTeam
                );
            }

            // Filter by Game (Global activeGameFilter)
            if (activeGameFilter !== 'all') {
                filteredMatches = filteredMatches.filter(m => m.game === activeGameFilter);
            }

            // Note: We currently don't use the Global Game Filter on the standalone Schedule page 
            // per instructions (updated Landing Page), but we could add it easily. 
            // For now, standalone schedule is independent.

            if (filteredMatches.length === 0) {
                fullScheduleGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">No matches found.</p>';
                return;
            }

            fullScheduleGrid.innerHTML = filteredMatches.map(m => createMatchCard(m, `Week ${selectedWeek} • ${weekData.date}`)).join('');
        };

        if (weekFilter && teamFilter) {
            weekFilter.addEventListener('change', renderFullSchedule);
            teamFilter.addEventListener('change', renderFullSchedule);

            // Listen to Game Filter clicks (redundant with global listener for state update, but needed for trigger)
            const schedulePageGameFilters = document.querySelectorAll('.game-filter');
            schedulePageGameFilters.forEach(btn => {
                btn.addEventListener('click', () => {
                    // activeGameFilter is updated by global listener
                    // We just need to wait a tick or just re-render (since global runs first usually)
                    // Actually, listeners run in order. Global one updates state. We just re-render.
                    renderFullSchedule();
                });
            });

            renderFullSchedule();
        }
    }

    // --- Standings Data ---


    const generateStandings = (gameName) => {
        let currentTeams = teams;

        if (gameName === 'Overwatch 2') {
            currentTeams = teams.filter(t => t !== 'Michigan State');
        } else if (gameName === 'Smash Bros') {
            currentTeams = teams.filter(t => t !== 'Utah');
        }

        return currentTeams.map(team => {
            return {
                team: team,
                wins: '-',
                losses: '-',
                pct: '-',
                streak: '-'
            };
        }).sort((a, b) => a.team.localeCompare(b.team)); // Sort Alphabetically
    };

    const standingsData = {
        'Rocket League': generateStandings('Rocket League'),
        'Overwatch 2': generateStandings('Overwatch 2'),
        'Smash Bros': generateStandings('Smash Bros'),
        'Valorant': generateStandings('Valorant')
    };

    // --- Standings Page Logic ---
    const standingsBody = document.getElementById('standings-body');
    if (standingsBody) {

        const renderStandingsTable = (game) => {
            const data = standingsData[game];
            if (!data) return;



            standingsBody.innerHTML = data.map((row, index) => `
                <tr>
                    <td style="text-align:center; color: var(--text-muted)">${index + 1}</td>
                    <td>
                        <div class="team-col">
                            <a href="team.html?id=${encodeURIComponent(row.team)}" style="display:flex; align-items:center; gap:1rem; text-decoration:none; color:inherit; width:100%;">
                                <div class="standings-team-logo">${getLogoImg(row.team, '90%')}</div>
                                <span>${row.team}</span>
                            </a>
                        </div>
                    </td>
                    <td>${row.wins}</td>
                    <td>${row.losses}</td>
                    <td>${row.pct}</td>
                    <td style="color: var(--text-muted)">${row.streak}</td>
                </tr>
            `).join('');
        };

        // Initial Render
        const initialGame = document.querySelector('.game-filter.active')?.dataset.game || 'Rocket League';
        renderStandingsTable(initialGame);

        // Standings Page Listeners
        const standingsFilters = document.querySelectorAll('.game-filter');
        standingsFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                // UI Update
                standingsFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Logic Update
                renderStandingsTable(btn.dataset.game);
            });
        });
    }



    const teamsGrid = document.getElementById('teams-grid');
    if (teamsGrid) {
        teamsGrid.innerHTML = teams.map(team => `
            <div class="team-card">
                <div class="team-card-logo" style="background:transparent; width:110px; height:110px;">${getLogoImg(team, '100%')}</div>
                <h2>${team}</h2>
                <a href="team.html?id=${encodeURIComponent(team)}" class="btn btn-outline">Details</a>
            </div>
        `).join('');
    }

    // --- Team Detail Page Logic ---
    const teamHeroName = document.getElementById('team-hero-name');
    if (teamHeroName) {
        const params = new URLSearchParams(window.location.search);
        console.log("DEBUG URL:", window.location.href);
        console.log("DEBUG PARAMS:", params.toString());
        console.log("DEBUG ID GET:", params.get('id'));

        let teamId = params.get('id');

        // Fuzzy Match Team ID
        const matchedTeam = teams.find(t => t.toLowerCase() === (teamId || '').toLowerCase()) ||
            teams.find(t => t.replace(/\s+/g, '').toLowerCase() === (teamId || '').replace(/\s+/g, '').toLowerCase()) ||
            teams.find(t => decodeURIComponent(teamId || '').toLowerCase() === t.toLowerCase());

        console.log("Fuzzy Match Result:", matchedTeam);

        if (matchedTeam) {
            teamId = matchedTeam; // Use canonical casing

            // Update Hero
            teamHeroName.textContent = teamId;

            document.getElementById('team-hero-logo').innerHTML = getLogoImg(teamId, '80%');

            // Populate Schedule (Upcoming Matches - Series View)
            // Populate Schedule (Upcoming Matches - Table View)
            const teamScheduleBody = document.getElementById('team-schedule-body');
            if (teamScheduleBody) {
                // --- Team Schedule Rendering Logic ---
                const renderTeamSchedule = () => {
                    const gameFilter = document.getElementById('team-game-filter');
                    if (!teamScheduleBody) return;

                    const filterValue = gameFilter ? gameFilter.value : 'Rocket League'; // Default if not ready

                    // Find matches filtered by team AND selected game
                    let allTeamMatches = [];
                    scheduleData.forEach(week => {
                        week.matches.forEach(m => {
                            // Filter by Team
                            if (m.teamA !== teamId && m.teamB !== teamId) return;

                            // Filter by Game (unless 'all' is somehow present, but we removed it)
                            if (filterValue !== 'all' && m.game !== filterValue) return;

                            allTeamMatches.push({ ...m, week: week.week, date: week.date });
                        });
                    });

                    // Group Matches by Week (and Opponent)
                    const seriesByWeek = {};

                    allTeamMatches.forEach(m => {
                        const key = m.week;
                        if (!seriesByWeek[key]) {
                            seriesByWeek[key] = {
                                week: m.week,
                                date: m.date,
                                matches: [],
                                opponent: (m.teamA === teamId) ? m.teamB : m.teamA
                            };
                        }
                        seriesByWeek[key].matches.push(m);
                    });

                    const sortedWeeks = Object.values(seriesByWeek).sort((a, b) => a.week - b.week);

                    if (sortedWeeks.length > 0) {
                        teamScheduleBody.innerHTML = sortedWeeks.map(series => {
                            // Extract Main Match Data
                            const m = series.matches[0];
                            const weekDate = series.date;

                            // Check for Report/Score Update
                            const reportId = `${m.week}-${m.game}-${m.teamA}-${m.teamB}`.replace(/\s+/g, '');
                            const report = matchReports[reportId];

                            let scoreA = m.scoreA;
                            let scoreB = m.scoreB;
                            let status = m.status;

                            if (report) {
                                if (report.scoreA !== undefined) scoreA = parseInt(report.scoreA);
                                if (report.scoreB !== undefined) scoreB = parseInt(report.scoreB);
                                if (report.status) status = report.status;
                                // Auto-detect final if scores exist
                                if (scoreA !== undefined && scoreA !== null && !isNaN(scoreA)) status = 'FINAL';
                            }

                            // Determine Result Display
                            let resultHTML = '<span style="color:var(--text-muted)">Upcoming</span>';

                            if (status === 'FINAL') {
                                const isTeamA = m.teamA === teamId;
                                const myScore = isTeamA ? scoreA : scoreB;
                                const oppScore = isTeamA ? scoreB : scoreA;

                                if (myScore > oppScore) {
                                    resultHTML = `<span style="color:#4ade80; font-weight:bold;">W</span> ${myScore}-${oppScore}`;
                                } else if (myScore < oppScore) {
                                    resultHTML = `<span style="color:#ef4444; font-weight:bold;">L</span> ${myScore}-${oppScore}`;
                                } else {
                                    resultHTML = `<span style="color:var(--text-muted); font-weight:bold;">T</span> ${myScore}-${oppScore}`;
                                }
                            } else if (status === 'LIVE' || (report && report.status === 'LIVE')) {
                                resultHTML = `<span class="live-badge">● LIVE</span>`;
                            }

                            const oppLogo = getLogoImg(series.opponent, '24px');
                            // Link params
                            const detailsUrl = `match-details.html?week=${series.week}&game=${encodeURIComponent(m.game)}&teamA=${encodeURIComponent(teamId)}&teamB=${encodeURIComponent(series.opponent)}`;

                            return `
                            <tr style="cursor:pointer;" onclick="window.location.href='${detailsUrl}'">
                                <td style="color:var(--text-muted); font-weight:700;">${series.week}</td>
                                <td>${series.date}</td>
                                <td>
                                    <div class="opponent-flex">
                                        <div class="opponent-logo-small">${oppLogo}</div>
                                        <span style="font-weight:600;">${series.opponent}</span>
                                    </div>
                                </td>
                                <td>${resultHTML}</td>
                                <td>
                                    <a href="${detailsUrl}" class="btn btn-outline" style="font-size:0.7rem; padding:0.2rem 0.5rem;">Details</a>
                                </td>
                            </tr>
                            `;
                        }).join('');
                    } else {
                        teamScheduleBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">No matches found for this selection.</td></tr>';
                    }
                };

                // --- Roster Logic (Real Data) ---
                const renderTeamPageRoster = () => {
                    const rosterContainer = document.getElementById('team-roster-grid');
                    const gameFilter = document.getElementById('team-game-filter');

                    if (!rosterContainer || !gameFilter) return;

                    const filterValue = gameFilter.value;
                    const teamRoster = rosterData[teamId] || [];

                    // Filter Logic
                    const filteredRoster = teamRoster.filter(p => {
                        if (filterValue === 'all') return true;
                        return p.game === filterValue;
                    });

                    if (filteredRoster.length === 0) {
                        rosterContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No players found for this selection.</p>';
                        return;
                    }

                    rosterContainer.innerHTML = filteredRoster.map(p => `
                        <div class="player-card">
                            <div class="player-avatar">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff&size=100" alt="${p.name}">
                            </div>
                            <div class="player-info">
                                <a href="player.html?player=${encodeURIComponent(p.name)}&team=${encodeURIComponent(teamId)}" style="text-decoration:none; color:inherit;">
                                    <h3>${p.name}</h3>
                                </a>
                                <div class="player-role" style="color:var(--accent-red); font-size:0.9rem; font-weight:bold;">${p.game}</div>
                                <div class="player-role">${p.role}</div>
                            </div>
                        </div>
                    `).join('');
                };

                // Initialize
                renderTeamSchedule();
                renderTeamPageRoster();
                renderTeamStats(); // Init Stats

                // Listener
                const gameFilterSelect = document.getElementById('team-game-filter');
                if (gameFilterSelect) {
                    gameFilterSelect.addEventListener('change', () => {
                        renderTeamSchedule();
                        renderTeamPageRoster();
                        renderTeamStats(); // Update Stats on filter change
                    });
                }

                // Match Details Code End
            }
        } else {
            console.error("Team Not Found or Invalid ID:", teamId);
            console.log("Available Teams:", teams);
            if (teamHeroName) teamHeroName.textContent = "Team Not Found";
        }
    }

    // --- Global Event Delegation for Tabs (Unbreakable) ---
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('team-tab')) {
            e.preventDefault();
            const btn = e.target;
            const targetKey = btn.dataset.tab;

            const viewSections = {
                'schedule': document.getElementById('view-overview'),
                'roster': document.getElementById('view-roster'),
                'stats': document.getElementById('view-stats')
            };

            const targetSection = viewSections[targetKey];
            if (!targetSection) return;

            document.querySelectorAll('.team-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            Object.values(viewSections).forEach(sec => { if (sec) sec.style.display = 'none'; });
            targetSection.style.display = 'block';

            if (targetKey === 'stats' && typeof renderTeamStats === 'function') renderTeamStats();
        }
    });



    // --- Watch Page Logic ---
    const watchPage = document.querySelector('.watch-hero');
    if (watchPage) {
        const twitchChannels = {
            'Baylor': 'bayloresp',
            'Boise State': 'boisestate',
            'Kansas': 'ku_esports',
            'Michigan State': 'msu_esports',
            'Minnesota': 'uofmn',
            'Nebraska': 'nebraskaesports',
            'Ohio State': 'ohiostateesports',
            'Syracuse': 'syracuse',
            'Utah': 'uofu_esports'
        };

        // Render Featured Stream (Mock)
        // Pick a random match from tickets
        const liveMatch = scores.find(s => s.status === 'LIVE') || scores[0];

        document.getElementById('featured-teamA-name').textContent = liveMatch.teamA;
        document.getElementById('featured-teamB-name').textContent = liveMatch.teamB;
        document.getElementById('featured-teamA-logo').innerHTML = getLogoImg(liveMatch.teamA, '100%');
        document.getElementById('featured-teamB-logo').innerHTML = getLogoImg(liveMatch.teamB, '100%');
        document.getElementById('featured-meta').textContent = liveMatch.status === 'LIVE'
            ? `● LIVE NOW • ${liveMatch.game}`
            : `REPLAY • ${liveMatch.game}`;

        // Render Channel Grid
        const channelGrid = document.getElementById('school-channels-grid');
        const sortedTeams = Object.keys(teamLogos).filter(t => t !== 'Mich State' && t !== 'BYE').sort();

        channelGrid.innerHTML = sortedTeams.map(team => {
            const channel = twitchChannels[team] || 'twitch'; // Default fallback
            return `
            <div class="channel-card">
                <div class="channel-logo">${getLogoImg(team)}</div>
                <div class="channel-name">${team}</div>
                <a href="https://twitch.tv/${channel}" target="_blank" class="btn btn-outline" style="width:100%; display:block; text-decoration:none;">
                    Watch Channel
                </a>
            </div>
            `;
        }).join('');
    }

    // --- Player Profile Page Logic ---
    const playerProfilePage = document.querySelector('.player-profile-page');
    if (playerProfilePage) {
        const params = new URLSearchParams(window.location.search);
        const playerName = params.get('player');
        const teamName = params.get('team');

        if (!playerName || !teamName || !rosterData[teamName]) {
            document.getElementById('player-content').style.display = 'none';
            document.getElementById('player-not-found').style.display = 'block';
        } else {
            // Find specific player object
            const playerObj = rosterData[teamName].find(p => p.name === playerName);

            if (!playerObj) {
                document.getElementById('player-content').style.display = 'none';
                document.getElementById('player-not-found').style.display = 'block';
            } else {
                // Populate Header
                document.getElementById('player-name').textContent = playerObj.name;
                document.getElementById('player-team').textContent = teamName;
                document.getElementById('player-role').textContent = playerObj.role;
                document.getElementById('player-game').textContent = playerObj.game;
                // Avatar
                document.getElementById('player-img').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(playerObj.name)}&background=random&color=fff&size=200`;

                // --- Calculate Stats ---
                let totalKills = 0; // Goals
                let totalDeaths = 0; // Saves for RL
                let totalAssists = 0;
                let totalScore = 0;
                let totalShots = 0;
                let totalSeriesPlayed = 0;
                let totalGamesPlayed = 0; // Individual games

                const matchHistory = [];

                // Iterate over all schedule data to find matches
                scheduleData.forEach(week => {
                    if (!week.matches) return;
                    week.matches.forEach(match => {
                        // Check if this player's team played
                        if ((match.teamA === teamName || match.teamB === teamName) && match.game === playerObj.game) {

                            // Check if a report exists
                            const reportId = `${week.week}-${match.game}-${match.teamA}-${match.teamB}`.replace(/\s+/g, '');
                            const report = matchReports[reportId];

                            if (report && report.stats && (report.stats[playerName] || report.stats[playerName.toLowerCase()])) {
                                const pStats = report.stats[playerName] || report.stats[playerName.toLowerCase()];

                                const k = parseInt(pStats.k || 0); // Goals
                                const d = parseInt(pStats.d || 0); // Saves
                                const a = parseInt(pStats.a || 0); // Assists
                                const s = parseInt(pStats.s || 0); // Score
                                const sh = parseInt(pStats.sh || 0); // Shots

                                totalKills += k;
                                totalDeaths += d;
                                totalAssists += a;
                                totalScore += s;
                                totalShots += sh;
                                totalSeriesPlayed++;

                                // Estimate games played in this series
                                // If matchHistory exists, use length. Else fallback to scoreA + scoreB (minimum) or just 1?
                                let seriesGames = 0;
                                if (report.matchHistory && report.matchHistory.length > 0) {
                                    seriesGames = report.matchHistory.length;
                                } else if (report.scoreA !== undefined) {
                                    seriesGames = parseInt(report.scoreA) + parseInt(report.scoreB);
                                    if (seriesGames === 0) seriesGames = 1; // Fallback
                                } else {
                                    seriesGames = 1;
                                }
                                totalGamesPlayed += seriesGames;

                                // Determine Win/Loss
                                let result = 'PENDING';
                                let resultClass = 'text-muted';

                                if (report.scoreA !== undefined && report.scoreA !== "") {
                                    const scoreA = parseInt(report.scoreA);
                                    const scoreB = parseInt(report.scoreB);

                                    const isTeamA = match.teamA === teamName;
                                    const myScore = isTeamA ? scoreA : scoreB;
                                    const oppScore = isTeamA ? scoreB : scoreA;

                                    if (myScore > oppScore) {
                                        result = 'WIN';
                                    } else {
                                        result = 'LOSS';
                                    }
                                }

                                const opponent = match.teamA === teamName ? match.teamB : match.teamA;

                                matchHistory.push({
                                    opponent,
                                    result,
                                    date: week.date,
                                    k, d, a, s, sh,
                                    week: week.week,
                                    game: match.game,
                                    teamA: match.teamA,
                                    teamB: match.teamB
                                });
                            }
                        }
                    });
                });

                // Render Stats Cards
                const statsGrid = document.querySelector('.career-stats-grid');
                if (playerObj.game === 'Rocket League') {
                    // Custom Grid for RL
                    const avg = (val) => totalGamesPlayed > 0 ? (val / totalGamesPlayed).toFixed(2) : '-';

                    statsGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
                    statsGrid.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalScore)}</div>
                            <div class="stat-label">Avg Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalKills)}</div>
                            <div class="stat-label">Avg Goals</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalAssists)}</div>
                            <div class="stat-label">Avg Assists</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalDeaths)}</div>
                            <div class="stat-label">Avg Saves</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalShots)}</div>
                            <div class="stat-label">Avg Shots</div>
                        </div>
                        <div class="stat-card" style="grid-column: 1/-1; margin-top:0.5rem">
                            <div class="stat-value">${totalGamesPlayed}</div>
                            <div class="stat-label">Total Games Played</div>
                        </div>
                     `;
                } else {
                    // Default
                    document.getElementById('stat-total-kills').textContent = totalKills;
                    document.getElementById('stat-total-assists').textContent = totalAssists;
                    document.getElementById('stat-games-played').textContent = totalSeriesPlayed; // Shows Series for now

                    const kd = totalDeaths === 0 ? totalKills : (totalKills / totalDeaths).toFixed(2);
                    document.getElementById('stat-kd-ratio').textContent = kd;
                }

                // Render History
                const historyContainer = document.getElementById('player-match-history');
                const historyHeader = document.querySelector('.history-header');

                // Update header labels for RL
                if (playerObj.game === 'Rocket League') {
                    // Inject custom header if not exists or replace stats label
                    if (historyHeader) {
                        historyHeader.innerHTML = `
                            <div>OPPONENT</div>
                            <div>RESULT</div>
                            <div>G / A / Sv / Sh</div>
                            <div>DATE</div>
                        `;
                    }
                }

                if (matchHistory.length === 0) {
                    historyContainer.innerHTML = '<div style="padding:1rem; text-align:center;">No match data recorded yet.</div>';
                } else {
                    historyContainer.innerHTML = matchHistory.reverse().map(m => {
                        let statString = `${m.k} / ${m.d} / ${m.a}`;
                        if (playerObj.game === 'Rocket League') {
                            statString = `${m.k} / ${m.a} / ${m.d} / ${m.sh}`; // G A Sv Sh
                        }

                        return `
                        <a href="match-details.html?week=${m.week}&game=${encodeURIComponent(m.game)}&teamA=${encodeURIComponent(m.teamA)}&teamB=${encodeURIComponent(m.teamB)}" class="match-history-row">
                            <div style="font-weight:bold;">vs ${m.opponent}</div>
                            <div style="${m.result === 'WIN' ? 'color:#4ade80' : 'color:#ef4444'}">${m.result}</div>
                            <div style="font-family:'Chakra Petch'">${statString}</div>
                            <div style="font-size:0.8rem; opacity:0.7;">${m.date}</div>
                        </a>
                    `}).join('');
                }
            }
        }
    }

});

// --- Global Stats Render Function (Moved to Global Scope) ---
window.renderTeamStats = () => {
    const statsContainer = document.getElementById('team-stats-view-content');
    if (!statsContainer) return;

    // Get context from URL since we are global now
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team');
    if (!teamId) return;

    const gameFilter = document.getElementById('team-game-filter');
    const activeGame = gameFilter ? gameFilter.value : 'Rocket League';

    console.log('Rendering Stats for:', teamId, activeGame);

    if (activeGame === 'Valorant') {
        const maps = [
            { name: 'Bind', wins: 0, losses: 1, atkWin: 0, atkR: '0/7', defR: '13/35', defWin: 37 },
            { name: 'Abyss', wins: 2, losses: 1, atkWin: 65, atkR: '14/8', defR: '12/11', defWin: 53 },
            { name: 'Haven', wins: 3, losses: 2, atkWin: 61, atkR: '32/22', defR: '22/28', defWin: 52 },
            { name: 'Lotus', wins: 1, losses: 3, atkWin: 44, atkR: '22/19', defR: '30/27', defWin: 46 },
            { name: 'Split', wins: 1, losses: 0, atkWin: 66, atkR: '2/1', defR: '1/12', defWin: 7 },
            { name: 'Ascent', wins: 0, losses: 0, atkWin: 0, atkR: '0/0', defR: '0/0', defWin: 0 }
        ];
        const agents = ['jett', 'sova', 'omen', 'killjoy', 'kayo'];

        statsContainer.innerHTML = `
            <table class="val-stats-table">
                <thead>
                    <tr>
                        <th>Map</th>
                        <th>Win Percentage</th>
                        <th>PPR</th>
                        <th>FFCR</th>
                        <th>Agent Compositions</th>
                        <th>ATK Win%</th>
                        <th>ATK R (W/L)</th>
                        <th>DEF R (W/L)</th>
                        <th>DEF Win%</th>
                    </tr>
                </thead>
                <tbody>
                    ${maps.map(m => {
            const total = m.wins + m.losses;
            const pct = total > 0 ? Math.round((m.wins / total) * 100) : 0;
            const mapAgents = agents.sort(() => 0.5 - Math.random()).slice(0, 5);
            return `
                        <tr>
                            <td>
                                <div class="val-map-cell" style="background:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url('assets/maps/${m.name.toLowerCase()}.jpg'), #334155; background-size:cover;">
                                    <span>${m.name}</span>
                                </div>
                            </td>
                            <td>
                                <div class="win-rate-pill">
                                    <span class="wr-percent">${pct}%</span>
                                    <span class="wr-record">${m.wins}W / ${m.losses}L</span>
                                </div>
                            </td>
                            <td class="stat-val">0</td>
                            <td class="stat-val">0</td>
                            <td>
                                <div class="agent-comp">
                                    ${mapAgents.map(a => `<div class="agent-icon" title="${a}">${a[0].toUpperCase()}</div>`).join('')}
                                </div>
                            </td>
                            <td class="stat-val">${m.atkWin}%</td>
                            <td style="color:#94a3b8">${m.atkR}</td>
                            <td style="color:#94a3b8">${m.defR}</td>
                            <td class="stat-val">${m.defWin}%</td>
                        </tr>`;
        }).join('')}
                </tbody>
            </table>`;

    } else if (activeGame === 'Overwatch 2') {
        const modes = [
            { name: 'Control', wins: 5, losses: 2 },
            { name: 'Hybrid', wins: 3, losses: 4 },
            { name: 'Escort', wins: 6, losses: 1 },
            { name: 'Push', wins: 2, losses: 2 },
            { name: 'Flashpoint', wins: 1, losses: 1 }
        ];
        const heroes = ['rein', 'tracer', 'ana', 'lucio', 'sojourn'];
        statsContainer.innerHTML = `
            <table class="val-stats-table">
                <thead>
                    <tr>
                        <th>Game Mode</th>
                        <th>Win Percentage</th>
                        <th>Team K/D</th>
                        <th>Obj Time</th>
                        <th>Most Played Comp</th>
                        <th>ATK Win%</th>
                        <th>DEF Win%</th>
                    </tr>
                </thead>
                <tbody>
                    ${modes.map(m => {
            const total = m.wins + m.losses;
            const pct = total > 0 ? Math.round((m.wins / total) * 100) : 0;
            const comp = heroes.sort(() => 0.5 - Math.random()).slice(0, 5);
            return `
                        <tr>
                            <td>
                                <div class="val-map-cell" style="width:140px; background:linear-gradient(135deg, #ea580c, #9a3412);">
                                    <span>${m.name}</span>
                                </div>
                            </td>
                            <td>
                                <div class="win-rate-pill">
                                    <span class="wr-percent">${pct}%</span>
                                    <span class="wr-record">${m.wins}W / ${m.losses}L</span>
                                </div>
                            </td>
                            <td class="stat-val">${(1.0 + Math.random()).toFixed(2)}</td>
                            <td class="stat-val">10:00</td>
                            <td>
                                <div class="agent-comp">
                                    ${comp.map(h => `<div class="agent-icon" style="background:#0284c7; border-color:#0ea5e9">${h[0].toUpperCase()}</div>`).join('')}
                                </div>
                            </td>
                            <td class="stat-val">55%</td>
                            <td class="stat-val">45%</td>
                        </tr>`;
        }).join('')}
                </tbody>
            </table>`;

    } else if (activeGame === 'Rocket League' || activeGame === 'Smash Bros') {
        const players = (rosterData[teamId] || []).filter(p => p.game === activeGame);
        if (players.length === 0) {
            statsContainer.innerHTML = `<p style="text-align:center; padding:2rem;">No players found for ${activeGame}.</p>`;
        } else if (activeGame === 'Rocket League') {
            statsContainer.innerHTML = `
                <table class="val-stats-table">
                    <thead>
                        <tr style="text-align:left;">
                            <th style="text-align:left; padding-left:2rem;">Player</th>
                            <th>Games</th>
                            <th>Goals</th>
                            <th>Assists</th>
                            <th>Saves</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${players.map(p => {
                return `
                            <tr>
                                <td style="text-align:left; padding-left:2rem; font-weight:bold;">${p.name} <span style="font-weight:normal; font-size:0.8rem; color:#94a3b8">(${p.role})</span></td>
                                <td class="stat-val">${Math.floor(Math.random() * 10) + 5}</td>
                                <td class="stat-val">${Math.floor(Math.random() * 20)}</td>
                                <td class="stat-val">${Math.floor(Math.random() * 15)}</td>
                                <td class="stat-val">${Math.floor(Math.random() * 10)}</td>
                            </tr>`;
            }).join('')}
                    </tbody>
                </table>`;
        } else {
            statsContainer.innerHTML = `
                <table class="val-stats-table">
                    <thead>
                        <tr style="text-align:left;">
                            <th style="text-align:left; padding-left:2rem;">Player</th>
                            <th>Sets</th>
                            <th>W/L</th>
                            <th>Stocks Taken</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${players.map(p => {
                const w = Math.floor(Math.random() * 10);
                const l = Math.floor(Math.random() * 5);
                return `
                            <tr>
                                <td style="text-align:left; padding-left:2rem; font-weight:bold;">${p.name} <span style="font-weight:normal; font-size:0.8rem; color:#94a3b8">(${p.role})</span></td>
                                <td class="stat-val">${w + l}</td>
                                <td class="stat-val">${w} - ${l}</td>
                                <td class="stat-val">${w * 3}</td>
                            </tr>`;
            }).join('')}
                    </tbody>
                </table>`;
        }
    } else {
        statsContainer.innerHTML = `<p style="padding:2rem; text-align:center;">Stats coming soon.</p>`;
    }
};
