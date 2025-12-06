import React, { useState, useRef, useEffect } from 'react';
import { AgentType, ToneType, Message } from './types';
import ChatMessage from './components/ChatMessage';
import SettingsPanel from './components/SettingsPanel';
import { sendMessageToGemini } from './services/geminiService';

const App: React.FC = () => {
  const [currentAgent, setCurrentAgent] = useState<AgentType>(AgentType.TOURIST);
  const [currentTone, setCurrentTone] = useState<ToneType>(ToneType.ENTHUSIASTIC);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '¡Hola! Bienvenido a Jerez de la Frontera. Soy tu guía personal. ¿En qué puedo ayudarte hoy? ¿Buscas los mejores tabancos, información sobre la Feria del Caballo, o quizás un espectáculo de flamenco?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAgentChange = (newAgent: AgentType) => {
    setCurrentAgent(newAgent);
    // Reset context message when switching agents
    const welcomeText = newAgent === AgentType.EMERGENCY
      ? 'MODO DE EMERGENCIA ACTIVADO. \nEstoy conectado a la red de servicios de Jerez. Por favor, indícame tu urgencia: Farmacia de guardia, Hospital, Policía o Objetos perdidos.'
      : '¡Hola de nuevo! Volvemos al modo turismo. ¿Qué te apetece descubrir ahora en Jerez?';
      
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: welcomeText,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare history for API (convert internal Message to API format)
      const apiHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await sendMessageToGemini(
        userMsg.text,
        apiHistory,
        currentAgent,
        currentTone
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        groundingUrls: response.groundingUrls
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Lo siento, ha ocurrido un error al conectar con el servidor. Por favor, inténtalo de nuevo.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* Top Navigation & Settings */}
      <SettingsPanel
        currentAgent={currentAgent}
        currentTone={currentTone}
        onAgentChange={handleAgentChange}
        onToneChange={setCurrentTone}
        onClearChat={() => setMessages([])}
      />

      {/* Main Chat Area */}
      <div 
        className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-colors duration-500 ${
          currentAgent === AgentType.EMERGENCY ? 'bg-red-50/30' : 'bg-albero-50/30'
        }`}
      >
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full mb-4 animate-fade-in">
              <div className="bg-white rounded-2xl rounded-bl-none px-5 py-4 shadow-sm border border-gray-100 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-bounce ${currentAgent === AgentType.EMERGENCY ? 'bg-red-500' : 'bg-sherry-600'}`}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce delay-100 ${currentAgent === AgentType.EMERGENCY ? 'bg-red-500' : 'bg-sherry-600'}`}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce delay-200 ${currentAgent === AgentType.EMERGENCY ? 'bg-red-500' : 'bg-sherry-600'}`}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentAgent === AgentType.EMERGENCY ? "Escribe tu emergencia aquí..." : "Pregunta sobre tapas, flamenco, hoteles..."}
              className={`w-full bg-gray-100 text-gray-900 placeholder-gray-500 border-0 rounded-xl px-4 py-3.5 focus:ring-2 focus:bg-white transition-all ${
                currentAgent === AgentType.EMERGENCY 
                  ? 'focus:ring-red-500' 
                  : 'focus:ring-sherry-500'
              }`}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 ${
                currentAgent === AgentType.EMERGENCY
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-sherry-600 hover:bg-sherry-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
              {currentAgent === AgentType.EMERGENCY 
                ? 'Para emergencias críticas, llama siempre al 112.' 
                : 'La IA puede cometer errores. Verifica la información importante.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;