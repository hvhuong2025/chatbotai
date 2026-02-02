import React from 'react';
import { User, Bot, AlertTriangle } from 'lucide-react';
import { ChatMessage, Role } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1 ${
          isUser ? 'bg-indigo-600' : isError ? 'bg-red-100' : 'bg-history-red'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : isError ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <Bot className="w-5 h-5 text-history-gold" />
          )}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-5 py-3.5 rounded-2xl text-base leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
              isUser
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : isError
                ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-none'
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}
          >
            {/* Simple Bold/List rendering logic via dangerouslySetInnerHTML would be better with a library, 
                but using raw text + css whitespace is safer for "handful of files" constraint. 
                The CSS `whitespace-pre-wrap` in the className handles newlines correctly. 
            */}
            {message.text}
          </div>
          <span className="text-xs text-gray-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};