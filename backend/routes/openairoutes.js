const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
});

router.post('/review-project', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        console.log('📝 Reviewing project...');

        // TRY THESE MODEL NAMES (one of them should work)
        const modelName = 'gemini-1.5-flash'; // or try others below
        
        const result = await ai.models.generateContent({
            model: modelName,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { 
                            text: `You are a senior software developer and architect. 
                                   Your job is to review code and projects, 
                                   providing detailed, actionable feedback on:
                                   - Code quality and best practices
                                   - Architecture and design patterns
                                   - Performance optimizations
                                   - Security vulnerabilities
                                   - Areas for improvement
                                   
                                   Format your response with clear sections and bullet points.
                                   
                                   Here is my project to review:
                                   ${message}`
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
            }
        });

        console.log('✅ Review complete');

        const reply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

        res.status(200).json({
            success: true,
            reply: reply,
        });

    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Failed to get response from Gemini',
        });
    }
});

module.exports = router;