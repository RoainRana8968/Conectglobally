import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Brain } from 'lucide-react';

const AIChatbot = ({ interfaceCode = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'assistant',
        content: 'Hello! I am your AI design assistant powered by Groq. I can analyze your interface and provide actionable recommendations to improve UX/UI. What would you like to know about your dashboard?',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Analyze interface on first open if code is provided
  const analyzeInterface = async () => {
    if (!interfaceCode || hasAnalyzed) return;

    setHasAnalyzed(true);
    setIsLoading(true);
    setError(null);

    try {
      const analysisPrompt = `You are a professional UI/UX designer with expertise in React applications. Analyze this React dashboard component code and provide 3-5 specific, actionable recommendations to improve it. Focus on:

1. Visual hierarchy and layout
2. User experience and accessibility
3. Performance and code quality
4. Design consistency
5. Interactive elements and feedback

Here is the code:
${interfaceCode}

Provide recommendations in a clear, conversational tone. Be specific about what to change and why. Format your response with clear sections and bullet points for readability.`;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: analysisPrompt,
            },
          ],
        }),
      });

     if (!response.ok) {
  const errData = await response.json().catch(() => ({}));
  throw new Error(errData.error || `API error: ${response.statusText}`);
}
      const data = await response.json();
      const analysisContent = data.content || data.message?.content || 'Unable to analyze the interface. Please try again.';

      const assistantMessage = {
        id: `analysis-${Date.now()}`,
        type: 'assistant',
        content: analysisContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `I encountered an issue analyzing your interface: ${err.message}. Please make sure the API is configured correctly and try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to OpenAI
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Build context with interface code if available
      let contextMessage = inputValue;
      if (interfaceCode && !hasAnalyzed) {
        contextMessage = `User is asking about their dashboard interface. Here is the code for context:
${interfaceCode}

User question: ${inputValue}`;
      }

      // Prepare conversation history for OpenAI
      const conversationHistory = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...conversationHistory,
            {
              role: 'user',
              content: contextMessage,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantContent = data.content || data.message?.content || 'I am here to help! Could you ask me something specific about your dashboard design?';

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setHasAnalyzed(true);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again or rephrase your question.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle FAB click
  const handleFABClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && interfaceCode && !hasAnalyzed) {
      setTimeout(analyzeInterface, 500);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleFABClick}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group ${
          isOpen
            ? 'bg-cyan-500 hover:bg-cyan-600 scale-95'
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-110 animate-pulse'
        }`}
        aria-label="Open AI Chatbot"
        title="Click to open AI design assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Brain className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl bg-white/95 backdrop-blur-xl border border-white/20 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Design Assistant</h3>
                <p className="text-blue-100 text-xs">Powered by Groq</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none'
                  } animate-in fade-in slide-in-from-bottom-2 duration-200`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === 'user'
                        ? 'text-blue-100'
                        : 'text-slate-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-slate-600">
                   Groq is analyzing...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 px-4 py-3 rounded-lg rounded-bl-none border border-red-200">
                  <p className="text-sm text-red-700">
                    Warning: {error}
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 p-4 bg-white/50 backdrop-blur-sm rounded-b-2xl">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your design..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
