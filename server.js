const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://preeminent-fox-c28b40.netlify.app' }));

const GROQ_KEY = 'gsk_ceb635582205f6d88f025c76a5df9338ba7f22f2bc9743f7';
const XI_KEY   = 'sk_ceb635582205f6d88f025c76a5df9338ba7f22f2bc9743f7';
const XI_VOICE = 'pNInz6obpgDQGcFmaJgB'; // Adam — deep natural male

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 150,
        messages: [
          {
            role: 'system',
            content: `You are Jarvis — a highly intelligent, calm, and natural AI assistant. You speak like a real thoughtful person, not a robot. Keep responses to 1-3 sentences. Never use bullet points or markdown. Never start with "Certainly", "Of course", "Great question", or any filler. Be direct, warm, witty when appropriate. You can help with any task — answering questions, giving advice, planning, research, or just having a real conversation. When the user asks you to open a website or search something, confirm you're doing it in one short sentence.`
          },
          ...messages
        ]
      })
    });
    const data = await r.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    res.json({ reply: data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Voice endpoint
app.post('/speak', async (req, res) => {
  const { text } = req.body;
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${XI_VOICE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': XI_KEY },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: { stability: 0.45, similarity_boost: 0.82, style: 0.3, use_speaker_boost: true }
      })
    });
    if (!r.ok) {
      const err = await r.text();
      return res.status(400).json({ error: err });
    }
    res.set('Content-Type', 'audio/mpeg');
    r.body.pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.send('Jarvis backend running.'));

app.listen(3000, () => console.log('Jarvis backend on port 3000'));
