import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, Sparkles, Trash2, Bot, User, HelpCircle } from 'lucide-react';

export default function AIChatView() {
  const [query, setQuery] = useState('');
  
  // Chat dialogue session history list
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: "Hello! I am your CareerVault AI Assistant. Ask me anything about your job applications, certifications, or resume versions. I will fetch your profile data to help you prepare!"
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat window to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean HTML markdown renderer
  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text;
    
    // Convert code blocks
    html = html.replace(/`([^`]+)`/g, '<code class="bg-dark-950 border border-dark-800/60 px-1.5 py-0.5 rounded text-violet-300 font-mono text-[10px]">$1</code>');
    
    // Convert bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-dark-50">$1</strong>');
    
    // Convert bullet lists
    html = html.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        return `<li class="ml-4 list-disc pl-1 py-0.5 text-dark-300">${trimmed.substring(2)}</li>`;
      }
      if (trimmed.startsWith('* ')) {
        return `<li class="ml-4 list-disc pl-1 py-0.5 text-dark-300">${trimmed.substring(2)}</li>`;
      }
      return line;
    }).join('\n');
    
    // Convert line breaks
    html = html.replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Submit Query to Backend API
  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    // Prepare history payload for LLM context (exclude the initial model welcome)
    const historyPayload = messages.slice(1).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const res = await api.post('/chat', {
        message: userMessage.content,
        history: historyPayload
      });

      const assistantMessage = { role: 'model', content: res.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: "Error: I failed to compile a response. Please check your backend database connection."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset conversation log
  const handleClearChat = () => {
    if (!window.confirm('Clear all conversation logs?')) return;
    setMessages([
      {
        role: 'model',
        content: "Dialogue history cleared. Ask me a new query about your resume or applications!"
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto glass-panel rounded-2xl overflow-hidden animate-fade-in-up">
      {/* Chat window header panel */}
      <div className="px-6 py-4 border-b border-dark-800/40 bg-dark-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand" />
          <div>
            <h3 className="font-bold text-sm leading-snug">AI Career Assistant</h3>
            <p className="text-[10px] text-dark-400">Real-time profile context query assistant</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-dark-400 hover:text-red-400 p-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages list container viewport */}
      <div className="flex-grow p-6 overflow-y-auto space-y-4 scrollbar">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={index}
              className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar icons */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs border ${
                isUser 
                  ? 'bg-dark-850 text-brand border-brand/20' 
                  : 'bg-brand/10 text-brand border-brand/20'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message bubble */}
              <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                isUser 
                  ? 'bg-brand text-white rounded-tr-none' 
                  : 'bg-dark-900/80 border border-dark-800/50 rounded-tl-none'
              }`}>
                {isUser ? msg.content : renderMarkdown(msg.content)}
              </div>
            </div>
          );
        })}

        {/* Active typing loader bubble */}
        {isLoading && (
          <div className="flex items-start gap-3 mr-auto max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand border border-brand/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-dark-900/80 border border-dark-800/50 px-4 py-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts footer wrapper */}
      {messages.length === 1 && (
        <div className="px-6 py-2 flex flex-wrap gap-2 items-center bg-dark-900/20 border-t border-dark-800/10">
          <HelpCircle className="w-3.5 h-3.5 text-dark-500" />
          <span className="text-[10px] text-dark-500 mr-2 font-medium">Try asking:</span>
          {[
            'Which companies did I apply to?',
            'What certificates do I have?',
            'List my resume versions'
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => setQuery(promptText)}
              className="bg-dark-900 hover:bg-dark-850 border border-dark-800 hover:border-dark-700 text-[9px] text-dark-400 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>
      )}

      {/* Input panel footer */}
      <div className="p-4 border-t border-dark-800/40 bg-dark-900/30">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            placeholder="Type your question about your portfolio (e.g. List my applications)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="w-full bg-dark-900/80 border border-dark-800 focus:border-brand rounded-xl pl-4 pr-12 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all text-dark-50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand hover:bg-brand-hover text-white rounded-lg disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
