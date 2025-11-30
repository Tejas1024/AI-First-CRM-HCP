import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addChatMessage } from '../store';
import axios from 'axios';
import { Send, Bot, User } from 'lucide-react';

export default function ChatInterface() {
  const dispatch = useDispatch();
  const history = useSelector((state) => state.interaction.chatHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    dispatch(addChatMessage({ role: 'user', content: input }));
    setLoading(true);
    const currentInput = input;
    setInput('');

    try {
      const res = await axios.post('http://localhost:8000/chat/', {
        message: currentInput,
        history: history.map(h => h.content)
      });
      
      dispatch(addChatMessage({ role: 'ai', content: res.data.response }));
    } catch (e) {
      dispatch(addChatMessage({ role: 'ai', content: "Error connecting to AI Agent." }));
    }
    setLoading(false);
  };

  return (
    <div className="w-1/3 bg-white flex flex-col h-screen font-inter shadow-xl z-10">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
        <div className="bg-indigo-100 p-2 rounded-full">
            <Bot className="text-indigo-600 w-6 h-6" />
        </div>
        <div>
            <h2 className="font-bold text-gray-800">AI Assistant</h2>
            <p className="text-xs text-green-600 font-medium flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Active & Connected
            </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-900 shadow-sm">
           <strong>💡 Tip:</strong> You can say "I met Dr. Smith today and we discussed Product X." I will auto-fill the form for you!
        </div>
        
        {history.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-indigo-100'}`}>
                {msg.role === 'user' ? <User size={16} className="text-gray-600"/> : <Bot size={16} className="text-indigo-600"/>}
             </div>
             <div className={`p-3 rounded-lg text-sm max-w-[80%] shadow-sm ${
                 msg.role === 'user' 
                 ? 'bg-white text-gray-800 border border-gray-200' 
                 : 'bg-indigo-600 text-white'
             }`}>
                {msg.content}
             </div>
          </div>
        ))}
        
        {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-500 ml-12">
                <div className="animate-bounce">●</div>
                <div className="animate-bounce delay-100">●</div>
                <div className="animate-bounce delay-200">●</div>
                Processing with LangGraph Tools...
            </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="relative">
            <input 
                className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Describe your interaction..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
                onClick={handleSend} 
                disabled={loading}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
            >
                <Send size={16} />
            </button>
        </div>
      </div>
    </div>
  );
}