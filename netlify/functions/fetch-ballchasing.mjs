const BALLCHASING_API_KEY = 'J1UM5OTMDPJsrKHtqWRLjyinwHeEJh6ilSdBRnnG';

export default async (req, context) => {
    try {
        const url = new URL(req.url);
        const targetUrl = url.searchParams.get('url');

        if (!targetUrl) {
            return new Response("Missing 'url' query parameter", { status: 400 });
        }

        const response = await fetch(targetUrl, {
            headers: {
                'Authorization': BALLCHASING_API_KEY
            }
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Allow any origin for this simple proxy
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
