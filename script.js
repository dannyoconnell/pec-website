// --- Global State & Persistence ---
const initialRosterData = {
    'Baylor': [], 'Boise State': [], 'Kansas': [], 'Michigan State': [], 'Minnesota': [], 'Nebraska': [], 'Ohio State': [], 'Syracuse': [], 'Utah': []
};

// --- Logo Data (Global) ---
const teamLogos = {
    'Baylor': 'baylor.png',
    'Boise State': 'boise_state.png',
    'Kansas': 'kansas.png',
    'Michigan State': 'michigan_state.png',
    'Mich State': 'michigan_state.png', // Alias for ticker
    'Minnesota': 'minnesota.png',
    'Nebraska': 'nebraska.png',
    'Ohio State': 'ohio_state.png',
    'Syracuse': 'syracuse.png',
    'Utah': 'utah.png',
    'BYE': 'placeholder.png'
};

window.teamLogos = teamLogos; // Ensure explicitly on window for admin.html

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

const initialMatchReports = {};

// Global Variables
let scheduleData = [];
let scores = [];
let rosterData = {};
let matchReports = {};

async function loadAppData() {
    try {
        console.log("Fetching Data from API...");
        const [scheduleRes, rosterRes] = await Promise.all([
            fetch('/.netlify/functions/get-schedule'),
            fetch('/.netlify/functions/get-roster')
        ]);

        if (!scheduleRes.ok || !rosterRes.ok) throw new Error("API Network Error");

        const matches = await scheduleRes.json();
        const rosters = await rosterRes.json();

        // 1. Process Roster
        rosterData = rosters || {};

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
            matchReports[reportId] = m.report_data || {};
            // Ensure base score is reflected in report object for consistency if needed
            matchReports[reportId].scoreA = m.score_a;
            matchReports[reportId].scoreB = m.score_b;

            // Group for Schedule
            if (!weeks[m.week]) {
                weeks[m.week] = { week: m.week, date: m.date, matches: [] };
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

        // If DB is empty, maybe fallback or just show empty?
        // Let's rely on DB. Users can use 'reset-data' (not yet impl) or manual entry.
        if (scheduleData.length === 0) {
            console.log("DB Empty, falling back to initial data for demo/seed if needed");
            // Optional: seeding logic could go here, or we accept empty state.
            // For now, let's keep it empty to prove DB connection works (it will be blank initially)
        }

    } catch (e) {
        console.error("Error loading data from API", e);
        // Fallback or Alert?
        // scheduleData = initialScheduleData; 
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

    // --- Components ---

    // Ticker Generator
    const renderTicker = (filterGame = 'all') => {
        const tickerContainer = document.getElementById('score-ticker');
        if (!tickerContainer) return;

        let displayScores = scores;
        if (filterGame !== 'all') {
            displayScores = scores.filter(s => s.game === filterGame);
        }

        // If no scores for this game, maybe show generic message or just empty
        if (displayScores.length === 0) {
            tickerContainer.innerHTML = `<div class="ticker-item" style="padding-left:1rem">No live ${filterGame} matches</div>`;
            return;
        }

        // Duplicate for scrolling effect (if enough items)
        const allScores = [...displayScores, ...displayScores, ...displayScores];

        const createTickerItem = (match) => {
            const isLive = match.status === 'LIVE';
            return `
                <div class="ticker-item">
                    ${isLive ? '<span class="live-badge">● LIVE</span>' : ''}
                    <span class="ticker-teams">${match.teamA} vs ${match.teamB}</span>
                    <span class="ticker-score">${match.scoreA} - ${match.scoreB}</span>
                    <span style="opacity: 0.5; font-size: 0.8em; margin-left:5px">(${match.game})</span>
                </div>
                <div style="opacity: 0.2">|</div>
            `;
        };

        tickerContainer.innerHTML = allScores.map(createTickerItem).join('');
    };

    // Schedule Card Generator
    const createMatchCard = (match, dateLabel) => {
        const isBye = match.teamB === 'BYE';
        // Encode params for details page
        const detailsUrl = `match-details.html?teamA=${encodeURIComponent(match.teamA)}&teamB=${encodeURIComponent(match.teamB)}&game=${encodeURIComponent(match.game)}&week=${match.week || 1}`;

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
                    <div class="vs">${isBye ? 'OFF' : 'VS'}</div>
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
        const week = params.get('week') || 1;

        if (teamA && teamB) {
            // 1. Construct Report ID
            const reportId = `${week}-${game}-${teamA}-${teamB}`.replace(/\s+/g, '');
            const report = matchReports[reportId] || {};

            // 2. Get Real Data (or Default)
            const scoreA = report.scoreA || 0;
            const scoreB = report.scoreB || 0;
            const isReported = report.scoreA !== undefined && report.scoreA !== '';

            // Header
            document.getElementById('match-game-type').textContent = game || 'Match';
            // Find Date from scheduleData if possible, else generic
            const weekInfo = scheduleData.find(w => w.week === parseInt(week));
            document.getElementById('match-date').textContent = weekInfo ? weekInfo.date + ', 2026' : 'Jan 19, 2026';

            document.getElementById('detail-teamA-name').textContent = teamA;
            document.getElementById('detail-teamB-name').textContent = teamB;
            document.getElementById('detail-teamA-logo').innerHTML = getLogoImg(teamA, '100%');
            document.getElementById('detail-teamB-logo').innerHTML = getLogoImg(teamB, '100%');

            // Score Display
            document.getElementById('score-A').textContent = isReported ? scoreA : '-';
            document.getElementById('score-B').textContent = isReported ? scoreB : '-';

            // 3. Player Stats (Real Data)
            const statsContainer = document.querySelector('#player-stats-table tbody');
            const teamStatsContainer = document.getElementById('team-stats-content');

            if (!isReported) {
                statsContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">Match results not yet reported.</td></tr>';
                teamStatsContainer.innerHTML = '<p style="text-align:center; width:100%;">Stats pending match completion.</p>';
            } else {
                // Render Real Stats
                const stats = report.stats || {};

                // Helper to get roster for stats display
                const getTeamStatsRows = (team) => {
                    const roster = (rosterData[team] || []).filter(p => p.game === game);
                    if (roster.length === 0) return '';
                    return roster.map(p => {
                        const pStats = stats[p.name] || { k: 0, d: 0, a: 0 };
                        // Calculate specific metrics if needed, for now just K/D/A
                        // KD Ratio
                        const k = parseInt(pStats.k || 0);
                        const d = parseInt(pStats.d || 0);
                        const kd = d === 0 ? k : (k / d).toFixed(2);

                        // Link to Player Page (Task 24 Trigger)
                        const playerUrl = `player.html?player=${encodeURIComponent(p.name)}&team=${encodeURIComponent(team)}`;

                        return `
                        <tr>
                            <td>
                                <a href="${playerUrl}" style="text-decoration:none; color:inherit;">
                                    <div style="font-weight:bold; color:white;">${p.name}</div>
                                    <div style="font-size:0.8rem; opacity:0.7;">${team}</div>
                                </a>
                            </td>
                            <td>${k}</td>
                            <td>${d}</td>
                            <td>${pStats.a || 0}</td>
                            <td>${kd}</td>
                        </tr>`;
                    }).join('');
                };

                statsContainer.innerHTML = getTeamStatsRows(teamA) + getTeamStatsRows(teamB);

                // Mock Team Stats (Keep generic for now or calculate from player stats?)
                // Let's calculate total kills from player stats for realism
                // ... (simpler to keep mock for team aggregate metrics like "Possession" which we don't track)
                const metrics = ['Possession', 'Objective Time', 'Total Kills', 'Damage Dealt'];
                teamStatsContainer.innerHTML = metrics.map(stat => {
                    const valA = Math.floor(Math.random() * 100);
                    const valB = 100 - valA;
                    return `
                    <div class="stat-row">
                        <span>${valA}%</span>
                        <div class="stat-bar-container">
                            <div class="stat-label">${stat}</div>
                            <div class="stat-track">
                                 <div class="stat-fill" style="width: ${valA}%; left: 0;"></div>
                            </div>
                        </div>
                        <span>${valB}%</span>
                    </div>`;
                }).join('');
            }
        }
    }



    // Series Card Generator (Aggregated view)
    const createSeriesCard = (teamA, teamB, week, dateLabel) => {
        const isBye = teamB === 'BYE';

        return `
            <div class="match-card" style="border-top: 3px solid var(--accent-red)">
                <div class="match-header">
                    <span>${dateLabel}</span>
                    <span>FULL SERIES</span>
                </div>
                <div class="match-teams" style="padding: 1rem 0;">
                    <div class="team">
                        <div class="team-logo" style="width:70px; height:70px; font-size:1.5rem">${getLogoImg(teamA)}</div>
                        <div class="team-name" style="font-size:1.3rem">${teamA}</div>
                    </div>
                    <div class="vs" style="font-size:1.2rem">${isBye ? 'OFF' : 'VS'}</div>
                    <div class="team">
                        <div class="team-logo" style="width:70px; height:70px; font-size:1.5rem">${getLogoImg(teamB)}</div>
                        <div class="team-name" style="font-size:1.3rem">${teamB}</div>
                    </div>
                </div>
                ${!isBye ? `
                <div class="match-footer">
                    <a href="matchup.html?teamA=${encodeURIComponent(teamA)}&teamB=${encodeURIComponent(teamB)}&week=${week}" class="btn btn-primary" style="width: 100%; text-decoration:none; display:block; text-align:center">
                        View Series Details
                    </a>
                </div>` : ''}
            </div>
        `;
    };

    // --- State & Logic ---
    let activeGameFilter = 'all';

    const renderHomeSchedule = () => {
        const homeScheduleGrid = document.getElementById('schedule-grid');
        if (!homeScheduleGrid) return;

        // Flatten all matches to find this week's (Week 1) matches matching the filter
        const week1 = scheduleData.find(w => w.week === 1);
        if (!week1) return;

        let matches = week1.matches;

        if (activeGameFilter === 'all') {
            // Group by Opponents for "Series" view
            // Since our data structure is flat matches, we need to allow only unique pairings (TeamA vs TeamB)
            // The generation logic creates 4 sequential matches for standard pairings.
            // A simple way is to filter for just one game type (e.g. Rocket League) and use that to generate the Series Card
            // since every pairing plays every game.

            const uniquePairings = matches.filter(m => m.game === 'Rocket League');

            homeScheduleGrid.innerHTML = uniquePairings.map(m => createSeriesCard(m.teamA, m.teamB, 1, `Week 1 • ${week1.date}`)).join('');

        } else {
            // Filter by specific game
            matches = matches.filter(m => m.game === activeGameFilter);

            if (matches.length === 0) {
                homeScheduleGrid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted)">No ${activeGameFilter} matches scheduled for Week 1.</p>`;
            } else {
                homeScheduleGrid.innerHTML = matches.map(m => createMatchCard(m, `Week 1 • ${week1.date}`)).join('');
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
            document.getElementById('teamA-name').textContent = teamA;
            document.getElementById('teamB-name').textContent = teamB;

            document.getElementById('teamA-logo').innerHTML = getLogoImg(teamA);
            document.getElementById('teamB-logo').innerHTML = getLogoImg(teamB);

            const weekInfo = scheduleData.find(w => w.week === week);
            document.getElementById('matchup-meta').textContent = weekInfo ? `Week ${week} • ${weekInfo.date}` : `Week ${week}`;

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
            if (selectedTeam !== 'all') {
                filteredMatches = filteredMatches.filter(m =>
                    m.teamA === selectedTeam || m.teamB === selectedTeam
                );
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
            renderFullSchedule();
        }
    }

    // --- Standings Data ---
    const teams = ['Baylor', 'Boise State', 'Kansas', 'Michigan State', 'Minnesota', 'Nebraska', 'Ohio State', 'Syracuse', 'Utah'];

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
                            <div class="standings-team-logo">${getLogoImg(row.team, '90%')}</div>
                            <span>${row.team}</span>
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

    // --- Teams Page Logic ---
    const teamsGrid = document.getElementById('teams-grid');
    if (teamsGrid) {
        teamsGrid.innerHTML = teams.map(team => `
            <div class="team-card">
                <div class="team-card-logo">${getLogoImg(team, '80%')}</div>
                <h2>${team}</h2>
                <a href="team.html?id=${encodeURIComponent(team)}" class="btn btn-outline">Details</a>
            </div>
        `).join('');
    }

    // --- Team Detail Page Logic ---
    const teamHeroName = document.getElementById('team-hero-name');
    if (teamHeroName) {
        const params = new URLSearchParams(window.location.search);
        const teamId = params.get('id');

        if (teamId && teams.includes(teamId)) {
            // Update Hero
            teamHeroName.textContent = teamId;

            document.getElementById('team-hero-logo').innerHTML = getLogoImg(teamId, '80%');

            // Populate Schedule (Upcoming Matches - Series View)
            const teamScheduleGrid = document.getElementById('team-schedule-grid');
            if (teamScheduleGrid) {
                // Find weeks where this team is playing
                const teamWeeks = scheduleData.filter(week =>
                    week.matches.some(m => m.teamA === teamId || m.teamB === teamId)
                );

                if (teamWeeks.length > 0) {
                    teamScheduleGrid.innerHTML = teamWeeks.map(week => {
                        // Find the match object for this team to identify opponent
                        // Assuming all games in a week are against the same opponent for simplicity,
                        // or we find the first match involving this team.
                        const match = week.matches.find(m => m.teamA === teamId || m.teamB === teamId);

                        // Determine opponent
                        const opponent = match.teamA === teamId ? match.teamB : match.teamA;

                        // Use createSeriesCard (Team A, Team B, Week, Date)
                        // Ensure Team A is always the current team or just pass strictly
                        return createSeriesCard(match.teamA, match.teamB, week.week, `Week ${week.week} • ${week.date}`);
                    }).join('');
                } else {
                    teamScheduleGrid.innerHTML = '<p>No scheduled matches found.</p>';
                }

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

                // Initialize Roster
                renderTeamPageRoster();

                // Roster Filter Listener
                const gameFilterSelect = document.getElementById('team-game-filter');
                if (gameFilterSelect) {
                    gameFilterSelect.addEventListener('change', renderTeamPageRoster);
                }

                // --- Team Page Navigation Logic ---
                // (Existing logic continues below...)
                const viewSections = {
                    'schedule': document.getElementById('view-overview'), // Mapped to the view-overview ID but key 'schedule'
                    'roster': document.getElementById('view-roster'),
                    'stats': document.getElementById('view-stats')
                };

                // Switch logic...
                const tabButtons = document.querySelectorAll('.team-tab');
                tabButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        tabButtons.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        Object.values(viewSections).forEach(section => section.style.display = 'none');
                        viewSections[btn.dataset.tab].style.display = 'block';
                    });
                });

                // Mock Team Stats (Reusing match details style)
                const statsViewContainer = document.getElementById('team-stats-view-content');
                if (statsViewContainer) {
                    const metrics = ['Win Rate', 'Map Win %', 'Team KD', 'Objective Control'];
                    statsViewContainer.innerHTML = metrics.map(stat => {
                        const val = Math.floor(Math.random() * 40) + 50; // 50-90 range
                        return `
                        <div class="stat-row">
                            <span style="font-weight:400; font-size:0.9rem; width:150px;">${stat}</span>
                            <div class="stat-bar-container" style="text-align:left;">
                                <div class="stat-track" style="height:6px; background:#334155;">
                                     <div class="stat-fill" style="width: ${val}%; left: 0;"></div>
                                </div>
                            </div>
                            <span style="margin-left:1rem; font-weight:700;">${val}%</span>
                        </div>`;
                    }).join('');
                }
            }
        } else {
            teamHeroName.textContent = 'Team Not Found';
        }
    }

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
                let totalKills = 0;
                let totalDeaths = 0;
                let totalAssists = 0;
                let gamesPlayed = 0;
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

                            if (report && report.stats && report.stats[playerName]) {
                                const pStats = report.stats[playerName];
                                const k = parseInt(pStats.k || 0);
                                const d = parseInt(pStats.d || 0);
                                const a = parseInt(pStats.a || 0);

                                totalKills += k;
                                totalDeaths += d;
                                totalAssists += a;
                                gamesPlayed++;

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
                                        resultClass = 'status-LIVE'; // Reusing green/red logic if available, or custom
                                    } else {
                                        result = 'LOSS';
                                        resultClass = 'status-FINAL'; // Grey
                                    }
                                }

                                const opponent = match.teamA === teamName ? match.teamB : match.teamA;

                                matchHistory.push({
                                    opponent,
                                    result,
                                    date: week.date,
                                    k, d, a,
                                    week: week.week,
                                    game: match.game,
                                    teamA: match.teamA,
                                    teamB: match.teamB
                                });
                            }
                        }
                    });
                });

                // Render Stats
                document.getElementById('stat-total-kills').textContent = totalKills;
                document.getElementById('stat-total-assists').textContent = totalAssists;
                document.getElementById('stat-games-played').textContent = gamesPlayed;

                const kd = totalDeaths === 0 ? totalKills : (totalKills / totalDeaths).toFixed(2);
                document.getElementById('stat-kd-ratio').textContent = kd;

                // Render History
                const historyContainer = document.getElementById('player-match-history');
                if (matchHistory.length === 0) {
                    historyContainer.innerHTML = '<div style="padding:1rem; text-align:center;">No match data recorded yet.</div>';
                } else {
                    historyContainer.innerHTML = matchHistory.reverse().map(m => `
                        <a href="match-details.html?week=${m.week}&game=${encodeURIComponent(m.game)}&teamA=${encodeURIComponent(m.teamA)}&teamB=${encodeURIComponent(m.teamB)}" class="match-history-row">
                            <div style="font-weight:bold;">vs ${m.opponent}</div>
                            <div style="${m.result === 'WIN' ? 'color:#4ade80' : 'color:#ef4444'}">${m.result}</div>
                            <div style="font-family:'Chakra Petch'">${m.k} / ${m.d} / ${m.a}</div>
                            <div style="font-size:0.8rem; opacity:0.7;">${m.date}</div>
                        </a>
                    `).join('');
                }
            }
        }
    }

});
