const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/download', async (req, res) => {
    const fileUrl = req.query.url;
    if (!fileUrl) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await axios.get(fileUrl, { responseType: 'stream' });
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send('Error downloading file');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
