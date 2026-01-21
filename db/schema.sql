-- Matches Table
-- Stores schedule, scores, and detailed reporting data
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    week INTEGER NOT NULL,
    game TEXT NOT NULL,
    team_a TEXT NOT NULL,
    team_b TEXT NOT NULL,
    score_a INTEGER DEFAULT 0,
    score_b INTEGER DEFAULT 0,
    status TEXT DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'LIVE', 'FINAL'
    date TEXT, -- Display date string, e.g. "Jan 19"
    time TEXT, -- Display time string, e.g. "8:00 PM EST"
    report_data JSONB -- Stores player stats { "PlayerName": {k,d,a} } and ballchasing URLs
);

-- Rosters Table
-- Stores team rosters
CREATE TABLE IF NOT EXISTS rosters (
    id SERIAL PRIMARY KEY,
    team TEXT NOT NULL,
    player_name TEXT NOT NULL,
    role TEXT, -- 'Captain', 'Starter', 'Sub'
    game TEXT -- 'Rocket League', etc.
);
