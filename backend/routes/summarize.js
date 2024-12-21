const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/summarize', async (req, res) => {
  const { text } = req.body;

  // Check if text exists in the request body
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Text is required for summarization" });
  }

  try {
    // Sending the prompt to OpenAI's chat API using the gpt-3.5-turbo model
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that summarizes text concisely and clearly.'
          },
          {
            role: 'user',
            content: `Summarize the following text:\n\n${text}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extracting the summary from the API response
    const summary = response.data.choices[0].message.content.trim();
    
    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing text:", error);
    // Sending detailed error information in response for easier debugging
    res.status(500).json({ error: "Error generating summary", details: error.message });
  }
});

module.exports = router;
