const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WORKFLOW_ID = process.env.OPENAI_WORKFLOW_ID;

// ChatKit session endpoint
app.post('/api/chatkit/session', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY,
        'OpenAI-Beta': 'chatkit_beta=v1',
      },
      body: JSON.stringify({
        workflow: { id: WORKFLOW_ID },
        user: 'user-' + Date.now(),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI hata:', err);
      return res.status(response.status).json({ error: 'Session oluşturulamadı.' });
    }

    const data = await response.json();
    res.json({ client_secret: data.client_secret });
  } catch (err) {
    console.error('Session hatası:', err.message);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
