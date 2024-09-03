export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is missing' });
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
      }
    });

    if (!response || !response.url) {
      throw new Error('No response from fetch');
    }

    return res.status(200).json({ expandedUrl: response.url });
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ error: 'Error unshortening URL' });
  }
}
