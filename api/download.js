import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        // Завантаження файлу з Google Drive
        let response = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
        });

        // Перевірка чи є перенаправлення на підтвердження
        if (response.status === 302 && response.headers.get('location').includes('confirm')) {
            const confirmUrl = response.headers.get('location');
            response = await fetch(confirmUrl, { method: 'GET' });
        }

        // Надсилаємо файл як відповідь
        const fileStream = await response.body;

        res.setHeader('Content-Disposition', 'attachment');
        res.setHeader('Content-Type', 'application/octet-stream');
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Failed to download the file' });
    }
}
