// Lore Proxy Server for Render
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

const BASE_URL = 'https://tbc3d.com/wp-json/sueniverse/v1';
const API_KEY = 'TBC_LORE_KEY'; // Replace with ENV VAR for security

const proxyPost = (endpoint) => async (req, res) => {
  try {
	console.log('Incoming headers:', req.headers);
    console.log('Incoming body:', req.body);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`POST ${endpoint} failed:`, err);
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
};

const proxyGet = (endpointBuilder) => async (req, res) => {
  try {
    const endpoint = endpointBuilder(req);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`GET ${endpointBuilder(req)} failed:`, err);
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
};

app.get('/ping', proxyGet(() => '/ping'));
app.post('/insert-lore', proxyPost('/insert-lore'));
app.post('/insert-species', proxyPost('/insert-species'));
app.get('/list-species', proxyGet(() => '/list-species'));
app.get('/get-species/:slug', proxyGet((req) => `/get-species/${req.params.slug}`));
app.post('/check-lore-status', proxyPost('/check-lore-status'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lore proxy running on port ${PORT}`));
