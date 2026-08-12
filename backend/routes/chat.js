const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request. Please provide an array of messages.',
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY is not set');
      return res.status(500).json({
        error: 'Groq API key is not configured.',
      });
    }

    const systemMessage = {
      role: 'system',
      content: 'You are an expert UI/UX designer with deep knowledge of React, accessibility, and modern design principles. Provide specific, actionable recommendations for improving interfaces. Be conversational and helpful.',
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      return res.status(response.status).json({
        error: errorData.error?.message || 'Failed to get response from Groq',
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return res.status(500).json({
        error: 'No response received from Groq',
      });
    }

    res.json({
      content: assistantMessage,
      message: { content: assistantMessage },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred',
    });
  }
});

module.exports = router;
