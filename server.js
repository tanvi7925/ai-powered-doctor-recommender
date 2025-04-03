// Import required libraries
const express = require('express');
// const bodyParser = require('body-parser');
const { OpenAI } = require('openai'); // OpenAI SDK

// Initialize Express app
const app = express();
const PORT = 3000; // Port to run the server

// Set up OpenAI client with hardcoded API key (Not recommended for production)
const openai = new OpenAI({
  apiKey:process.env.OPENAI_API_KEY});

// Middleware to parse JSON request bodies
// app.use(bodyParser.json());
app.use(express.json());

// Function to generate a prompt for OpenAI model based on symptoms
const generatePrompt = (symptoms) => {
  return `
    Based on the following symptoms, suggest the appropriate medical specialization:
    Symptoms: ${symptoms.join(", ")}
    Please respond with only the specialization (e.g., "Pulmonologist", "Cardiologist", etc.).
  `;
};




// API endpoint to recommend doctor specialization based on symptoms
app.post('/recommend-doctor', async (req, res) => {
  const { symptoms } = req.body; // Get symptoms from the request body

  // Validate that symptoms are provided
  if (!symptoms || symptoms.length === 0) {
    return res.status(400).json({ error: "No symptoms provided" });
  }

  // Generate prompt to send to OpenAI model
  const promptText = generatePrompt(symptoms);

  try {
    // Request prediction from OpenAI
    const completion = await openai.completions.create({
      model: 'text-davinci-003', // GPT-3 model (you can also use GPT-4 if available)
      prompt: promptText,
      max_tokens: 50, // Limit response length to avoid long outputs
    });

    // Extract the recommended specialization from the OpenAI response
    const recommendedSpecialization = completion.choices[0].text.trim();

    // Send the recommendation back to the client
    res.json({ recommendedSpecialization });
  } catch (error) {
    console.error('Error while generating recommendation:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running at http://0.0.0.0:${PORT}`);
});
