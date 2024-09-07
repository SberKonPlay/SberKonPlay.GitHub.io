import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        // Перший запит на отримання сторінки або файла
        let response = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
        });

        // Якщо Google Drive запитує підтвердження
        if (response.status === 302) {
            const confirmUrl = response.headers.get('location');

            // Шукаємо параметр підтвердження (наприклад, confirm=t)
            const confirmationMatch = confirmUrl.match(/confirm=([0-9A-Za-z-_]+)/);

            if (confirmationMatch) {
                const confirmToken = confirmationMatch[1];
                const directDownloadUrl = `${url}&confirm=${confirmToken}`;

                // Виконуємо запит на підтверджене завантаження файлу
                response = await fetch(directDownloadUrl, { method: 'GET' });
            } else {
                return res.status(500).json({ error: 'Confirmation token not found' });
            }
        }

        // Якщо після підтвердження ми все ще не можемо отримати файл
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
