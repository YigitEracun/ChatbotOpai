const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const WORKFLOW_ID = process.env.OPENAI_WORKFLOW_ID;

// ChatKit session endpoint — frontend buradan client_secret alır
app.post('/api/chatkit/session', async (req, res) => {
  try {
    const session = await openai.chatkit.sessions.create({
      workflow_id: WORKFLOW_ID,
      user: 'user-' + Date.now(), // Her ziyaretçi için benzersiz ID
    });

    res.json({ client_secret: session.client_secret });
  } catch (err) {
    console.error('ChatKit session hatası:', err.message);
    res.status(500).json({ error: 'Session oluşturulamadı.' });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
