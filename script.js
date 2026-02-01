// --- Global State & Persistence ---
console.log('PEC Script V10 Loaded - OW Stats Fix');

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

// --- Global Twitch Channels ---
let twitchChannels = {};
try {
    twitchChannels = JSON.parse(localStorage.getItem('pec_channels') || '{}');
} catch (e) {
    console.warn('Failed to parse channels', e);
}

if (Object.keys(twitchChannels).length === 0) {
    twitchChannels = {
        'Baylor': 'bayloresports',
        'Boise State': 'boisestate',
        'Kansas': 'ku_esports',
        'Michigan State': 'msueos',
        'Minnesota': 'uofmnesports',
        'Nebraska': 'nebraskaesports',
        'Ohio State': 'ohiostateesports',
        'Syracuse': 'syracuse',
        'Utah': 'uofu_esports'
    };
}
window.twitchChannels = twitchChannels;

window.saveTwitchChannels = (newChannels) => {
    window.twitchChannels = newChannels;
    localStorage.setItem('pec_channels', JSON.stringify(newChannels));
    alert('Channel links saved!');
};

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
    { teamA: 'Syracuse', scoreA: 1, teamB: 'Kansas', scoreB: 2, status: 'FINAL', game: 'Rocket League' },
    { teamA: 'Baylor', scoreA: 3, teamB: 'Utah', scoreB: 0, status: 'FINAL', game: 'Valorant' },
    { teamA: 'Michigan State', scoreA: 1, teamB: 'Ohio State', scoreB: 1, status: 'LIVE', game: 'Overwatch 2' }
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

            // Header Refinements (User Request)
            const statusBadge = document.getElementById('match-status');
            if (statusBadge) statusBadge.style.display = 'none'; // Remove 'FINAL'

            const weekIndex = parseInt(params.get('week')) - 1;
            if (initialScheduleData && initialScheduleData[weekIndex]) {
                document.getElementById('match-date').textContent = initialScheduleData[weekIndex].date;
            }

            // BG Gradient
            const scoreSection = document.querySelector('.match-scoreboard-section');
            if (scoreSection) {
                const colorA = teamColors[teamA] || '#1e293b';
                const colorB = teamColors[teamB] || '#0f172a';
                scoreSection.style.background = `linear-gradient(90deg, ${colorA} 0%, #0f172a 35%, #0f172a 65%, ${colorB} 100%)`;
                scoreSection.style.borderBottom = 'none';
            }

            // Reset Scoreboard to VS by default (overwriting placeholder)
            const bigScore = document.querySelector('.big-score');
            if (bigScore) {
                bigScore.innerHTML = '<span style="font-size:0.8em; letter-spacing:2px; opacity:0.8;">VS</span>';
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
                        const cardTitle = document.querySelector('.card-title'); // "Player Statistics"

                        // CASE 1: Series Total (Aggregate)
                        if (mode === 'series') {
                            if (cardTitle) cardTitle.innerHTML = 'Player Statistics <span style="font-weight:400; opacity:0.6; font-size:0.7em; margin-left:0.5rem;">SERIES TOTAL</span>';

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

                            if (cardTitle) {
                                const mapText = replay.map ? ` • ${replay.map}` : '';
                                cardTitle.innerHTML = `Player Statistics <span style="font-weight:400; opacity:0.6; font-size:0.7em; margin-left:0.5rem; text-transform:uppercase;">GAME ${mode}${mapText}</span>`;
                            }

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
                                            // Logic: If 'goals' exists, use RL mapping. Else use raw keys (OW/Smash manual entry).
                                            if (core.goals !== undefined) {
                                                displayStats[p.name.toLowerCase()] = {
                                                    k: core.goals || 0,
                                                    d: core.saves || 0,
                                                    a: core.assists || 0,
                                                    s: core.score || 0,
                                                    sh: core.shots || 0
                                                };
                                            } else {
                                                // Generic / Manual Entry (OW, Smash)
                                                displayStats[p.name.toLowerCase()] = {
                                                    k: core.k || 0,
                                                    d: core.d || 0,
                                                    a: core.a || 0,
                                                    s: core.s || 0,
                                                    sh: core.sh || 0,
                                                    dmg: core.dmg || 0,
                                                    heal: core.heal || 0,
                                                    mit: core.mit || 0
                                                };
                                            }
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
                        } else if (game === 'Overwatch 2') {
                            const thead = statsTable.querySelector('thead tr');
                            thead.innerHTML = `
                                 <th>Player</th>
                                 <th title="Eliminations">Elims</th>
                                 <th title="Assists">Ast</th>
                                 <th title="Deaths">Dths</th>
                                 <th title="Damage">Dmg</th>
                                 <th title="Healing">Heal</th>
                                 <th title="Mitigation">Mit</th>
                             `;
                        } else if (game === 'Smash Bros') {
                            const thead = statsTable.querySelector('thead tr');
                            thead.innerHTML = `
                                 <th>Player</th>
                                 <th>Stocks Taken</th>
                                 <th>Stocks Lost</th>
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

                            if (game === 'Overwatch 2') {
                                return `
                                    <tr>
                                        <td>
                                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                                <div style="width:3px; height:20px; background:${teamColors[teamName]}"></div>
                                                <span>${p.name}</span>
                                                <span style="font-size:0.7em; opacity:0.5; margin-left:auto">${teamName}</span>
                                            </div>
                                        </td>
                                        <td style="font-weight:bold">${s.k || 0}</td>
                                        <td>${s.a || 0}</td>
                                        <td>${s.d || 0}</td>
                                        <td>${s.dmg || s.s || 0}</td>
                                        <td>${s.heal || s.sh || 0}</td>
                                        <td>${s.mit || 0}</td>
                                    </tr>
                                `;
                            }

                            if (game === 'Smash Bros') {
                                return `
                                    <tr>
                                        <td>
                                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                                <div style="width:3px; height:20px; background:${teamColors[teamName]}"></div>
                                                <span>${p.name}</span>
                                                <span style="font-size:0.7em; opacity:0.5; margin-left:auto">${teamName}</span>
                                            </div>
                                        </td>
                                        <td style="font-weight:bold; color:var(--accent-green)">${s.k || 0}</td>
                                        <td style="font-weight:bold; color:var(--accent-red)">${s.d || 0}</td>
                                    </tr>
                                `;
                            }

                            // Default Row (Rocket League)
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
                    // Init Filters
                    const history = report.matchHistory;
                    const hasHistory = history && (Array.isArray(history) ? history.length > 0 : Object.keys(history).length > 0);

                    if (hasHistory) {
                        filterContainer.innerHTML = ''; // Clear

                        // Series Button
                        const btnSeries = document.createElement('button');
                        btnSeries.className = 'btn btn-sm btn-primary';
                        btnSeries.textContent = 'Series Total';
                        btnSeries.onclick = () => { renderTable('series'); updateActive(btnSeries); };
                        filterContainer.appendChild(btnSeries);

                        // Game Buttons
                        // Normalize keys
                        const keys = Array.isArray(history)
                            ? history.map((_, i) => i)
                            : Object.keys(history).sort((a, b) => parseInt(a) - parseInt(b));

                        keys.forEach(k => {
                            const btn = document.createElement('button');
                            btn.className = 'btn btn-sm btn-outline';
                            // If Array, k is index (0based), label is k+1. If Object, k is key ('1'), label is k.
                            const label = Array.isArray(history) ? (parseInt(k) + 1) : k;
                            btn.textContent = `Game ${label}`;
                            btn.onclick = () => { renderTable(k); updateActive(btn); };
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
                    if (report.scoreA !== undefined && report.scoreA !== null && report.scoreA !== '') {
                        const bigScore = document.querySelector('.big-score');
                        if (bigScore) {
                            const sA = report.scoreA;
                            const sB = report.scoreB || '0';
                            // Determine color for winner
                            const cA = parseInt(sA) > parseInt(sB) ? 'var(--accent-green)' : '#fff';
                            const cB = parseInt(sB) > parseInt(sA) ? 'var(--accent-green)' : '#fff';

                            bigScore.innerHTML = `<span id="score-A" style="color:${cA}">${sA}</span> - <span id="score-B" style="color:${cB}">${sB}</span>`;
                        }
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
        // Update Week Selector (Dropdown)
        const weekSelect = document.getElementById('week-select');
        if (weekSelect) {
            // Populate if empty
            if (weekSelect.options.length === 0 && scheduleData.length > 0) {
                scheduleData.forEach(w => {
                    const opt = document.createElement('option');
                    opt.value = w.week;
                    opt.textContent = `Week ${w.week}`;
                    weekSelect.appendChild(opt);
                });

                // Add Change Listener
                weekSelect.addEventListener('change', (e) => {
                    currentWeek = parseInt(e.target.value);
                    renderHomeSchedule();
                    renderTicker(activeGameFilter);
                });
            }

            // Sync Value
            weekSelect.value = currentWeek;
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
            renderHeroStandings(activeGameFilter);

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


    // --- Dynamic News Logic ---
    // --- Dynamic News Logic ---
    // --- Dynamic News Logic (Carousel) ---
    // --- Dynamic News Logic (Carousel) ---
    const renderHeroNews = () => {
        const heroContainer = document.getElementById('hero-carousel-container');
        if (!heroContainer) return;

        let articles = [];
        try {
            articles = JSON.parse(localStorage.getItem('pec_news') || '[]');
        } catch (e) { console.warn(e); }

        if (articles.length === 0) {
            heroContainer.innerHTML = `
                <div class="carousel-track">
                     <div class="hero-card large" style="min-width:100%; display:flex; flex-direction:column;">
                        <div class="hero-card-img-container">
                            <img src="placeholder.png" alt="Welcome" style="object-fit:cover;">
                        </div>
                        <div class="hero-content">
                            <span class="tag">Welcome</span>
                            <h1>Welcome to the PEC</h1>
                            <div class="hero-meta">Check back for updates.</div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        // Generate Slides
        const createSlide = (a) => `
            <a href="article.html?id=${a.id}" class="hero-card large" style="text-decoration:none; color:inherit; display:flex; flex-direction:column;">
                <div class="hero-card-img-container">
                    <img src="${a.img}" alt="${a.title}">
                </div>
                <div class="hero-content">
                    <span class="tag">${a.tag}</span>
                    <h1>${a.title}</h1>
                    <div class="hero-meta">
                         <span style="color:var(--text-main); font-weight:700;">${a.author || 'PEC Staff'}</span> <br>
                         ${a.date}
                    </div>
                </div>
            </a>
        `;

        heroContainer.innerHTML = `
            <div class="carousel-track" id="hero-track">
                ${articles.map(createSlide).join('')}
            </div>
        `;

        // Start Auto-Scroll
        initCarousel(articles.length);
    };

    let carouselInterval;
    const initCarousel = (count) => {
        if (count <= 1) return;

        const track = document.getElementById('hero-track');
        let index = 0;

        if (carouselInterval) clearInterval(carouselInterval);

        carouselInterval = setInterval(() => {
            index++;
            if (index >= count) {
                index = 0;
            }
            track.style.transform = `translateX(-${index * 100}%)`;
        }, 5000);
    };

    // --- Hero Standings Logic ---
    const calculateStandings = (gameFilter) => {
        const standings = {};

        // Initialize
        teams.forEach(t => {
            if (t !== 'BYE') {
                standings[t] = { team: t, wins: 0, losses: 0, ties: 0 };
            }
        });

        scheduleData.forEach(week => {
            if (!week.matches) return;
            week.matches.forEach(m => {
                if (m.teamA === 'BYE' || m.teamB === 'BYE') return;

                // Filter by Game
                if (gameFilter !== 'all' && m.game !== gameFilter) return;

                // Check Status/Score
                // We use the report or the direct match score if available
                const reportId = `${m.week}-${m.game}-${m.teamA}-${m.teamB}`.replace(/\s+/g, '');
                const report = matchReports[reportId];

                let scoreA = m.scoreA;
                let scoreB = m.scoreB;
                let status = m.status;

                if (report) {
                    if (report.scoreA !== undefined) scoreA = report.scoreA;
                    if (report.scoreB !== undefined) scoreB = report.scoreB;
                    if (report.status) status = report.status;
                }

                if (status === 'FINAL' || (scoreA !== undefined && scoreA !== null && scoreA !== '' && scoreA !== '-')) {
                    const sA = parseInt(scoreA);
                    const sB = parseInt(scoreB);

                    if (isNaN(sA) || isNaN(sB)) return;

                    if (sA > sB) {
                        if (standings[m.teamA]) standings[m.teamA].wins++;
                        if (standings[m.teamB]) standings[m.teamB].losses++;
                    } else if (sB > sA) {
                        if (standings[m.teamB]) standings[m.teamB].wins++;
                        if (standings[m.teamA]) standings[m.teamA].losses++;
                    } else {
                        // Tie (rare in some games but possible)
                        if (standings[m.teamA]) standings[m.teamA].ties++;
                        if (standings[m.teamB]) standings[m.teamB].ties++;
                    }
                }
            });
        });

        // Convert to Array and Sort
        return Object.values(standings).sort((a, b) => {
            // Win Pct
            const totalA = a.wins + a.losses + a.ties;
            const totalB = b.wins + b.losses + b.ties;

            // If mixed games (All), simply sort by Total Wins first? 
            // Or Win %? Win % is usually better but for "All" it might favor low sample size.
            // Let's go with Wins for "All" simply because it's an aggregate count kind of feel, 
            // but Win % is standard. Let's stick to standard ordering: Win% -> Wins -> Alpha.

            const pctA = totalA > 0 ? a.wins / totalA : 0;
            const pctB = totalB > 0 ? b.wins / totalB : 0;

            if (pctB !== pctA) return pctB - pctA;
            if (b.wins !== a.wins) return b.wins - a.wins;
            return a.team.localeCompare(b.team);
        });
    };

    const renderHeroStandings = (game = 'all') => {
        const container = document.getElementById('hero-standings-list');
        const headerLabel = document.querySelector('.hero-standings .standings-game-label');
        if (!container) return;

        if (headerLabel) {
            headerLabel.textContent = game === 'all' ? 'OVERALL STANDINGS' : game.toUpperCase();
        }

        const fullStandings = calculateStandings(game);
        // Show All Teams (User Request)
        const topTeams = fullStandings;

        if (topTeams.length === 0) {
            container.innerHTML = '<p style="padding:1rem; text-align:center; color:var(--text-muted)">No standings available.</p>';
            return;
        }

        container.innerHTML = topTeams.map((row, index) => `
            <div class="mini-standings-row" style="cursor:pointer;" onclick="window.location.href='team.html?id=${encodeURIComponent(row.team)}'">
                <div class="mini-rank" style="color: ${index === 0 ? 'var(--accent-red)' : 'var(--text-muted)'}">${index + 1}</div>
                <div class="mini-team">
                     <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">${getLogoImg(row.team, '100%')}</div>
                     <span style="font-size:0.9rem;">${row.team}</span>
                </div>
                <div class="mini-record" style="font-size:0.85rem;">${row.wins}-${row.losses}</div>
            </div>
        `).join('');

        // Add "view full" link at bottom if needed or rely on the main button
    };

    // --- News Page Logic ---
    const renderNewsPage = () => {
        const grid = document.getElementById('news-grid');
        if (!grid) return;

        let articles = [];
        try {
            articles = JSON.parse(localStorage.getItem('pec_news') || '[]');
        } catch (e) { console.warn(e); }

        if (articles.length === 0) {
            grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted)">No news articles yet.</p>';
            return;
        }

        grid.innerHTML = articles.map(a => `
             <a href="article.html?id=${a.id}" class="match-card" style="text-decoration:none; color:inherit; display:block; padding:0; overflow:hidden;">
                <div style="height:200px; overflow:hidden;">
                    <img src="${a.img}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                </div>
                <div style="padding:1.5rem;">
                    <span class="tag" style="font-size:0.75rem; margin-bottom:0.5rem;">${a.tag}</span>
                    <h3 style="font-family:var(--font-head); font-size:1.5rem; line-height:1.2; margin-bottom:0.5rem;">${a.title}</h3>
                    <p style="color:var(--text-muted); font-size:0.9rem;">${a.date}</p>
                </div>
             </a>
        `).join('');
    };

    const renderArticlePage = () => {
        const view = document.getElementById('article-view');
        if (!view) return;

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        let articles = [];
        try {
            articles = JSON.parse(localStorage.getItem('pec_news') || '[]');
        } catch (e) { }

        const article = articles.find(a => a.id === id);

        if (!article) {
            view.innerHTML = `
                <div style="text-align:center; padding:4rem;">
                    <h1>Article Not Found</h1>
                    <a href="news.html" class="btn btn-primary" style="margin-top:1rem; text-decoration:none; display:inline-block;">Back to News</a>
                </div>`;
            return;
        }

        view.innerHTML = `
            <a href="news.html" class="back-link">← Back to News</a>
            <div class="article-header">
                <div class="article-meta">${article.date} • <span style="color:var(--accent-red)">${article.tag}</span></div>
                <h1 class="article-title">${article.title}</h1>
            </div>
            <img src="${article.img}" class="article-hero-img" alt="${article.title}">
            <div class="article-body">
                ${article.content}
            </div>
        `;
    };

    // --- Init ---
    renderTicker();
    renderHomeSchedule();
    renderHeroNews();
    renderHeroStandings('all');
    renderNewsPage();
    renderArticlePage();


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
            // Use the shared dynamic calculation
            const data = calculateStandings(game);

            if (!data || data.length === 0) {
                standingsBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:1rem;">No Data</td></tr>';
                return;
            }

            standingsBody.innerHTML = data.map((row, index) => {
                const total = row.wins + row.losses + row.ties;
                const pct = total > 0 ? ((row.wins / total) * 100).toFixed(1) + '%' : '-';
                // Streak is not currently calculated in calculateStandings. Defaulting to '-'
                const streak = '-';

                return `
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
                    <td>${pct}</td>
                    <td style="color: var(--text-muted)">${streak}</td>
                </tr>
            `;
            }).join('');
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
                                if (report.scoreA !== undefined && report.scoreA !== null && report.scoreA !== '') scoreA = parseInt(report.scoreA);
                                if (report.scoreB !== undefined && report.scoreB !== null && report.scoreB !== '') scoreB = parseInt(report.scoreB);
                                if (report.status) status = report.status;
                                // Auto-detect final if scores exist
                                if (scoreA !== undefined && scoreA !== null && !isNaN(scoreA)) status = 'FINAL';
                            }

                            // 0-Fix: If FINAL, treat missing/NaN scores as 0
                            if (status === 'FINAL') {
                                if (scoreA === null || scoreA === undefined || isNaN(scoreA)) scoreA = 0;
                                if (scoreB === null || scoreB === undefined || isNaN(scoreB)) scoreB = 0;
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
                                <img src="${p.photo ? p.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff&size=100`}" alt="${p.name}">
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
                renderTeamStatsV2(); // Init Stats

                // Listener
                const gameFilterSelect = document.getElementById('team-game-filter');
                if (gameFilterSelect) {
                    gameFilterSelect.addEventListener('change', () => {
                        renderTeamSchedule();
                        renderTeamPageRoster();
                        renderTeamStatsV2(); // Update Stats on filter change
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

            if (targetKey === 'stats' && typeof renderTeamStatsV2 === 'function') renderTeamStatsV2();
        }
    });



    // --- Watch Page Logic ---
    const watchPage = document.querySelector('.watch-hero');
    if (watchPage) {
        // Global twitchChannels used


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

        console.log('Player Profile Init:', { playerName, teamName, rosterAvailable: !!rosterData });

        if (!playerName || !teamName || !rosterData[teamName]) {
            console.error('Player/Team not found or Roster missing', { playerName, teamName, rosterKeys: Object.keys(rosterData || {}) });
            document.getElementById('player-content').style.display = 'none';
            document.getElementById('player-not-found').style.display = 'block';
        } else {
            // Find specific player object
            const playerObj = rosterData[teamName].find(p => p.name === playerName);

            if (!playerObj) {
                console.error('Player Object not found in Team Roster', { teamName, playerName });
                document.getElementById('player-content').style.display = 'none';
                document.getElementById('player-not-found').style.display = 'block';
            } else {
                // Populate Header
                document.getElementById('player-name').textContent = playerObj.name;
                document.getElementById('player-team').textContent = teamName;

                const roleEl = document.getElementById('player-role-label') || document.getElementById('player-role');
                if (roleEl) roleEl.textContent = playerObj.role;

                const gameEl = document.getElementById('player-game-display') || document.getElementById('player-game');
                if (gameEl) gameEl.textContent = playerObj.game;

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

                            if (report && report.stats) {
                                // Fuzzy Lookup for Player Name (Case Insensitive)
                                const reportKeys = Object.keys(report.stats);
                                const foundKey = reportKeys.find(k => k.toLowerCase() === playerName.toLowerCase().trim());

                                if (foundKey) {
                                    const pStats = report.stats[foundKey];

                                    const k = parseInt(pStats.k || 0); // Goals / Elims / Stocks Taken
                                    const d = parseInt(pStats.d || 0); // Saves / Deaths / Stocks Lost
                                    const a = parseInt(pStats.a || 0); // Assists
                                    const s = parseInt(pStats.s || 0); // Score / ACS
                                    const sh = parseInt(pStats.sh || 0); // Shots

                                    // Extra Stats (OW2/Smash)
                                    const dmg = parseInt(pStats.dmg || 0);
                                    const heal = parseInt(pStats.heal || 0);
                                    const mit = parseInt(pStats.mit || 0);

                                    totalKills += k;
                                    totalDeaths += d;
                                    totalAssists += a;
                                    totalScore += s;
                                    totalShots += sh;

                                    // Store extras in totalScore/totalShots if appropriate, or new vars?
                                    // Let's simplify and use the same variables but allow custom display logic
                                    // Actually, let's add specific accumulators to be safe
                                    playerObj.totalDmg = (playerObj.totalDmg || 0) + dmg;
                                    playerObj.totalHeal = (playerObj.totalHeal || 0) + heal;
                                    playerObj.totalMit = (playerObj.totalMit || 0) + mit;

                                    totalSeriesPlayed++;

                                    // Estimate games played in this series
                                    // If matchHistory exists, use length. Else fallback to scoreA + scoreB (minimum) or just 1?
                                    let seriesGames = 0;
                                    if (report.matchHistory && (Array.isArray(report.matchHistory) ? report.matchHistory.length : Object.keys(report.matchHistory).length) > 0) {
                                        const mh = report.matchHistory;
                                        seriesGames = Array.isArray(mh) ? mh.length : Object.keys(mh).length;
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
                                        dmg, heal, mit,
                                        week: week.week,
                                        game: match.game,
                                        teamA: match.teamA,
                                        teamB: match.teamB
                                    });
                                }
                            }
                        }
                    });
                });

                // Render Stats Cards
                const statsGrid = document.querySelector('.career-stats-grid');
                const avg = (val) => totalGamesPlayed > 0 ? (val / totalGamesPlayed).toFixed(2) : '-'; // Per Game
                // For Valorant ACS/Econ, we want Average per map, which is logic already handled by 'avg' since totalGamesPlayed = maps played basically

                if (playerObj.game === 'Rocket League') {
                    // Custom Grid for RL
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
                            <div class="stat-label">Total Gams Played</div>
                        </div>
                     `;
                } else if (playerObj.game === 'Overwatch 2') {
                    // OW2 Grid
                    const tDmg = playerObj.totalDmg || 0;
                    const tHeal = playerObj.totalHeal || 0;
                    const tMit = playerObj.totalMit || 0;

                    statsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                    statsGrid.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalKills)}</div>
                            <div class="stat-label">Elims/Game</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalAssists)}</div>
                            <div class="stat-label">Assists/Game</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalDeaths)}</div>
                            <div class="stat-label">Deaths/Game</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(tDmg)}</div>
                            <div class="stat-label">Dmg/Game</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(tHeal)}</div>
                            <div class="stat-label">Heal/Game</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(tMit)}</div>
                            <div class="stat-label">Mit/Game</div>
                        </div>
                        <div class="stat-card" style="grid-column: 1/-1;">
                            <div class="stat-value">${totalGamesPlayed}</div>
                            <div class="stat-label">Maps Played</div>
                        </div>
                     `;
                } else if (playerObj.game === 'Smash Bros') {
                    statsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                    statsGrid.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalKills)}</div>
                            <div class="stat-label">Avg Stocks Taken</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalDeaths)}</div>
                            <div class="stat-label">Avg Stocks Lost</div>
                        </div>
                        <div class="stat-card" style="grid-column: 1/-1;">
                            <div class="stat-value">${totalGamesPlayed}</div>
                            <div class="stat-label">Sets Played</div>
                        </div>
                     `;
                } else if (playerObj.game === 'Valorant') {
                    // Val
                    statsGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                    statsGrid.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-value">${(totalScore / totalSeriesPlayed).toFixed(0) /* using s for ACS logic from admin */}</div> 
                            <div class="stat-label">Avg ACS</div> 
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalKills)}</div>
                            <div class="stat-label">Kills/Map</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalDeaths)}</div>
                            <div class="stat-label">Deaths/Map</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${avg(totalAssists)}</div>
                            <div class="stat-label">Assists/Map</div>
                        </div>
                         <div class="stat-card" style="grid-column: 1/-1;">
                            <div class="stat-value">${totalGamesPlayed}</div>
                            <div class="stat-label">Maps Played</div>
                        </div>
                     `;
                } else {
                    // Default
                    document.getElementById('stat-total-kills').textContent = totalKills;
                    document.getElementById('stat-total-assists').textContent = totalAssists;
                    document.getElementById('stat-games-played').textContent = totalSeriesPlayed;
                    const kd = totalDeaths === 0 ? totalKills : (totalKills / totalDeaths).toFixed(2);
                    document.getElementById('stat-kd-ratio').textContent = kd;
                }

                // Render History
                const historyContainer = document.getElementById('player-match-history');
                const historyHeader = document.querySelector('.history-header');

                console.log('Rendering Match History. Found:', matchHistory.length, 'matches.');
                if (!historyContainer) console.error('History Container not found!');

                // Update Header based on game (Always)
                // Match History Render
                if (matchHistory.length === 0) {
                    if (historyContainer) historyContainer.innerHTML = '<div style="padding:1rem; text-align:center;">No match data recorded yet.</div>';
                } else if (historyContainer) {
                    historyContainer.innerHTML = matchHistory.reverse().map(m => {
                        return `
                        <a href="match-details.html?week=${m.week}&game=${encodeURIComponent(m.game)}&teamA=${encodeURIComponent(m.teamA)}&teamB=${encodeURIComponent(m.teamB)}" class="match-history-row" style="display:grid; grid-template-columns: 1fr 100px 120px; align-items:center; gap:0.5rem; text-decoration:none; color:inherit; padding:0.5rem; border-bottom:1px solid rgba(255,255,255,0.05); transition: background 0.2s;">
                            <div style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">vs ${m.opponent}</div>
                            <div style="text-align:center; ${m.result === 'WIN' ? 'color:#4ade80' : 'color:#ef4444'}">${m.result}</div>
                            <div style="font-size:0.8rem; opacity:0.7; text-align:right;">${m.date}</div>
                        </a>
                    `}).join('');
                }
            }
        }
    }

});

// --- Global Stats Render Function (Moved to Global Scope) ---
window.renderTeamStatsV2 = () => {
    const statsContainer = document.getElementById('team-stats-view-content');
    if (!statsContainer) return;

    // Get context from URL since we are global now
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team') || urlParams.get('id');
    if (!teamId) return;

    const gameFilter = document.getElementById('team-game-filter');
    const activeGame = gameFilter ? gameFilter.value : 'Rocket League';

    console.log('Rendering Stats for:', teamId, activeGame);

    if (activeGame === 'Valorant') {
        const mapStats = {};
        let totalMatches = 0;

        // Aggregate Map Stats
        Object.entries(matchReports).forEach(([reportId, r]) => {
            // Team Match Check (Loose)
            const tNorm = teamId.toLowerCase().replace(/\s+/g, '');
            const rIdCheck = reportId.toLowerCase().replace(/\s+/g, '');
            if (!rIdCheck.includes(tNorm)) return;

            // Ensure it's a Valorant match (either by game prop or inference)
            // Reports usually have `game` prop in payload, or we check structure.
            // But simplest is to check if it has valid Val stats or game type in ID?
            // Week data has game type. But we are iterating matchReports.
            // Assuming reportId implies game? e.g. "1-Valorant-..."
            if (!rIdCheck.includes('valorant')) return;

            let mhArray = [];
            if (r.matchHistory && (Array.isArray(r.matchHistory) ? r.matchHistory.length : Object.keys(r.matchHistory).length) > 0) {
                mhArray = Array.isArray(r.matchHistory) ? r.matchHistory : Object.values(r.matchHistory);
            } else if (r.games) {
                // Fallback: If no matchHistory, try to construct from r.games for map counting?
                // Or just assume single map if no detail? 
                // Usually r.games logic in saveReport populates matchHistory.
            }

            if (mhArray.length > 0) {
                mhArray.forEach(g => {
                    if (g.map) {
                        const mapName = g.map;
                        if (!mapStats[mapName]) mapStats[mapName] = { w: 0, l: 0, matches: 0 };

                        mapStats[mapName].matches++;
                        totalMatches++;

                        const winner = (g.winner || '').toLowerCase().trim();
                        const tStr = teamId.toLowerCase().trim();
                        if (winner === tStr) mapStats[mapName].w++;
                        else if (winner && winner !== tStr) mapStats[mapName].l++;
                    }
                });
            }
        });

        // Generate Table Rows
        const activeMaps = Object.keys(mapStats).sort((a, b) => mapStats[b].matches - mapStats[a].matches);

        // Render Container
        statsContainer.innerHTML = `
            <table class="val-stats-table">
                <thead>
                    <tr>
                        <th style="text-align:left; padding-left:1rem;">Map</th>
                        <th>Pick Rate</th>
                        <th>Win Percentage</th>
                        <th>Record</th>
                    </tr>
                </thead>
                <tbody>
                    ${activeMaps.length > 0 ? activeMaps.map(mName => {
            const s = mapStats[mName];
            const pickRate = totalMatches > 0 ? Math.round((s.matches / totalMatches) * 100) : 0;
            const winPct = s.matches > 0 ? Math.round((s.w / s.matches) * 100) : 0;

            // Map Image Logic (Valorant)
            // Clean name for filename
            const mapFileName = mName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.png';
            const imageUrl = `assets/maps/valorant/${mapFileName}`;

            // Gradient overlay for readability
            const bgStyle = `background: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url('${imageUrl}') no-repeat center/cover, #334155`;

            return `
                            <tr>
                                <td style="text-align:left; padding-left:1rem;">
                                    <div class="val-map-cell" style="width:140px; ${bgStyle}; text-shadow: 1px 1px 2px black;">
                                        <span>${mName}</span>
                                    </div>
                                </td>
                                <td class="stat-val">${pickRate}%</td>
                                <td>
                                    <div class="win-rate-pill">
                                        <span class="wr-percent">${winPct}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="wr-record" style="color:white; font-weight:bold;">${s.w}W - ${s.l}L</span>
                                </td>
                            </tr>`;
        }).join('') : '<tr><td colspan="4" style="text-align:center; padding:2rem;">No map data available.</td></tr>'}
                </tbody>
            </table>
        </div>

        <!-- Top Performers Section (Valorant) -->
        <div class="top-performers-section" style="background:#1e293b; border-radius:12px; padding:1.5rem; border:1px solid rgba(255,255,255,0.05);">
            <h3 style="margin-top:0; margin-bottom:1.5rem; color:#f8fafc; font-size:1.2rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.5rem;">Top Performers (Avg/Game)</h3>
            <div class="performers-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                ${(() => {
                const teamPlayers = rosterData[teamId] ? rosterData[teamId].filter(p => p.game === 'Valorant') : [];
                const playerTotals = {};
                teamPlayers.forEach(p => {
                    playerTotals[p.name] = {
                        name: p.name,
                        acs: 0, k: 0, d: 0, a: 0, econ: 0, fb: 0,
                        games: 0,
                        img: p.photo || 'assets/logo.png', role: p.role
                    };
                });

                Object.entries(matchReports).forEach(([reportId, r]) => {
                    const tNorm = teamId.toLowerCase().replace(/\s+/g, '');
                    const rIdCheck = reportId.toLowerCase().replace(/\s+/g, '');
                    if (!rIdCheck.includes(tNorm) || !rIdCheck.includes('valorant')) return;

                    // Count sub-games for averages
                    let reportGameCount = 0;
                    if (r.games) reportGameCount = Object.keys(r.games).length;
                    else reportGameCount = (parseInt(r.scoreA) || 0) + (parseInt(r.scoreB) || 0) || 1;

                    if (r.stats) {
                        Object.keys(r.stats).forEach(pName => {
                            const pRecord = playerTotals[pName];
                            if (pRecord) {
                                const s = r.stats[pName];
                                pRecord.acs += parseInt(s.acs || s.s || 0); // s falls back to Score/ACS
                                pRecord.k += parseInt(s.k || 0);
                                pRecord.d += parseInt(s.d || 0);
                                pRecord.a += parseInt(s.a || 0);
                                pRecord.econ += parseInt(s.econ || 0);
                                pRecord.fb += parseInt(s.fb || 0);
                                pRecord.games += reportGameCount;
                            }
                        });
                    }
                    // Also check detailed r.games stats if top-level missing, but usually aggregation handles it in saveReport.
                    // Assuming saveReport works as reviewed.
                });

                const players = Object.values(playerTotals).filter(p => p.games > 0);
                if (players.length === 0) return '<div style="grid-column: span 2; color:#94a3b8; text-align:center;">No player data available</div>';

                // Helpers
                const getAvg = (p, key) => p.games > 0 ? (p[key] / p.games) : 0;
                // KDA Ratio: (K+A)/D (Global)
                const getKDA = (p) => p.d > 0 ? (p.k + p.a) / p.d : (p.k + p.a);

                // Leaders
                const getLeaderByKey = (key) => players.reduce((max, p) => getAvg(p, key) > getAvg(max, key) ? p : max, players[0]);
                const getKDALeader = () => players.reduce((max, p) => getKDA(p) > getKDA(max) ? p : max, players[0]);

                const topACS = getLeaderByKey('acs');
                const topKDA = getKDALeader();
                const topEcon = getLeaderByKey('econ');
                const topFB = getLeaderByKey('fb');

                const fmt = (val) => val.toLocaleString(undefined, { maximumFractionDigits: 1 });
                const fmtRatio = (val) => val.toFixed(2);

                const renderCard = (title, p, valStr, label) => `
                        <div class="performer-card" style="background:#0f172a; border-radius:8px; padding:1rem; display:flex; flex-direction:column; align-items:center; text-align:center; position:relative; overflow:hidden;">
                            <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em;">${title}</div>
                            <div class="performer-img" style="width:60px; height:60px; border-radius:50%; overflow:hidden; margin-bottom:0.5rem; border:2px solid #ef4444;"> <!-- Red border for Val -->
                                <img src="${p.img}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/logo.png'">
                            </div>
                            <div style="font-weight:bold; color:white; font-size:1rem;">${p.name}</div>
                            <div style="font-size:1.2rem; color:#ef4444; font-weight:900; margin-top:0.25rem;">${valStr}</div>
                            <div style="font-size:0.7rem; color:#64748b;">${label}</div>
                        </div>
                    `;

                return `
                        ${renderCard('Combat Score', topACS, fmt(getAvg(topACS, 'acs')), 'Avg ACS')}
                        ${renderCard('KDA Ratio', topKDA, fmtRatio(getKDA(topKDA)), 'KDA')}
                        ${renderCard('Econ Rating', topEcon, fmt(getAvg(topEcon, 'econ')), 'Avg Econ')}
                        ${renderCard('First Bloods', topFB, fmt(getAvg(topFB, 'fb')), 'Avg FB')}
                    `;
            })()}
            </div>
        `;

        // Layout Styles
        statsContainer.style.display = 'grid';
        statsContainer.style.gridTemplateColumns = '1.2fr 0.8fr';
        statsContainer.style.gap = '2rem';
        statsContainer.style.alignItems = 'start';
        if (window.innerWidth < 1024) statsContainer.style.gridTemplateColumns = '1fr';

    } else if (activeGame === 'Overwatch 2') {
        const mapStats = {};
        let totalMatches = 0;

        // Aggregate Data by Map
        Object.entries(matchReports).forEach(([reportId, r]) => {
            // Check if this match implies this team
            const tNorm = teamId.toLowerCase().replace(/\s+/g, '');
            const rIdCheck = reportId.toLowerCase().replace(/\s+/g, '');
            if (!rIdCheck.includes(tNorm)) return;

            // STRICT GAME CHECK: Ensure it is an Overwatch report
            if (!rIdCheck.includes('overwatch')) return;

            if (r.matchHistory && (Array.isArray(r.matchHistory) ? r.matchHistory.length : Object.keys(r.matchHistory).length) > 0) {
                const mhArray = Array.isArray(r.matchHistory) ? r.matchHistory : Object.values(r.matchHistory);
                const sample = mhArray[0];
                if (!sample) return;

                // Relaxed Team Match Check (Removed - using reportId instead)
                // if (sample.teamA !== teamId && sample.teamB !== teamId) return;

                // Process Games
                mhArray.forEach(g => {
                    if (g.map) {
                        const mapName = g.map;
                        if (!mapStats[mapName]) {
                            mapStats[mapName] = { w: 0, l: 0, matches: 0 };
                        }

                        mapStats[mapName].matches++;
                        totalMatches++;

                        // Did we win?
                        const winner = (g.winner || '').toLowerCase().trim();
                        const tStr = teamId.toLowerCase().trim();

                        if (winner === tStr) {
                            mapStats[mapName].w++;
                        } else if (winner && winner !== tStr) {
                            mapStats[mapName].l++;
                        }
                    }
                });
            }
        });

        // Generate Table Rows
        const activeMaps = Object.keys(mapStats).sort((a, b) => {
            // Sort by Pick Rate (Matches) Descending, then Win% Descending
            if (mapStats[b].matches !== mapStats[a].matches) return mapStats[b].matches - mapStats[a].matches;
            const winRateA = mapStats[a].matches > 0 ? mapStats[a].w / mapStats[a].matches : 0;
            const winRateB = mapStats[b].matches > 0 ? mapStats[b].w / mapStats[b].matches : 0;
            return winRateB - winRateA;
        });

        statsContainer.innerHTML = `
            <table class="val-stats-table">
                <thead>
                    <tr>
                        <th style="text-align:left; padding-left:1rem;">Map</th>
                        <th>Pick Rate</th>
                        <th>Win Percentage</th>
                        <th>Record</th>
                    </tr>
                </thead>
                <tbody>
                    ${activeMaps.length > 0 ? activeMaps.map(mName => {
            const s = mapStats[mName];
            const pickRate = totalMatches > 0 ? Math.round((s.matches / totalMatches) * 100) : 0;
            const winPct = s.matches > 0 ? Math.round((s.w / s.matches) * 100) : 0;

            // Map Image Logic
            // Format: "King's Row" -> "kings_row.jpg"
            const mapFileName = mName.toLowerCase()
                .replace(/ /g, '_')
                .replace(/'/g, '')
                .replace(/:/g, '')
                .replace(/á/g, 'a')
                .replace(/í/g, 'i')
                .replace(/ç/g, 'c')
                .replace(/ñ/g, 'n') + '.jpg';

            const imageUrl = `assets/maps/overwatch/${mapFileName}`;
            const bgStyle = `background: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url('${imageUrl}') no-repeat center/cover, #334155`;

            return `
                        <tr>
                            <td style="text-align:left; padding-left:1rem;">
                                <div class="val-map-cell" style="width:140px; ${bgStyle}; text-shadow: 1px 1px 2px black;">
                                    <span>${mName}</span>
                                </div>
                            </td>
                            <td class="stat-val">${pickRate}%</td>
                            <td>
                                <div class="win-rate-pill">
                                    <span class="wr-percent">${winPct}%</span>
                                </div>
                            </td>
                             <td>
                                <span class="wr-record" style="color:white; font-weight:bold;">${s.w}W - ${s.l}L</span>
                            </td>
                        </tr>`;
        }).join('') : '<tr><td colspan="4" style="text-align:center; padding:2rem;">No map data available.</td></tr>'}
                </tbody>
                </tbody>
            </table>
        </div>
        
        <!-- Top Performers Section -->
        <div class="top-performers-section" style="background:#1e293b; border-radius:12px; padding:1.5rem; border:1px solid rgba(255,255,255,0.05);">
            <h3 style="margin-top:0; margin-bottom:1.5rem; color:#f8fafc; font-size:1.2rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.5rem;">Top Performers (Avg/Game)</h3>
            <div class="performers-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                ${(() => {
                const teamPlayers = rosterData[teamId] ? rosterData[teamId].filter(p => p.game === 'Overwatch 2') : [];
                const playerTotals = {};

                teamPlayers.forEach(p => {
                    // keys: k=Elims, a=Assists, dmg=Damage, heal=Healing
                    playerTotals[p.name] = { name: p.name, k: 0, a: 0, dmg: 0, heal: 0, games: 0, img: p.photo || 'assets/logo.png', role: p.role };
                });

                Object.values(matchReports).forEach(r => {
                    // Determine Game/Map match count for this report
                    let reportMapCount = 0;
                    if (r.games) {
                        reportMapCount = Object.keys(r.games).length;
                    } else {
                        // Estimates from score if no details
                        reportMapCount = (parseInt(r.scoreA) || 0) + (parseInt(r.scoreB) || 0);
                        if (reportMapCount === 0) reportMapCount = 1;
                    }

                    if (r.stats) {
                        Object.keys(r.stats).forEach(pName => {
                            const pRecord = playerTotals[pName];
                            if (pRecord) {
                                const stats = r.stats[pName];

                                // Use 'dmg' and 'heal' based on Admin inspector
                                pRecord.k += parseInt(stats.k || 0);
                                pRecord.a += parseInt(stats.a || 0);
                                pRecord.dmg += parseInt(stats.dmg || stats.s || 0);
                                pRecord.heal += parseInt(stats.heal || stats.sh || 0);

                                pRecord.games += reportMapCount;
                            }
                        });
                    }
                });

                const players = Object.values(playerTotals).filter(p => p.games > 0);
                if (players.length === 0) return '<div style="grid-column: span 2; color:#94a3b8; text-align:center;">No player data available</div>';

                // Calculate Averages and Leaders
                const getAvg = (p, key) => p.games > 0 ? (p[key] / p.games) : 0;

                const getLeader = (key) => players.reduce((max, p) => getAvg(p, key) > getAvg(max, key) ? p : max, players[0]);

                const topK = getLeader('k');
                const topA = getLeader('a');
                const topDmg = getLeader('dmg');
                const topHeal = getLeader('heal');

                const fmt = (val) => val.toLocaleString(undefined, { maximumFractionDigits: 1 });

                const renderCard = (title, p, key, label) => {
                    const avgVal = getAvg(p, key);
                    return `
                            <div class="performer-card" style="background:#0f172a; border-radius:8px; padding:1rem; display:flex; flex-direction:column; align-items:center; text-align:center; position:relative; overflow:hidden;">
                                <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em;">${title}</div>
                                <div class="performer-img" style="width:60px; height:60px; border-radius:50%; overflow:hidden; margin-bottom:0.5rem; border:2px solid #3b82f6;">
                                    <img src="${p.img}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/logo.png'">
                                </div>
                                <div style="font-weight:bold; color:white; font-size:1rem;">${p.name}</div>
                                <div style="font-size:1.2rem; color:#3b82f6; font-weight:900; margin-top:0.25rem;">${fmt(avgVal)}</div>
                                <div style="font-size:0.7rem; color:#64748b;">${label}/Map</div>
                            </div>
                        `;
                };

                return `
                        ${renderCard('Most Eliminations', topK, 'k', 'Elims')}
                        ${renderCard('Most Assists', topA, 'a', 'Assists')}
                        ${renderCard('Most Damage', topDmg, 'dmg', 'Damage')}
                        ${renderCard('Most Healing', topHeal, 'heal', 'Healing')}
                    `;
            })()}
            </div>
        </div>
        `;

        // Update Container to Grid
        statsContainer.style.display = 'grid';
        statsContainer.style.gridTemplateColumns = '1.2fr 0.8fr'; // 60/40 Split
        statsContainer.style.gap = '2rem';
        statsContainer.style.alignItems = 'start';

        // Media Query for Mobile (in JS or CSS? JS inline style override might be tricky, better to add class and CSS)
        // Adding inline media query hack or just ensure CSS handles it.
        // Let's modify index.css or add a <style> block if needed.
        // For now, I'll set the grid styles directly.
        // To make it responsive, I should check window width or use flex-wrap?
        if (window.innerWidth < 1024) {
            statsContainer.style.gridTemplateColumns = '1fr';
        }

    } else if (activeGame === 'Rocket League' || activeGame === 'Smash Bros') {
        statsContainer.style.display = 'block'; // Reset grid layout

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

// --- Player Profile Page Logic ---
window.renderPlayerPage = () => {
    if (!document.body.classList.contains('player-profile-page')) return;

    // Wait for Roster Data if not ready
    if (Object.keys(window.rosterData || {}).length === 0) {
        setTimeout(window.renderPlayerPage, 200);
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('player');
    const teamName = urlParams.get('team'); // Optional if unique names, but safer with team

    if (!playerName) {
        document.getElementById('player-not-found').style.display = 'block';
        return;
    }

    // Find Player
    // If team is known, optimize. Else search all.
    let p = null;
    let finalTeamName = teamName;

    if (teamName && window.rosterData[teamName]) {
        p = window.rosterData[teamName].find(r => r.name === playerName);
    } else {
        // Search globally
        for (const [t, roster] of Object.entries(window.rosterData)) {
            const found = roster.find(r => r.name === playerName);
            if (found) {
                p = found;
                finalTeamName = t;
                break;
            }
        }
    }

    if (!p) {
        document.getElementById('player-not-found').style.display = 'block';
        return;
    }

    // Unhide Content
    document.getElementById('player-content').style.display = 'block';

    // Populate Data
    document.getElementById('player-name').textContent = p.name;
    document.getElementById('player-team').textContent = finalTeamName;
    document.getElementById('player-role-label').textContent = p.role || 'Player'; // Top Label
    document.getElementById('player-game-display').textContent = p.game; // Bottom Meta

    // Images
    const photoUrl = p.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1e293b&color=fff&size=256`;
    document.getElementById('player-img').src = photoUrl;

    // Team Logo Watermark & Pill
    const logoUrl = window.teamLogos[finalTeamName] || 'placeholder.png';
    const watermark = document.getElementById('hero-watermark');
    if (watermark) watermark.src = logoUrl;

    const metaLogo = document.getElementById('meta-team-logo');
    if (metaLogo) metaLogo.src = logoUrl;

    // Background Image based on Game (Local Assets)
    const bgMap = {
        'Rocket League': 'assets/games/rocketleague.jpg',
        'Valorant': 'assets/games/valorant.png',
        'Overwatch 2': 'assets/games/overwatch2.png',
        'Smash Bros': 'assets/games/smashbros_hd.jpg', // User provided HD
        'Call of Duty': 'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/mw3/meta/mw3-meta-share.jpg' // MW3 Official
    };
    const bgUrl = bgMap[p.game] || bgMap['Rocket League'];
    const heroBg = document.getElementById('hero-bg');
    if (heroBg) heroBg.style.backgroundImage = `url('${bgUrl}')`;

    // --- Stats Calculation ---
    // 1. Filter Match Reports for this Player/Team/Game
    const playerStats = {
        gamesPlayed: 0, // Sub-games (maps/rounds)
        seriesPlayed: 0,
        // Accumulators
        k: 0, d: 0, a: 0, s: 0, sh: 0, // Generic
        chealing: 0, cdamage: 0, // OW Custom
        stocksLost: 0, // Smash
        // Valorant
        acs: 0, econ: 0, fb: 0, pl: 0, df: 0
    };

    // Iterate all matches to find reports
    // We use scheduleData to access all weeks
    scheduleData.forEach(week => {
        if (!week.matches) return;
        week.matches.forEach(m => {
            // Must match Team and Game
            if ((m.teamA !== finalTeamName && m.teamB !== finalTeamName) || m.game !== p.game) return;

            // Get Report
            const reportId = `${m.week}-${m.game}-${m.teamA}-${m.teamB}`.replace(/\s+/g, '');
            const report = matchReports[reportId];
            if (!report) return; // No data yet

            // Determine if player played using Name Check in report stats
            // If specific stats exist, use them. If aggregate exists, use that.
            let pStat = null;

            // Check top-level stats (Rocket League / Generic)
            if (report.stats && report.stats[p.name]) {
                pStat = report.stats[p.name];
            }
            // Check Valorant Games (if detailed)
            else if (report.games) {
                // Sum up sub-games
                Object.values(report.games).forEach(g => {
                    if (g.stats && g.stats[p.name]) {
                        // For Val, we sum here directly or aggregate later? 
                        // Let's aggregate here just for "Played" check
                        pStat = g.stats[p.name]; // Just marking presence
                    }
                });
            }

            // If we found stats for this player in this match, add to totals
            // Note: If player didn't play (sub), pStat might be null. 
            // For now, assume if Roster matches, they played unless detailed logs say otherwise.
            // But we only want to sum stats if we have them.

            // Calculating "Sub-Games" (Maps/Sets)
            // Default: Sum of score (e.g. 3-0 = 3 games)
            let matchSubGames = (parseInt(report.scoreA) || 0) + (parseInt(report.scoreB) || 0);
            if (matchSubGames === 0) matchSubGames = 1; // Fallback if live or data missing

            // However, for Stats, we usually only have the "Series Total" in the report.stats object for RL/OW.
            // For Val, we have per-game.

            if (p.game === 'Valorant') {
                // Valorant Logic: Iterate report.games
                if (report.games) {
                    Object.values(report.games).forEach(g => {
                        if (g.stats && g.stats[p.name]) {
                            const vals = g.stats[p.name];
                            playerStats.gamesPlayed++;
                            playerStats.k += parseInt(vals.k || 0);
                            playerStats.d += parseInt(vals.d || 0);
                            playerStats.a += parseInt(vals.a || 0);
                            playerStats.acs += parseInt(vals.acs || 0);
                            playerStats.econ += parseInt(vals.econ || 0);
                            playerStats.fb += parseInt(vals.fb || 0);
                            playerStats.pl += parseInt(vals.pl || 0);
                            playerStats.df += parseInt(vals.df || 0);
                        }
                    });
                }
            } else {
                // RL / OW / Smash (Aggregate stored in report.stats)
                if (report.stats && report.stats[p.name]) {
                    const vals = report.stats[p.name];

                    // Add Series Count
                    playerStats.seriesPlayed++;
                    playerStats.gamesPlayed += matchSubGames;

                    playerStats.k += parseInt(vals.k || 0);
                    playerStats.d += parseInt(vals.d || 0);
                    playerStats.a += parseInt(vals.a || 0);
                    playerStats.s += parseInt(vals.s || 0);
                    playerStats.sh += parseInt(vals.sh || 0);
                }
            }
        });
    });

    // Render Stats Grid
    const statsGrid = document.querySelector('.career-stats-grid');
    if (statsGrid) {
        let cardsHTML = '';
        const gp = playerStats.gamesPlayed || 1; // Avoid div/0

        const avg = (val) => (val / gp).toFixed(1);

        if (p.game === 'Rocket League') {
            // Score, Goals, Assist, Shots, Saves
            // Map: s=Score, k=Goals, a=Assist, sh=Shots, d=Saves
            cardsHTML = `
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.s)}</div>
                    <div class="stat-label">Score per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.k)}</div>
                    <div class="stat-label">Goals per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.a)}</div>
                    <div class="stat-label">Assists per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.sh)}</div>
                    <div class="stat-label">Shots per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.d)}</div>
                    <div class="stat-label">Saves per game</div>
                </div>
            `;
        } else if (p.game === 'Overwatch 2') {
            // Elims, Assist, Deaths, Dmg, Heal
            // Map: k=Elims, a=Assist, d=Deaths, s=Damage(prov), sh=Heal(prov)
            // Note: Admin inputs currently are generic. Assuming 's' is reused for Dmg? 
            // If not, we show 0 and user needs to assume they input Dmg into "Pts" or we fix Admin later.
            cardsHTML = `
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.k)}</div>
                    <div class="stat-label">Elims per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.a)}</div>
                    <div class="stat-label">Assists per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.d)}</div>
                    <div class="stat-label">Deaths per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.s)}</div> <!-- Prov: Score -> Dmg -->
                    <div class="stat-label">Damage per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.sh)}</div> <!-- Prov: Shots -> Heal -->
                    <div class="stat-label">Healing per game</div>
                </div>
            `;
        } else if (p.game === 'Valorant') {
            // ACS, K, D, A, Econ, FB, Pl, Def
            cardsHTML = `
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.acs).split('.')[0]}</div>
                    <div class="stat-label">ACS per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.k)}</div>
                    <div class="stat-label">Kills per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.d)}</div>
                    <div class="stat-label">Deaths per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.a)}</div>
                    <div class="stat-label">Assists per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.econ).split('.')[0]}</div>
                    <div class="stat-label">Econ per game</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.fb)}</div>
                    <div class="stat-label">FB per game</div>
                </div>
                 <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.pl)}</div>
                    <div class="stat-label">Plants per game</div>
                </div>
                 <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.df)}</div>
                    <div class="stat-label">Defuses per game</div>
                </div>
            `;
        } else if (p.game === 'Smash Bros') {
            // Stocks Taken (k), Stocks Lost (d)
            cardsHTML = `
                <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.k)}</div>
                    <div class="stat-label">Stocks Taken per game</div>
                </div>
                 <div class="stat-card">
                    <div class="stat-value">${avg(playerStats.d)}</div>
                    <div class="stat-label">Stocks Lost per game</div>
                </div>
            `;
        }

        // Always show Games Played
        cardsHTML += `
            <div class="stat-card">
                <div class="stat-value">${playerStats.gamesPlayed}</div>
                <div class="stat-label">Games Played</div>
            </div>
        `;

        statsGrid.innerHTML = cardsHTML;
        // Adjusted for Split Layout: 2 Columns is best for the narrower space
        statsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    }
};

// Init
window.addEventListener('DOMContentLoaded', () => {
    // Other inits defined above...
    window.renderPlayerPage();
});
