addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url)
    const redditUrl = url.searchParams.get('url')

    if (!redditUrl) {
        return new Response(JSON.stringify({ error: "URL is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    try {
        const response = await fetch(redditUrl, {
            redirect: 'manual' // Do not follow redirects automatically
        })
        const location = response.headers.get('location')

        if (location) {
            return new Response(JSON.stringify({ unshortened_url: location }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            })
        } else {
            return new Response(JSON.stringify({ error: "Unable to unshorten URL" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
