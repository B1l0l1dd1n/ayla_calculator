import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { solveProblem } from '../services/geminiService';
import HolographicPanel from './HolographicPanel';
import Loader from './Loader';
import { SendIcon, PaperClipIcon, XCircleIcon, RobotIcon, UserIcon } from './Icons';

interface GeminiAssistantProps {
  initialPrompt?: string;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ initialPrompt }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setUserInput(initialPrompt);
    }
  }, [initialPrompt]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() && !imageFile) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userInput,
      imagePreview: imagePreview || undefined,
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);

    const prompt = userInput;
    let imageBase64: string | undefined;
    
    if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
    }

    // Clear inputs after capturing their state
    setUserInput('');
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = '';

    try {
      const responseText = await solveProblem(prompt, imageBase64, imageFile?.type);
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
      };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Извините, произошла ошибка. Пожалуйста, попробуйте снова.',
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HolographicPanel className="flex flex-col h-full w-full max-h-[90vh]">
      <h2 className="text-xl font-bold text-cyan-300 mb-4 text-center">A.Y.L.A. Assistant</h2>
      
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
             {msg.role === 'model' && <RobotIcon className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />}
            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-500/30 text-slate-100' : 'bg-cyan-800/20 text-slate-200'}`}>
              {msg.imagePreview && <img src={msg.imagePreview} alt="upload preview" className="rounded-md mb-2 max-h-48"/>}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
            {msg.role === 'user' && <UserIcon className="w-8 h-8 text-indigo-300 flex-shrink-0 mt-1" />}
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-3">
              <RobotIcon className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />
              <div className="max-w-xl p-3 rounded-lg bg-cyan-800/20">
                <Loader />
              </div>
           </div>
        )}
         <div ref={chatEndRef} />
      </div>

      <div className="mt-4 pt-4 border-t border-cyan-400/20">
        {imagePreview && (
          <div className="relative w-24 h-24 mb-2">
            <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-md"/>
            <button 
              onClick={() => {
                setImagePreview(null);
                setImageFile(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute -top-2 -right-2 bg-slate-800 rounded-full text-red-500 hover:text-red-400"
            >
              <XCircleIcon className="w-6 h-6"/>
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-slate-900/50 border border-cyan-400/30 rounded-lg p-2">
          <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden"/>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/20 rounded-full transition-colors"
          >
            <PaperClipIcon className="w-6 h-6"/>
          </button>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            }}
            placeholder="Спросите что-нибудь..."
            className="flex-grow bg-transparent focus:outline-none resize-none placeholder-cyan-600/70"
            rows={1}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || (!userInput.trim() && !imageFile)}
            className="p-2 text-cyan-300 disabled:text-gray-500 disabled:cursor-not-allowed hover:text-cyan-100 hover:bg-cyan-500/20 rounded-full transition-colors"
          >
            <SendIcon className="w-6 h-6"/>
          </button>
        </div>
      </div>
    </HolographicPanel>
  );
};

export default GeminiAssistant;