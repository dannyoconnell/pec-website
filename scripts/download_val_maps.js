const fs = require('fs');
const https = require('https');
const path = require('path');

const API_URL = 'https://valorant-api.com/v1/maps';
const DEST_DIR = path.join(__dirname, '../assets/maps/valorant');

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                res.resume();
                reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
                return;
            }
            const stream = fs.createWriteStream(filepath);
            res.pipe(stream);
            stream.on('finish', () => {
                stream.close();
                resolve();
            });
            stream.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    console.log('Fetching map data...');
    https.get(API_URL, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
            try {
                const json = JSON.parse(data);
                const maps = json.data;
                console.log(`Found ${maps.length} maps.`);

                for (const map of maps) {
                    if (!map.splash) continue;
                    // Filter out non-competitive/weird maps if needed, or just grab all valid named ones
                    // Some maps have weird names like "Basic Training" or "The Range". We'll keep them just in case.

                    const safeName = map.displayName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); // e.g. "ascent"
                    const destPath = path.join(DEST_DIR, `${safeName}.png`); // Using PNG as API returns PNG usually

                    console.log(`Downloading ${map.displayName} -> ${safeName}.png`);
                    try {
                        await downloadImage(map.splash, destPath);
                    } catch (err) {
                        console.error(`Error downloading ${map.displayName}:`, err.message);
                    }
                }
                console.log('All downloads complete.');
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        });
    }).on('error', err => {
        console.error('Error fetching API:', err);
    });
}

main();
