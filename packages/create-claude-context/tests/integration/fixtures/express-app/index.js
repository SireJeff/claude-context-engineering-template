const express = require('express');
const app = express();

app.get('/users', (req, res) => res.json([]));
app.post('/users', (req, res) => res.json({}));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
