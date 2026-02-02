import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { ChatMessage, Role } from './types';
import { MessageBubble } from './components/MessageBubble';
import { generateHistoryResponse } from './services/geminiService';

const STORAGE_KEY_CHAT = 'viet_history_chat_log';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const storedChat = localStorage.getItem(STORAGE_KEY_CHAT);
    if (storedChat) {
      try {
        setMessages(JSON.parse(storedChat));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    } else {
      // Welcome message
      setMessages([{
        id: 'welcome',
        role: Role.MODEL,
        text: "Xin chào! Tôi là Trợ giảng Lịch sử Việt Nam.\n\nBạn có thắc mắc gì về các triều đại, các trận đánh lịch sử hay những nhân vật anh hùng của dân tộc không?\n\nVí dụ: 'Hãy kể về chiến thắng Bạch Đằng năm 938' hoặc 'Vua Quang Trung là ai?'",
        timestamp: Date.now()
      }]);
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Persist chat
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?")) {
      const resetMsg: ChatMessage = {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "Lịch sử đã được xóa. Chúng ta hãy bắt đầu chủ đề mới về Lịch sử Việt Nam nhé!",
        timestamp: Date.now()
      };
      setMessages([resetMsg]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: inputText.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Resize textarea reset
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      // We no longer pass an API key here
      const responseText = await generateHistoryResponse([...messages, userMsg], userMsg.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: `Lỗi: ${error.message}. Vui lòng kiểm tra lại kết nối server.`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputCheck = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div className="flex flex-col h-screen bg-history-paper text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-history-red text-history-gold shadow-md z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-wide hidden sm:block">Sử Việt AI Tutor</h1>
            <h1 className="font-bold text-xl tracking-wide sm:hidden">Sử Việt AI</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={clearHistory}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/90 hover:text-white"
              title="Xóa lịch sử chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col pt-4 pb-2">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex justify-start w-full mb-6 animate-in fade-in slide-in-from-bottom-2">
               <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                 <Loader2 className="w-5 h-5 text-history-red animate-spin" />
                 <span className="text-gray-500 text-sm">Thầy đồ đang suy nghĩ...</span>
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={handleInputCheck}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về Lịch sử Việt Nam (Shift+Enter để xuống dòng)..."
            className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-history-red/50 focus:border-history-red outline-none resize-none shadow-sm text-base max-h-[150px] overflow-y-auto"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-200 ${
              isLoading || !inputText.trim() 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-history-red text-white hover:bg-red-700 shadow-md transform hover:scale-105 active:scale-95'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-gray-400">
            AI có thể mắc lỗi. Hãy kiểm chứng thông tin quan trọng.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;