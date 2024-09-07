import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        // Перший запит для отримання файлу або сторінки підтвердження
        let response = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
        });

        // Якщо Google Drive потребує підтвердження
        if (response.status === 302 && response.headers.get('location').includes('confirm')) {
            const confirmUrl = response.headers.get('location');
            
            // Виконуємо підтвердження завантаження файлу
            response = await fetch(confirmUrl, { method: 'GET' });
        }

        // Якщо після цього ми отримали сторінку з підтвердженням (коли файл великий)
        if (!response.ok) {
            return res.status(500).json({ error: 'Failed to download the file' });
        }

        // Отримуємо оригінальну назву файлу з заголовків
        const contentDisposition = response.headers.get('content-disposition');
        const fileNameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
        const fileName = fileNameMatch ? fileNameMatch[1] : 'downloaded-file';

        // Створюємо стрім і надсилаємо файл як відповідь
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        response.body.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Failed to download the file' });
    }
}
