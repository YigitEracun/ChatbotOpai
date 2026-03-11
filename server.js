const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*', // WordPress sitenizin URL'sini buraya koyun
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── OpenAI Client ───────────────────────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const WORKFLOW_ID = process.env.OPENAI_WORKFLOW_ID; // Agent Builder'dan aldığınız Workflow ID

// ─── Chat Endpoint ────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message, previousResponseId } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mesaj gerekli.' });
  }

  try {
    const params = {
      model: 'gpt-4o',
      input: message,
    };

    // Workflow ID varsa ekle
    if (WORKFLOW_ID) {
      params.workflow_id = WORKFLOW_ID;
    }

    // Konuşma geçmişi takibi
    if (previousResponseId) {
      params.previous_response_id = previousResponseId;
    }

    const response = await openai.responses.create(params);

    const outputText =
      response.output?.[0]?.content?.[0]?.text ?? 'Yanıt alınamadı.';

    res.json({
      id: response.id,
      text: outputText,
    });
  } catch (err) {
    console.error('OpenAI API hatası:', err.message);
    res.status(500).json({ error: 'Bir hata oluştu, lütfen tekrar deneyin.' });
  }
});

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Agent widget çalışıyor: http://localhost:${PORT}`);
});
