const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
const PORT = 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const generatePrompt = (symptoms) => `
Based on the following symptoms, suggest the appropriate medical specialization:
Symptoms: ${symptoms.join(", ")}
Respond with only the specialization (e.g., "Pulmonologist", "Cardiologist", etc.).
`;

app.post('/recommend-doctor', async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || !symptoms.length) {
    return res.status(400).json({ error: "Symptoms required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: generatePrompt(symptoms) }
      ],
      max_tokens: 50,
    });

    const result = completion.choices[0].message.content.trim();
    res.json({ recommendedSpecialization: result });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
