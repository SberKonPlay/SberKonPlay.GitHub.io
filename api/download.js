import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        // Перший запит на отримання файлу або перенаправлення на сторінку підтвердження
        let response = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
        });

        // Перевірка на перенаправлення для підтвердження
        if (response.status === 302) {
            const confirmUrl = response.headers.get('location');

            // Підтверджуємо завантаження, якщо URL містить токен підтвердження
            const confirmationMatch = confirmUrl.match(/confirm=([0-9A-Za-z-_]+)/);
            if (confirmationMatch) {
                const confirmToken = confirmationMatch[1];
                const directDownloadUrl = `${url}&confirm=${confirmToken}`;

                // Повторний запит на завантаження файлу після підтвердження
                response = await fetch(directDownloadUrl, { method: 'GET' });
            } else {
                return res.status(500).json({ error: 'Confirmation token not found' });
            }
        }

        // Якщо відповідь містить HTML, обробляємо її як сторінку підтвердження
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            // Витягуємо токен підтвердження з HTML
            const html = await response.text();
            const tokenMatch = html.match(/confirm=([0-9A-Za-z-_]+)/);

            if (tokenMatch) {
                const confirmToken = tokenMatch[1];
                const directDownloadUrl = `${url}&confirm=${confirmToken}`;

                // Повторний запит після підтвердження
                response = await fetch(directDownloadUrl, { method: 'GET' });
            } else {
                return res.status(500).json({ error: 'Failed to extract confirmation token from HTML' });
            }
        }

        // Якщо після цього відповідь не окей, повертаємо помилку
        if (!response.ok) {
            return res.status(500).json({ error: 'Failed to download the file after confirmation' });
        }

        // Витягуємо назву файлу з заголовка
        const contentDisposition = response.headers.get('content-disposition');
        const fileNameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
        const fileName = fileNameMatch ? fileNameMatch[1] : 'downloaded-file';

        // Надсилаємо файл у відповідь
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Передаємо стрім у відповідь
        response.body.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Failed to download the file' });
    }
}
