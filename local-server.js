const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = 8082;
const BALLCHASING_API_KEY = 'J1UM5OTMDPJsrKHtqWRLjyinwHeEJh6ilSdBRnnG';

// Mime Types
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // --- API LOGIC (Persistence Fallback) ---
    if (pathname === '/api/save-school' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const schoolData = JSON.parse(body);
                const dbPath = path.join(__dirname, 'db', 'schools.json');
                
                // Ensure db directory exists
                if (!fs.existsSync(path.join(__dirname, 'db'))) {
                    fs.mkdirSync(path.join(__dirname, 'db'));
                }

                // Load existing or init
                let schools = {};
                if (fs.existsSync(dbPath)) {
                    schools = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                }

                // Update specific team
                schools[schoolData.name] = {
                    logo: schoolData.logo_url,
                    campusImage: schoolData.campus_image,
                    primaryColor: schoolData.primary_color,
                    games: schoolData.games
                };

                fs.writeFileSync(dbPath, JSON.stringify(schools, null, 2));
                console.log(`Saved school info for ${schoolData.name}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error("Save Error:", err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // --- PROXY LOGIC ---
    if (pathname === '/.netlify/functions/fetch-ballchasing') {
        const targetUrl = parsedUrl.query.url;
        if (!targetUrl) {
            res.writeHead(400);
            res.end("Missing url param");
            return;
        }

        console.log(`Proxying: ${targetUrl}`);

        try {
            // New native fetch in Node 18+ (since user has Node v24)
            const apiRes = await fetch(targetUrl, {
                headers: { 'Authorization': BALLCHASING_API_KEY }
            });
            const data = await apiRes.json();

            res.writeHead(apiRes.status, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(data));
        } catch (err) {
            console.error("Proxy Error:", err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // --- STATIC FILE SERVER ---

    // Default to index.html
    if (pathname === '/') pathname = '/index.html';

    // Prevent directory traversal
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, safePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`404: ${pathname}`);
                res.writeHead(404);
                res.end(`File not found: ${pathname}`);
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Proxy endpoint available at http://localhost:${PORT}/.netlify/functions/fetch-ballchasing`);
});
