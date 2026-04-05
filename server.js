const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors());

const GROQ_KEY = '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';

app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
        temperature: 0.85,
        messages: [
          { role: 'system', content: `You are Jarvis — a brilliant, witty, and deeply human AI assistant. You think fast and speak naturally like a real person. You remember everything in this conversation and can help with absolutely anything: questions, advice, writing, ideas, planning, coding, research, or just talking. Keep answers to 1-3 sentences unless asked for more. Never use bullet points or markdown. Never start with filler words like "Certainly" or "Of course". Be sharp, warm, direct, and occasionally funny.` },
          ...messages
        ]
      })
    });
    const data = await r.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    res.json({ reply: data.choices[0].message.content.trim() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.send('Jarvis online.'));
app.listen(process.env.PORT || 3000, () => console.log('Jarvis backend running'));
