require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.get('/dev_token', (req, res) => {
    res.json({ dev_token: process.env.DEV_TOKEN });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
})

app.use(express.static(path.join(__dirname, 'src')));

app.listen(3000);
