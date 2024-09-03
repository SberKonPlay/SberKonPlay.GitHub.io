const https = require('https');

export default function handler(req, res) {
    const { url } = req.query; // Get the URL parameter from the query string

    if (!url) {
        // If no URL is provided, respond with a 400 error
        res.status(400).json({ error: "URL is required" });
        return;
    }

    // Perform a GET request to the provided URL
    https.get(url, (response) => {
        // Check for redirection
        const statusCode = response.statusCode;
        const location = response.headers.location;

        if (statusCode >= 300 && statusCode < 400 && location) {
            // If status code indicates a redirect and a location is present, return it
            res.status(200).json({ unshortened_url: location });
        } else if (statusCode >= 200 && statusCode < 300) {
            // If the URL is not a redirect, return the original URL (not shortened or already unshortened)
            res.status(200).json({ unshortened_url: url });
        } else {
            // If no redirection is found, return an error message
            res.status(400).json({ error: "Unable to unshorten URL, no redirection found." });
        }
    }).on('error', (err) => {
        // Handle any errors during the request
        res.status(500).json({ error: err.message });
    });
}
