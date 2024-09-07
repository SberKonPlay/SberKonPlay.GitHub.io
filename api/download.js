const express = require('express');
const axios = require('axios');
const app = express();

app.get('/download', async (req, res) => {
    const fileId = '1iPpNpQ8hrzGjOET_BnTsayY-9eZuMjF8';
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
        const response = await axios.get(url, { responseType: 'stream' });
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send('Error downloading file');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
