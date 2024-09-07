import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        // Перший запит на отримання файлу
        let response = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
        });

        // Якщо Google потребує підтвердження завантаження (коли файл великий)
        if (response.status === 302 && response.headers.get('location').includes('confirm')) {
            // Отримуємо підтверджуючу URL
            const confirmUrl = response.headers.get('location');
            
            // Підтверджуємо завантаження
            response = await fetch(confirmUrl, { method: 'GET' });
        }

        // Якщо статус не OK після підтвердження
        if (!response.ok) {
            return res.status(500).json({ error: 'Failed to download the file after confirmation' });
        }

        // Витягуємо назву файлу з заголовка
        const contentDisposition = response.headers.get('content-disposition');
        const fileNameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
        const fileName = fileNameMatch ? fileNameMatch[1] : 'downloaded-file';

        // Надсилаємо файл користувачеві
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Передаємо стрім у відповідь
        response.body.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Failed to download the file' });
    }
}
