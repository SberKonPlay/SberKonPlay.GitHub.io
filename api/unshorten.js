const https = require('https');

export default function handler(req, res) {
    const { url } = req.query; // Get the URL parameter from the query string

    if (!url) {
        // If no URL is provided, respond with a 400 error
        res.status(400).json({ error: "URL is required" });
        return;
    }

    // Make a request to the given URL
    https.get(url, (response) => {
        // Getting the final URL after redirection
        const location = response.headers.location;

        if (location) {
            // If there is a redirection, return the unshortened URL
            res.status(200).json({ unshortened_url: location });
        } else {
            // If no redirection is found, return an error
            res.status(400).json({ error: "Unable to unshorten URL" });
        }
    }).on('error', (err) => {
        // Handle any errors during the request
        res.status(500).json({ error: err.message });
    });
}
