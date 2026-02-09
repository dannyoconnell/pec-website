import { env } from 'process';
const BALLCHASING_API_KEY = process.env.BALLCHASING_API_KEY || 'J1UM5OTMDPJsrKHtqWRLjyinwHeEJh6ilSdBRnnG';

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        // Just forward the request body directly to Ballchasing
        // The browser sends a multipart/form-data request, which Ballchasing expects.
        // We need to preserve the Content-Type header (including boundary).

        const contentType = req.headers.get('content-type');
        if (!contentType || !contentType.includes('multipart/form-data')) {
            return new Response("Content-Type must be multipart/form-data", { status: 400 });
        }

        const response = await fetch('https://ballchasing.com/api/v2/upload?visibility=public', {
            method: 'POST',
            headers: {
                'Authorization': BALLCHASING_API_KEY,
                'Content-Type': contentType // Pass through the boundary!
            },
            body: req.body, // Node 18+ / Netlify Edge functions support ReadableStream body
            duplex: 'half'
            // If this is a standard Lambda (Node < 18 or specific config), req.body might be a Buffer.
            // Netlify 'stream' functions vs standard functions differ.
            // Let's assume standard Node fetch can handle the stream or buffer.
        });

        const data = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify(data), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (error) {
        console.error("Upload Proxy Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
