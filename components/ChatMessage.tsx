import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Function to format text with bolding
  const formatText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex w-full mb-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm sm:text-base leading-relaxed ${
          isUser
            ? 'bg-sherry-700 text-white rounded-br-none'
            : message.isError 
              ? 'bg-red-100 text-red-800 border border-red-200 rounded-bl-none'
              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
        }`}
      >
        <div className="whitespace-pre-wrap">
          {formatText(message.text)}
        </div>

        {message.groundingUrls && message.groundingUrls.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <p className="text-xs font-semibold opacity-70 mb-1">Fuentes:</p>
            <div className="flex flex-wrap gap-2">
              {message.groundingUrls.map((url, idx) => (
                <a 
                  key={idx}
                  href={url.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs underline truncate max-w-[200px] ${isUser ? 'text-white/80 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  {url.title}
                </a>
              ))}
            </div>
          </div>
        )}
        
        <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-sherry-200' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;